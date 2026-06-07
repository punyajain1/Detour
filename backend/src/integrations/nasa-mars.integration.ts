import axios from 'axios';
import { NasaMarsCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

const NEBULUM_BASE = 'https://rovers.nebulum.one/api/v1';

interface NebulumPhoto {
  id: number;
  sol: number;
  earth_date: string;
  img_src: string;
  camera: { id: number; name: string; rover_id: number; full_name: string };
  rover: { id: number; name: string; landing_date: string; status: string | null };
}

interface NebulumResponse {
  photos: NebulumPhoto[];
}

const ROVER_CAMERAS: Record<string, string> = {
  FHAZ:                 'Front Hazard Avoidance Camera',
  RHAZ:                 'Rear Hazard Avoidance Camera',
  MAST:                 'Mast Camera',
  CHEMCAM:              'Chemistry & Camera Complex',
  MAHLI:                'Mars Hand Lens Imager',
  MARDI:                'Mars Descent Imager',
  NAVCAM:               'Navigation Camera',
  PANCAM:               'Panoramic Camera',
  MINITES:              'Miniature Thermal Emission Spectrometer',
  EDLCAM:               'Entry, Descent, and Landing Camera',
  MCZ_RIGHT:            'Mastcam-Z Right',
  MCZ_LEFT:             'Mastcam-Z Left',
  FRONT_HAZCAM_LEFT_A:  'Front Hazard Camera (Left)',
  FRONT_HAZCAM_RIGHT_A: 'Front Hazard Camera (Right)',
  REAR_HAZCAM_LEFT:     'Rear Hazard Camera (Left)',
  REAR_HAZCAM_RIGHT:    'Rear Hazard Camera (Right)',
  NAVCAM_LEFT:          'Navigation Camera (Left)',
  NAVCAM_RIGHT:         'Navigation Camera (Right)',
  SKYCAM:               'MEDA Skycam',
  SHERLOC_WATSON:       'SHERLOC WATSON Camera',
  SUPERCAM_RMI:         'SuperCam Remote Micro-Imager',
};

const ROVER_URL: Record<string, string> = {
  perseverance: 'https://mars.nasa.gov/mars2020/multimedia/raw-images/',
  curiosity:    'https://mars.nasa.gov/msl/multimedia/raw-images/',
};

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function offsetEarthDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateStr(d);
}

export class NasaMarsIntegration {
  private static async fetchByEarthDate(
    rover: string,
    startDate: string,
    maxDaysBack = 14
  ): Promise<NebulumPhoto[]> {
    for (let offset = 0; offset <= maxDaysBack; offset++) {
      const date = offsetEarthDays(startDate, -offset);
      try {
        const { data } = await axios.get<NebulumResponse>(
          `${NEBULUM_BASE}/rovers/${rover}/photos`,
          { params: { earth_date: date }, timeout: 12000 }
        );
        if (data.photos?.length) return data.photos;
      } catch (err: any) {
        console.warn(`[NasaMars] ${rover} on ${date}: ${err?.message ?? err}`);
      }
    }
    return [];
  }

  static async getLatestPhotos(count = 6): Promise<NasaMarsCard[]> {
    const today = toDateStr(new Date());
    const rovers = ['perseverance', 'curiosity'];
    const results: NasaMarsCard[] = [];
    const perRover = Math.ceil(count / rovers.length);

    for (const rover of rovers) {
      if (results.length >= count) break;

      try {
        const photos = await this.fetchByEarthDate(rover, today);
        if (!photos.length) continue;

        const shuffled = photos.filter(p => p.img_src).sort(() => Math.random() - 0.5);
        const seenCameras = new Set<string>();

        for (const photo of shuffled) {
          if (results.length >= count || seenCameras.size >= perRover) break;
          if (seenCameras.has(photo.camera.name)) continue;
          seenCameras.add(photo.camera.name);

          const cameraFull = ROVER_CAMERAS[photo.camera.name] ?? photo.camera.full_name ?? photo.camera.name;

          results.push({
            id: uuid(),
            type: 'nasa_mars',
            category: 'space',
            fetchedAt: new Date().toISOString(),
            title: `${photo.rover.name} on Mars — Sol ${photo.sol}`,
            description: `Captured by the ${cameraFull} on the ${photo.rover.name} rover. Sol ${photo.sol} corresponds to Earth date ${photo.earth_date}.`,
            imageUrl: photo.img_src,
            url: ROVER_URL[rover] ?? 'https://mars.nasa.gov/',
            metadata: {
              rover: photo.rover.name,
              camera: cameraFull,
              sol: photo.sol,
              earthDate: photo.earth_date,
              photoId: photo.id,
            },
          });
        }
      } catch (err) {
        console.warn(`[NasaMars] Failed to fetch ${rover}:`, err instanceof Error ? err.message : err);
      }
    }

    return results;
  }
}
