import type { UiLanguage } from "@saarthi/shared";
import { MetricsStrip } from "@/components/metrics-strip/MetricsStrip";
import { PriorityCard } from "@/components/priority-card/PriorityCard";
import { t } from "@/lib/i18n";
import { MOCK_CLUSTERS, MOCK_CONSTITUENCY, topClusters } from "@/lib/mock-data";

/**
 * Dashboard home — "Today's Top 5 Issues" + metrics strip (§13 Beat 3).
 * Reads deterministic mock data; swap for Firestore listeners in Phase 4.
 * `?lang=hi` demos the first-class Hindi UI (§10).
 */
export default function DashboardPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const lang: UiLanguage = searchParams.lang === "hi" ? "hi" : "en";
  const top = topClusters(5);
  const openCount = MOCK_CLUSTERS.filter((c) => c.status !== "resolved").length;

  return (
    <main lang={lang} className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{t(lang, "app.name")}</h1>
        <p className="text-muted">
          {MOCK_CONSTITUENCY[lang === "hi" ? "name_hi" : "name"]} · {t(lang, "app.tagline")}
        </p>
      </header>

      <section className="mb-8">
        <MetricsStrip constituency={MOCK_CONSTITUENCY} openClusters={openCount} lang={lang} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          {t(lang, "dashboard.top5.title")}
        </h2>
        <div className="grid gap-3">
          {top.map((cluster, i) => (
            <PriorityCard key={cluster.id} cluster={cluster} rank={i + 1} lang={lang} />
          ))}
        </div>
      </section>

      <footer className="mt-8 text-center text-xs text-muted">
        Offline skeleton · mock data ·{" "}
        <a className="underline" href={lang === "hi" ? "/dashboard" : "/dashboard?lang=hi"}>
          {lang === "hi" ? "English" : "हिन्दी"}
        </a>
      </footer>
    </main>
  );
}
