import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { ArxivData } from '../types/feed.types';

export class ArxivIntegration {
  private static BASE = 'http://export.arxiv.org/api/query';
  // Full arXiv taxonomy — Computer Science, Electrical Engineering & Systems Science, Physics
  // Source: https://arxiv.org/category_taxonomy
  private static CATEGORIES = [
    // ── Computer Science ──────────────────────────────────────────────
    'cs.AI',   // Artificial Intelligence
    'cs.AR',   // Hardware Architecture
    'cs.CC',   // Computational Complexity
    'cs.CE',   // Computational Engineering, Finance, and Science
    'cs.CG',   // Computational Geometry
    'cs.CL',   // Computation and Language (NLP)
    'cs.CR',   // Cryptography and Security
    'cs.CV',   // Computer Vision and Pattern Recognition
    'cs.CY',   // Computers and Society
    'cs.DB',   // Databases
    'cs.DC',   // Distributed, Parallel, and Cluster Computing
    'cs.DL',   // Digital Libraries
    'cs.DM',   // Discrete Mathematics
    'cs.DS',   // Data Structures and Algorithms
    'cs.ET',   // Emerging Technologies
    'cs.FL',   // Formal Languages and Automata Theory
    'cs.GL',   // General Literature
    'cs.GR',   // Graphics
    'cs.GT',   // Computer Science and Game Theory
    'cs.HC',   // Human-Computer Interaction
    'cs.IR',   // Information Retrieval
    'cs.IT',   // Information Theory
    'cs.LG',   // Machine Learning
    'cs.LO',   // Logic in Computer Science
    'cs.MA',   // Multiagent Systems
    'cs.MM',   // Multimedia
    'cs.MS',   // Mathematical Software
    'cs.NA',   // Numerical Analysis
    'cs.NE',   // Neural and Evolutionary Computing
    'cs.NI',   // Networking and Internet Architecture
    'cs.OS',   // Operating Systems
    'cs.PF',   // Performance
    'cs.PL',   // Programming Languages
    'cs.RO',   // Robotics
    'cs.SC',   // Symbolic Computation
    'cs.SD',   // Sound
    'cs.SE',   // Software Engineering
    'cs.SI',   // Social and Information Networks
    'cs.SY',   // Systems and Control (alias for eess.SY)

    // ── Electrical Engineering and Systems Science ─────────────────────
    'eess.AS', // Audio and Speech Processing
    'eess.IV', // Image and Video Processing
    'eess.SP', // Signal Processing
    'eess.SY', // Systems and Control

    // ── Physics: Astrophysics ──────────────────────────────────────────
    'astro-ph.CO', // Cosmology and Nongalactic Astrophysics
    'astro-ph.EP', // Earth and Planetary Astrophysics
    'astro-ph.GA', // Astrophysics of Galaxies
    'astro-ph.HE', // High Energy Astrophysical Phenomena
    'astro-ph.IM', // Instrumentation and Methods for Astrophysics
    'astro-ph.SR', // Solar and Stellar Astrophysics

    // ── Physics: Condensed Matter ──────────────────────────────────────
    'cond-mat.dis-nn',  // Disordered Systems and Neural Networks
    'cond-mat.mes-hall',// Mesoscale and Nanoscale Physics
    'cond-mat.mtrl-sci',// Materials Science
    'cond-mat.quant-gas',// Quantum Gases
    'cond-mat.soft',    // Soft Condensed Matter
    'cond-mat.stat-mech',// Statistical Mechanics
    'cond-mat.str-el',  // Strongly Correlated Electrons
    'cond-mat.supr-con',// Superconductivity

    // ── Physics: Other ─────────────────────────────────────────────────
    'gr-qc',           // General Relativity and Quantum Cosmology
    'hep-ex',          // High Energy Physics - Experiment
    'hep-lat',         // High Energy Physics - Lattice
    'hep-ph',          // High Energy Physics - Phenomenology
    'hep-th',          // High Energy Physics - Theory
    'math-ph',         // Mathematical Physics
    'nucl-ex',         // Nuclear Experiment
    'nucl-th',         // Nuclear Theory
    'quant-ph',        // Quantum Physics

    // ── Physics: General Physics subcategories ─────────────────────────
    'physics.acc-ph',  // Accelerator Physics
    'physics.ao-ph',   // Atmospheric and Oceanic Physics
    'physics.app-ph',  // Applied Physics
    'physics.atm-clus',// Atomic and Molecular Clusters
    'physics.atom-ph', // Atomic Physics
    'physics.bio-ph',  // Biological Physics
    'physics.chem-ph', // Chemical Physics
    'physics.class-ph',// Classical Physics
    'physics.comp-ph', // Computational Physics
    'physics.data-an', // Data Analysis, Statistics and Probability
    'physics.flu-dyn', // Fluid Dynamics
    'physics.geo-ph',  // Geophysics
    'physics.ins-det', // Instrumentation and Detectors
    'physics.med-ph',  // Medical Physics
    'physics.optics',  // Optics
    'physics.plasm-ph',// Plasma Physics
    'physics.pop-ph',  // Popular Physics
    'physics.soc-ph',  // Physics and Society
    'physics.space-ph',// Space Physics

    // ── Nonlinear Sciences ─────────────────────────────────────────────
    'nlin.AO', // Adaptation and Self-Organizing Systems
    'nlin.CD', // Chaotic Dynamics
    'nlin.CG', // Cellular Automata and Lattice Gases
    'nlin.PS', // Pattern Formation and Solitons
    'nlin.SI', // Exactly Solvable and Integrable Systems
  ];

  /**
   * Fetch papers from ALL categories, `perCategory` papers each.
   * Requests are batched (10 at a time) with a short pause to avoid
   * hammering the arXiv API. Results are deduplicated by paper ID.
   *
   * @param perCategory  papers to fetch per category (default 3)
   */
  public static async getRandomPapers(perCategory: number = 3): Promise<ArxivData[]> {
    const BATCH_SIZE = 10;      // concurrent requests per batch
    const BATCH_DELAY_MS = 600; // pause between batches (ms)

    const allPapers: ArxivData[] = [];
    const seen = new Set<string>();

    const fetchCategory = async (category: string): Promise<ArxivData[]> => {
      try {
        const start = Math.floor(Math.random() * 200);
        const response = await axios.get(this.BASE, {
          params: {
            search_query: `cat:${category}`,
            start,
            max_results: perCategory,
            sortBy: 'lastUpdatedDate',
            sortOrder: 'descending',
          },
          timeout: 10_000,
        });

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
        });
        const parsed = parser.parse(response.data);
        const entries = parsed.feed?.entry;
        if (!entries) return [];

        const entriesArray = Array.isArray(entries) ? entries : [entries];
        return entriesArray.map((entry: any) => {
          const links = Array.isArray(entry.link) ? entry.link : [entry.link];
          const pdfLink = links.find((l: any) => l['@_title'] === 'pdf' || l['@_type'] === 'application/pdf');
          const htmlLink = links.find((l: any) => l['@_type'] === 'text/html' || l['@_rel'] === 'alternate');
          const authorsRaw = Array.isArray(entry.author) ? entry.author : [entry.author];
          const authors = authorsRaw.map((a: any) => a?.name).filter(Boolean);
          return {
            id: entry.id,
            title: typeof entry.title === 'string' ? entry.title.replace(/\n/g, ' ').trim() : 'Unknown Title',
            summary: typeof entry.summary === 'string' ? entry.summary.replace(/\n/g, ' ').trim() : '',
            published_at: entry.published || new Date().toISOString(),
            authors,
            pdf_url: pdfLink ? pdfLink['@_href'] : undefined,
            html_url: htmlLink ? htmlLink['@_href'] : entry.id,
            category,
          } as ArxivData;
        });
      } catch (err) {
        console.warn(`[ArxivIntegration] Skipping category "${category}":`, err instanceof Error ? err.message : err);
        return [];
      }
    };

    // Process categories in batches to be polite to arXiv
    for (let i = 0; i < this.CATEGORIES.length; i += BATCH_SIZE) {
      const batch = this.CATEGORIES.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(fetchCategory));

      for (const papers of results) {
        for (const paper of papers) {
          if (!seen.has(paper.id)) {
            seen.add(paper.id);
            allPapers.push(paper);
          }
        }
      }

      // Pause between batches (skip pause after the last batch)
      if (i + BATCH_SIZE < this.CATEGORIES.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    console.log(`[ArxivIntegration] Fetched ${allPapers.length} unique papers from ${this.CATEGORIES.length} categories`);
    return allPapers;
  }
}
