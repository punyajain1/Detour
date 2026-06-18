import axios from 'axios';
import { CveCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

interface CVEItem {
  id: string;
  published: string;
  lastModified: string;
  descriptions: Array<{ lang: string; value: string }>;
  metrics?: {
    cvssMetricV31?: Array<{
      cvssData: { baseScore: number; baseSeverity: string };
    }>;
    cvssMetricV30?: Array<{
      cvssData: { baseScore: number; baseSeverity: string };
    }>;
    cvssMetricV2?: Array<{
      cvssData: { baseScore: number };
      baseSeverity: string;
    }>;
  };
  configurations?: Array<{
    nodes: Array<{
      cpeMatch?: Array<{ criteria: string; vulnerable: boolean }>;
    }>;
  }>;
}

interface NVDResponse {
  totalResults: number;
  vulnerabilities: Array<{ cve: CVEItem }>;
}

function extractSeverity(cve: CVEItem): { score: number | undefined; severity: CveCard['metadata']['severity'] } {
  const v31 = cve.metrics?.cvssMetricV31?.[0]?.cvssData;
  if (v31) {
    return { score: v31.baseScore, severity: v31.baseSeverity as CveCard['metadata']['severity'] };
  }
  const v30 = cve.metrics?.cvssMetricV30?.[0]?.cvssData;
  if (v30) {
    return { score: v30.baseScore, severity: v30.baseSeverity as CveCard['metadata']['severity'] };
  }
  const v2 = cve.metrics?.cvssMetricV2?.[0];
  if (v2) {
    return { score: v2.cvssData.baseScore, severity: v2.baseSeverity as CveCard['metadata']['severity'] };
  }
  return { score: undefined, severity: 'NONE' };
}

function extractProducts(cve: CVEItem): string[] {
  const products: string[] = [];
  for (const cfg of cve.configurations ?? []) {
    for (const node of cfg.nodes) {
      for (const cpe of node.cpeMatch ?? []) {
        if (cpe.vulnerable) {
          // CPE format: cpe:2.3:a:vendor:product:version:...
          const parts = cpe.criteria.split(':');
          if (parts[4]) products.push(`${parts[3]}/${parts[4]}`);
        }
      }
    }
  }
  // Deduplicate
  return [...new Set(products)].slice(0, 5);
}

export class CveIntegration {
  private static BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

  static async getHighSeverityCVEs(count: number = 20): Promise<CveCard[]> {
    try {
      // Fetch published in the last 7 days, severity HIGH or CRITICAL
      const pubStartDate = new Date(Date.now() - 7 * 86400 * 1000).toISOString().replace(/\.\d+Z$/, '.000');
      const pubEndDate = new Date().toISOString().replace(/\.\d+Z$/, '.000');

      const { data } = await axios.get<NVDResponse>(this.BASE, {
        params: {
          pubStartDate,
          pubEndDate,
          cvssV3Severity: 'HIGH',
          resultsPerPage: 50,
        },
        timeout: 15000,
      });

      const vulns = data.vulnerabilities ?? [];

      const cards: CveCard[] = [];

      for (const { cve } of vulns) {
        const engDesc = cve.descriptions.find((d) => d.lang === 'en');
        if (!engDesc) continue;

        const { score, severity } = extractSeverity(cve);
        const products = extractProducts(cve);

        cards.push({
          id: uuid(),
          type: 'cve',
          category: 'programming',
          fetchedAt: new Date().toISOString(),
          title: `${cve.id}: ${engDesc.value.slice(0, 80)}${engDesc.value.length > 80 ? '...' : ''}`,
          description: engDesc.value.slice(0, 500),
          url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
          metadata: {
            cveId: cve.id,
            cvssScore: score,
            severity,
            publishedAt: cve.published,
            affectedProducts: products,
          },
        });
      }

      // Also fetch CRITICAL separately
      try {
        const { data: critData } = await axios.get<NVDResponse>(this.BASE, {
          params: {
            pubStartDate,
            pubEndDate,
            cvssV3Severity: 'CRITICAL',
            resultsPerPage: 30,
          },
          timeout: 15000,
        });

        for (const { cve } of critData.vulnerabilities ?? []) {
          if (cards.some((c) => c.metadata.cveId === cve.id)) continue;
          const engDesc = cve.descriptions.find((d) => d.lang === 'en');
          if (!engDesc) continue;
          const { score, severity } = extractSeverity(cve);
          const products = extractProducts(cve);

          cards.push({
            id: uuid(),
            type: 'cve',
            category: 'programming',
            fetchedAt: new Date().toISOString(),
            title: `${cve.id}: ${engDesc.value.slice(0, 80)}${engDesc.value.length > 80 ? '...' : ''}`,
            description: engDesc.value.slice(0, 500),
            url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
            metadata: {
              cveId: cve.id,
              cvssScore: score,
              severity,
              publishedAt: cve.published,
              affectedProducts: products,
            },
          });
        }
      } catch {
        // Critical fetch failing is non-fatal
      }

      // Sort by CVSS score descending
      return cards
        .sort((a, b) => (b.metadata.cvssScore ?? 0) - (a.metadata.cvssScore ?? 0))
        .slice(0, count);
    } catch (err) {
      console.warn('[CVE] Failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
