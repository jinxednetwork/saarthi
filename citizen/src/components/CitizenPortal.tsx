"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Circle,
  Loader2,
  Mic,
  Search,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CITIZEN_CATEGORIES,
  NEW_DELHI_WARDS,
  TICKET_STATUS_STEPS,
  type CitizenTicket,
} from "@saarthi/shared";
import { useI18n } from "@/components/i18n/I18nProvider";
import { findTicket, submitTicket } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Downscale a photo to a small JPEG data-URL so Gemini Vision gets it without a huge upload. */
function downscaleImage(file: File, max = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("no canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}

const FIELD =
  "w-full rounded-xl border border-input bg-panel px-4 py-3 text-[15px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring";
const PRIMARY =
  "flex items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60";

type Mode = "report" | "track";
type Step = "phone" | "otp" | "form" | "done";

export function CitizenPortal() {
  const { t, lang } = useI18n();

  const [mode, setMode] = useState<Mode>("report");
  const [step, setStep] = useState<Step>("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState<CitizenTicket["category"] | null>(null);
  const [wardId, setWardId] = useState(NEW_DELHI_WARDS[0]!.id);
  const [description, setDescription] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [hasVoice, setHasVoice] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [ticket, setTicket] = useState<CitizenTicket | null>(null);

  function sendOtp() {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error(t("toast.enterPhone"));
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep("otp");
      toast.success(t("toast.otpSent"));
    }, 700);
  }

  function verifyOtp() {
    if (otp.replace(/\D/g, "").length !== 6) {
      toast.error(t("toast.enterCode"));
      return;
    }
    setStep("form");
  }

  function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setPhotoNames((prev) => [...prev, ...files.map((f) => f.name)].slice(0, 4));
    // Capture + downscale the first photo for Gemini Vision.
    const first = files.find((f) => f.type.startsWith("image/"));
    if (first && !photoDataUrl) {
      downscaleImage(first).then(setPhotoDataUrl).catch(() => setPhotoDataUrl(undefined));
    }
  }

  async function fileGrievance() {
    if (!category) {
      toast.error(t("toast.pickCategory"));
      return;
    }
    if (description.trim().length < 8) {
      toast.error(t("toast.describe"));
      return;
    }
    const ward = NEW_DELHI_WARDS.find((w) => w.id === wardId)!;
    const cat = CITIZEN_CATEGORIES.find((c) => c.category === category)!;
    setSubmitting(true);
    try {
      const created = await submitTicket({
        phone,
        category,
        categoryLabel: cat.label, // English canonical; the server re-derives it too
        wardId,
        wardName: ward.name,
        description: description.trim(),
        photoCount: photoNames.length,
        hasVoice,
        photoDataUrl,
      });
      setTicket(created);
      setStep("done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.submitFail"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetReport() {
    setStep("phone");
    setPhone("");
    setOtp("");
    setCategory(null);
    setWardId(NEW_DELHI_WARDS[0]!.id);
    setDescription("");
    setPhotoNames([]);
    setPhotoDataUrl(undefined);
    setHasVoice(false);
    setTicket(null);
  }

  if (mode === "track") {
    return <TrackReport onBack={() => setMode("report")} />;
  }

  return (
    <div>
      {step !== "done" && (
        <>
          <h1 className="text-[22px] font-semibold leading-tight text-ink">{t("portal.title")}</h1>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{t("portal.subtitle")}</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line/60 bg-chip/50 px-3.5 py-2.5">
            <span className="text-[16px]">💬</span>
            <p className="text-[12px] leading-snug text-muted-foreground">
              {t("portal.whatsapp", { number: "+91 98••• ••210" })}
            </p>
          </div>
          <button
            onClick={() => setMode("track")}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
          >
            <Search className="h-3.5 w-3.5" />
            {t("portal.track")}
          </button>
        </>
      )}

      {step === "phone" && (
        <div className="mt-6 flex flex-col gap-3">
          <StepBadge n={1} label={t("portal.verifyNumber")} t={t} />
          <label className="text-[13px] font-medium text-muted-foreground" htmlFor="cz-phone">
            {t("portal.mobile")}
          </label>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-input bg-panel px-3 py-3 text-[15px] text-muted-foreground">
              +91
            </span>
            <input
              id="cz-phone"
              inputMode="numeric"
              className={FIELD}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
            />
          </div>
          <button className={cn(PRIMARY, "h-12")} onClick={sendOtp} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("portal.sendOtp")}
          </button>
          <p className="text-center text-[11.5px] text-faint">{t("portal.masked")}</p>
        </div>
      )}

      {step === "otp" && (
        <div className="mt-6 flex flex-col gap-3">
          <StepBadge n={1} label={t("portal.enterCode")} t={t} />
          <p className="text-[13px] text-muted-foreground">
            {t("portal.sentTo")} <span className="font-medium text-ink">+91 {phone}</span>.
          </p>
          <input
            inputMode="numeric"
            maxLength={6}
            className={cn(FIELD, "text-center text-[22px] tracking-[0.5em]")}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="______"
            autoFocus
          />
          <button className={cn(PRIMARY, "h-12")} onClick={verifyOtp}>
            <ShieldCheck className="h-4 w-4" />
            {t("portal.verify")}
          </button>
          <button
            onClick={() => setStep("phone")}
            className="inline-flex items-center justify-center gap-1 text-[12.5px] text-muted-foreground hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" /> {t("portal.changeNumber")}
          </button>
        </div>
      )}

      {step === "form" && (
        <div className="mt-6 flex flex-col gap-5">
          <StepBadge n={2} label={t("portal.describe")} t={t} />

          <div>
            <p className="mb-2 text-[13px] font-medium text-muted-foreground">{t("portal.whatsAbout")}</p>
            <div className="flex flex-wrap gap-2">
              {CITIZEN_CATEGORIES.map((c) => (
                <button
                  key={c.category}
                  onClick={() => setCategory(c.category)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors",
                    category === c.category
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-line text-body hover:border-line-dark",
                  )}
                >
                  {lang === "hi" ? c.label_hi : c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-muted-foreground" htmlFor="cz-ward">
              {t("portal.yourArea")}
            </label>
            <select id="cz-ward" className={FIELD} value={wardId} onChange={(e) => setWardId(e.target.value)}>
              {NEW_DELHI_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-muted-foreground" htmlFor="cz-desc">
              {t("portal.whatHappening")}
            </label>
            <textarea
              id="cz-desc"
              className={cn(FIELD, "min-h-[110px] resize-y leading-relaxed")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("portal.descPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={onPhotos}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-panel py-3 text-[13.5px] font-medium text-body hover:border-line-dark"
              >
                <Camera className="h-4 w-4" />
                {photoNames.length
                  ? t(photoNames.length > 1 ? "portal.photoCountPlural" : "portal.photoCount", {
                      n: photoNames.length,
                    })
                  : t("portal.addPhoto")}
              </button>
              <button
                onClick={() => setHasVoice((v) => !v)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border py-3 text-[13.5px] font-medium transition-colors",
                  hasVoice
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-line bg-panel text-body hover:border-line-dark",
                )}
              >
                <Mic className="h-4 w-4" />
                {hasVoice ? t("portal.voiceAdded") : t("portal.addVoice")}
              </button>
            </div>
            {photoNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {photoNames.map((n, i) => (
                  <span
                    key={`${n}-${i}`}
                    className="flex items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    <span className="max-w-[120px] truncate">{n}</span>
                    <button onClick={() => setPhotoNames((p) => p.filter((_, idx) => idx !== i))} aria-label="remove">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button className={cn(PRIMARY, "h-12")} onClick={fileGrievance} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t("portal.submitting") : t("portal.submit")}
          </button>
        </div>
      )}

      {step === "done" && ticket && (
        <div className="mt-8 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 text-[20px] font-semibold text-ink">{t("portal.filed")}</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">{t("portal.filedSub")}</p>
          <div className="mt-5 w-full rounded-xl border border-line/60 bg-surface p-4 text-left">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Ticket className="h-4 w-4" />
              {t("portal.ticketNumber")}
            </div>
            <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink">{ticket.id}</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {ticket.categoryLabel} · {ticket.wardName}
            </p>
            {(ticket.photoInsight || ticket.voiceTranscript) && (
              <div className="mt-3 flex flex-col gap-1.5 rounded-lg border border-line/50 bg-chip/40 px-3 py-2 text-[11.5px] text-muted-foreground">
                {ticket.photoInsight && (
                  <p>
                    <span className="font-medium text-ink">📷 AI read your photo: </span>
                    {ticket.photoInsight}
                  </p>
                )}
                {ticket.voiceTranscript && (
                  <p>
                    <span className="font-medium text-ink">🎙 Transcript: </span>
                    {ticket.voiceTranscript}
                  </p>
                )}
              </div>
            )}
            <div className="mt-4 border-t border-line/60 pt-4">
              <StatusTimeline status={ticket.status} t={t} />
            </div>
          </div>
          <div className="mt-5 flex w-full gap-2.5">
            <button
              className="h-11 flex-1 rounded-xl border border-line text-[14px] font-medium text-body hover:border-line-dark"
              onClick={() => setMode("track")}
            >
              {t("portal.trackReport")}
            </button>
            <button className={cn(PRIMARY, "h-11 flex-1")} onClick={resetReport}>
              {t("portal.fileAnother")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type TFn = (key: string, vars?: Record<string, string | number>) => string;

function StepBadge({ n, label, t }: { n: number; label: string; t: TFn }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-[11px] font-medium text-primary">
        {t("portal.step", { n })}
      </span>
      <span className="text-[13px] font-medium text-ink">{label}</span>
    </div>
  );
}

function StatusTimeline({ status, t }: { status: CitizenTicket["status"]; t: TFn }) {
  const currentIdx = TICKET_STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="flex flex-col gap-2.5">
      {TICKET_STATUS_STEPS.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <li key={s.key} className="flex items-center gap-2.5">
            {done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-line-dark" />
            )}
            <span className={cn("text-[13px]", done ? "font-medium text-ink" : "text-faint")}>
              {t(`status.${s.key}`)}
            </span>
            {i === currentIdx && (
              <span className="ml-auto text-[11px] font-medium text-primary">{t("portal.current")}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function TrackReport({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CitizenTicket | null | "notfound">(null);

  async function check() {
    if (!id.trim()) return;
    setBusy(true);
    try {
      const found = await findTicket(id);
      setResult(found ?? "notfound");
    } catch {
      toast.error(t("toast.serverFail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("portal.back")}
      </button>
      <h1 className="mt-4 text-[22px] font-semibold text-ink">{t("portal.trackTitle")}</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">{t("portal.trackSub")}</p>

      <div className="mt-5 flex gap-2">
        <input className={FIELD} value={id} onChange={(e) => setId(e.target.value)} placeholder="NDL-2026-1234" />
        <button className={cn(PRIMARY, "px-5")} onClick={check} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("portal.check")}
        </button>
      </div>

      {result === "notfound" && (
        <p className="mt-5 rounded-xl border border-dashed border-line px-4 py-6 text-center text-[13px] text-muted-foreground">
          {t("portal.notFound")}
        </p>
      )}

      {result && result !== "notfound" && (
        <div className="mt-5 rounded-xl border border-line/60 bg-surface p-4">
          <p className="text-[17px] font-semibold text-ink">{result.id}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {result.categoryLabel} · {result.wardName}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-body">{result.description}</p>
          <div className="mt-4 border-t border-line/60 pt-4">
            <StatusTimeline status={result.status} t={t} />
          </div>
        </div>
      )}
    </div>
  );
}
