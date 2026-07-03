import type { Cluster } from "@saarthi/shared";
import { createAiClient } from "./lib/ai-client";
import { checkEligibility } from "./compliance/index";
import {
  assignToCluster,
  enrichSubmission,
  rankCluster,
  type RawSubmission,
} from "./pipeline";

/**
 * Offline demo of the core loop (§19 step 8): raw intake → enrich → cluster → rank
 * → MPLADS compliance, with the MockAiClient. Run: `pnpm dev:worker` or `pnpm --filter
 * @saarthi/worker demo`. This is the "one cluster end-to-end" proof before wiring
 * Pub/Sub + Firestore.
 */
const NOW = 1_751_500_000_000;
const HOUR = 3_600_000;

// NOTE: with the real Vertex text-embedding-004, semantically similar reports
// cluster even across languages/paraphrase (translate() normalises to English
// first, §7.7). The offline MockAiClient is a literal bag-of-words, so these two
// reports of the same issue share enough vocabulary to clear the 0.82 threshold
// and demonstrate the cluster-MATCH path.
const RAW: RawSubmission[] = [
  {
    id: "sub_001",
    source: "whatsapp",
    text: "Chandrapur block C no water supply for 4 days, urgent",
    language: "hi-en",
    constituency: "new-delhi-ls",
    ward: "chandrapur",
    lat: 28.6139,
    lng: 77.209,
    created_at_ms: NOW - 3 * HOUR,
  },
  {
    id: "sub_002",
    source: "twitter",
    text: "Chandrapur block C no water supply cut for days, urgent severe",
    constituency: "new-delhi-ls",
    ward: "chandrapur",
    lat: 28.6145,
    lng: 77.2095,
    created_at_ms: NOW - 2 * HOUR,
  },
  {
    id: "sub_003",
    source: "reddit",
    text: "AQI in RK Puram is severe again, PM2.5 smog pollution worsening",
    constituency: "new-delhi-ls",
    ward: "rk-puram",
    lat: 28.5636,
    lng: 77.1766,
    created_at_ms: NOW - 1 * HOUR,
  },
];

async function main() {
  const ai = createAiClient();
  const clusters: Cluster[] = [];

  console.log("=== Saarthi core-loop demo (offline / MockAiClient) ===\n");

  for (const raw of RAW) {
    const submission = await enrichSubmission(raw, ai);
    const result = assignToCluster(submission, clusters, NOW);
    const cluster = clusters.find((c) => c.id === result.clusterId)!;
    rankCluster(cluster);

    console.log(
      `${raw.id} [${submission.source}] → ${submission.category}/${submission.urgency} ` +
        `→ cluster ${result.created ? "NEW" : "matched"} ${result.clusterId} ` +
        `(count=${cluster.submission_count}, rank=${cluster.rank_score})`,
    );
  }

  console.log("\n--- Clusters after ranking ---");
  for (const c of [...clusters].sort((a, b) => b.rank_score - a.rank_score)) {
    console.log(
      `  ${c.rank_score.toString().padStart(3)} | ${c.category.padEnd(13)} | ` +
        `${c.geo.ward.padEnd(12)} | ${c.submission_count} submission(s)`,
    );
  }

  console.log("\n--- MPLADS eligibility check (drinking_water) ---");
  const elig = checkEligibility("drinking_water", {
    allocation_annual: 50_000_000,
    utilization_ytd: 31_000_000,
    sc_percent_ytd: 0.11,
    st_percent_ytd: 0.06,
    fiscal_year: "2026-27",
  });
  console.log(`  eligible=${elig.eligible}`);
  for (const note of elig.compliance_notes) console.log(`   • ${note}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
