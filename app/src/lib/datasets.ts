/**
 * Public-dataset registry — every citation in the UI resolves to the real
 * department portal. Phase 2 deep-links per-record BigQuery extracts; until
 * then the portal root is an honest, working destination.
 */
export const DATASET_URLS: Record<string, string> = {
  DUSIB: "https://delhishelterboard.in/main/",
  IMD: "https://mausam.imd.gov.in/",
  CPWD: "https://cpwd.gov.in/",
  CPCB: "https://cpcb.nic.in/",
  DJB: "https://delhijalboard.delhi.gov.in/",
  CGWB: "http://cgwb.gov.in/",
  DDA: "https://dda.gov.in/",
  DMRC: "https://www.delhimetrorail.com/",
  MoSPI: "https://www.mplads.gov.in/",
  Census: "https://censusindia.gov.in/",
  "NFHS-5": "https://rchiips.org/nfhs/",
};

export function datasetUrl(dataset: string): string | undefined {
  const key = Object.keys(DATASET_URLS).find((k) =>
    dataset.toUpperCase().startsWith(k.toUpperCase()),
  );
  return key ? DATASET_URLS[key] : undefined;
}
