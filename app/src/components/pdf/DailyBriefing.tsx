import { Document, Page, Text, View } from "@react-pdf/renderer";
import { URGENCY_HEX, briefingStyles as s } from "./LetterheadStyles";

export interface BriefingKpi {
  label: string;
  value: string;
  sub: string;
}

export interface BriefingItem {
  rank: number;
  title: string;
  ward: string;
  urgency: string;
  signals: number;
  evidence: string;
  action: string;
}

export interface DailyBriefingProps {
  dateStr: string;
  weekLabel: string;
  constituency: string;
  mpName: string;
  kpis: BriefingKpi[];
  items: BriefingItem[];
}

/**
 * Daily Briefing PDF — the "at least one brief format" that must never be cut.
 * Masthead + KPI strip + the top priority clusters, each with its cited
 * public-data evidence and the recommended action.
 */
export function DailyBriefing({
  dateStr,
  weekLabel,
  constituency,
  mpName,
  kpis,
  items,
}: DailyBriefingProps) {
  return (
    <Document title={`Daily Briefing — ${constituency} — ${dateStr}`} author="Saarthi">
      <Page size="A4" style={s.page}>
        <View style={s.masthead}>
          <View>
            <Text style={s.brand}>Saarthi</Text>
            <Text style={s.brandSub}>Executive Intelligence · {constituency}</Text>
          </View>
          <View>
            <Text style={s.docType}>DAILY BRIEFING</Text>
            <Text style={s.docMeta}>
              {dateStr} · {weekLabel}
            </Text>
          </View>
        </View>
        <View style={s.subBar}>
          <Text>Prepared for Hon&apos;ble {mpName}, MP</Text>
          <Text>Confidential · for the addressee</Text>
        </View>

        {/* KPIs */}
        <Text style={s.sectionTitle}>CONSTITUENCY SNAPSHOT</Text>
        <View style={s.kpiRow}>
          {kpis.map((k, i) => (
            <View key={i} style={s.kpiCard}>
              <Text style={s.kpiLabel}>{k.label}</Text>
              <Text style={s.kpiValue}>{k.value}</Text>
              <Text style={s.kpiSub}>{k.sub}</Text>
            </View>
          ))}
        </View>

        {/* Priority items */}
        <Text style={s.sectionTitle}>TODAY&apos;S PRIORITY ACTIONS</Text>
        {items.map((it) => (
          <View key={it.rank} style={s.item} wrap={false}>
            <Text style={s.rank}>{String(it.rank).padStart(2, "0")}</Text>
            <View style={s.itemBody}>
              <View style={s.itemHead}>
                <Text style={s.itemTitle}>{it.title}</Text>
                <Text style={[s.urgencyTag, { color: URGENCY_HEX[it.urgency] ?? URGENCY_HEX.low }]}>
                  {it.urgency.toUpperCase()}
                </Text>
              </View>
              <Text style={s.itemMeta}>
                {it.ward} · {it.signals} citizen signals
              </Text>
              <Text style={s.evidence}>Evidence: {it.evidence}</Text>
              <Text style={s.action}>Recommended: {it.action}</Text>
            </View>
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>Saarthi · generated from live constituency data · every figure cited</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
