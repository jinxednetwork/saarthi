import { Document, Page, Text, View } from "@react-pdf/renderer";
import { PDF, letterStyles as s } from "./LetterheadStyles";

export interface MpladsLetterProps {
  refNo: string;
  dateStr: string;
  recipientName: string;
  recipientLines: string[];
  subject: string;
  /** Letter body split into paragraphs. */
  bodyParas: string[];
  mpName: string;
  constituency: string;
  annexures: string[];
}

/**
 * MPLADS recommendation letter on MP letterhead — a real, print-ready PDF
 * (never-cut brief format). All content is passed in from the composer so the
 * PDF matches exactly what the MP edited on screen.
 */
export function MpladsLetter({
  refNo,
  dateStr,
  recipientName,
  recipientLines,
  subject,
  bodyParas,
  mpName,
  constituency,
  annexures,
}: MpladsLetterProps) {
  return (
    <Document title={`MPLADS Recommendation — ${refNo}`} author={mpName}>
      <Page size="A4" style={s.page}>
        {/* Letterhead */}
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={s.seal}>
              <Text style={s.sealText}>BS</Text>
            </View>
            <View>
              <Text style={s.mpName}>{mpName}</Text>
              <Text style={s.mpRole}>Member of Parliament (Lok Sabha) · {constituency}</Text>
            </View>
          </View>
          <View>
            <Text style={s.emblem}>GOVERNMENT OF INDIA</Text>
            <Text style={s.emblem}>Lok Sabha Secretariat</Text>
          </View>
        </View>
        <View style={s.subBar}>
          <Text>Constituency Development · MPLADS</Text>
          <Text>Office of the Member of Parliament, New Delhi</Text>
        </View>

        {/* Ref + date */}
        <View style={s.refBlock}>
          <View style={s.refRow}>
            <Text style={s.refLabel}>Ref. No.</Text>
            <Text style={s.refLabel}>Date</Text>
          </View>
          <View style={s.refRow}>
            <Text style={s.refValue}>{refNo}</Text>
            <Text style={s.refValue}>{dateStr}</Text>
          </View>
        </View>

        {/* Recipient */}
        <View style={s.recipient}>
          <Text style={s.recipientName}>To,</Text>
          <Text style={s.recipientName}>{recipientName}</Text>
          {recipientLines.map((l, i) => (
            <Text key={i} style={s.recipientLine}>
              {l}
            </Text>
          ))}
        </View>

        <Text style={s.subject}>Subject: {subject}</Text>

        {bodyParas.map((p, i) => (
          <Text key={i} style={s.para}>
            {p}
          </Text>
        ))}

        {/* Signature */}
        <View style={s.signature}>
          <Text style={{ marginBottom: 2 }}>With regards,</Text>
          <Text style={s.signName}>{mpName}</Text>
          <Text style={s.signRole}>Member of Parliament (Lok Sabha)</Text>
          <Text style={s.signRole}>{constituency}</Text>
        </View>

        {annexures.length > 0 && (
          <View style={s.annexBox}>
            <Text style={s.annexTitle}>ANNEXURES ENCLOSED</Text>
            {annexures.map((a, i) => (
              <Text key={i} style={s.annexItem}>
                • {a}
              </Text>
            ))}
          </View>
        )}

        <View style={s.footer} fixed>
          <Text>
            Digitally signed with MP DSC · dispatched via NIC secure channel
          </Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
