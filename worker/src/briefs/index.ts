/**
 * Brief generation (§8.7): Gemini Pro → structured JSON → template renderer.
 *
 * Formats: PDF (@react-pdf/renderer), PPTX (pptxgenjs), DOCX (docx). Outputs land in
 * Cloud Storage with a 1h signed URL and a `briefs/{id}` record for provenance.
 * Every generated brief cites its sources — if Gemini can't cite it, drop it (§8.7).
 *
 * Never-cut (§12): at least one format — PDF Daily Briefing — must ship.
 * TODO(Phase 5): implement the PDF Daily Briefing renderer first.
 */
export {};
