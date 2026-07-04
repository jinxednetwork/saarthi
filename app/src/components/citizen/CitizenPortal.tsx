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
import type { Category } from "@saarthi/shared";
import { Button } from "@/components/ui/button";
import { MOCK_CONSTITUENCY } from "@/lib/mock-data";
import {
  CITIZEN_CATEGORIES,
  TICKET_STATUS_STEPS,
  useCitizenStore,
  type CitizenTicket,
} from "@/lib/citizen-store";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-xl border border-input bg-panel px-4 py-3 text-[15px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring";

type Mode = "report" | "track";
type Step = "phone" | "otp" | "form" | "done";

export function CitizenPortal() {
  const submit = useCitizenStore((s) => s.submit);
  const find = useCitizenStore((s) => s.find);

  const [mode, setMode] = useState<Mode>("report");
  const [step, setStep] = useState<Step>("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);

  const [category, setCategory] = useState<Category | null>(null);
  const [categoryLabel, setCategoryLabel] = useState("");
  const [wardId, setWardId] = useState(MOCK_CONSTITUENCY.wards[0]!.id);
  const [description, setDescription] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [hasVoice, setHasVoice] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [ticket, setTicket] = useState<CitizenTicket | null>(null);

  // ---- report: phone -> OTP -> form -> done ----
  function sendOtp() {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a 10-digit mobile number.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep("otp");
      toast.success("OTP sent (demo — enter any 6 digits).");
    }, 700);
  }

  function verifyOtp() {
    if (otp.replace(/\D/g, "").length !== 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setStep("form");
  }

  function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const names = Array.from(e.target.files ?? []).map((f) => f.name);
    if (names.length) setPhotoNames((prev) => [...prev, ...names].slice(0, 4));
  }

  function fileGrievance() {
    if (!category) {
      toast.error("Pick a category.");
      return;
    }
    if (description.trim().length < 8) {
      toast.error("Describe the issue in a line or two.");
      return;
    }
    const ward = MOCK_CONSTITUENCY.wards.find((w) => w.id === wardId)!;
    const t = submit({
      phone,
      category,
      categoryLabel,
      wardId,
      wardName: ward.name,
      description: description.trim(),
      photoNames,
      hasVoice,
    });
    setTicket(t);
    setStep("done");
  }

  function resetReport() {
    setStep("phone");
    setPhone("");
    setOtp("");
    setCategory(null);
    setCategoryLabel("");
    setWardId(MOCK_CONSTITUENCY.wards[0]!.id);
    setDescription("");
    setPhotoNames([]);
    setHasVoice(false);
    setTicket(null);
  }

  if (mode === "track") {
    return <TrackReport find={find} onBack={() => setMode("report")} />;
  }

  return (
    <div>
      {step !== "done" && (
        <>
          <h1 className="text-[22px] font-semibold leading-tight text-ink">Report a civic issue</h1>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            File it with your MP&apos;s office and track it to resolution.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line/60 bg-chip/50 px-3.5 py-2.5">
            <span className="text-[16px]">💬</span>
            <p className="text-[12px] leading-snug text-muted-foreground">
              This is the web fallback for WhatsApp. Prefer WhatsApp? Message{" "}
              <span className="font-medium text-ink">+91 98••• ••210</span>.
            </p>
          </div>
          <button
            onClick={() => setMode("track")}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
          >
            <Search className="h-3.5 w-3.5" />
            Track an existing report
          </button>
        </>
      )}

      {/* Step: phone */}
      {step === "phone" && (
        <div className="mt-6 flex flex-col gap-3">
          <StepBadge n={1} total={3} label="Verify your number" />
          <label className="text-[13px] font-medium text-muted-foreground" htmlFor="cz-phone">
            Mobile number
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
          <Button className="h-12 rounded-xl text-[15px]" onClick={sendOtp} disabled={sending}>
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send OTP
          </Button>
          <p className="text-center text-[11.5px] text-faint">
            Your number is masked on the report. We never show it publicly.
          </p>
        </div>
      )}

      {/* Step: OTP */}
      {step === "otp" && (
        <div className="mt-6 flex flex-col gap-3">
          <StepBadge n={1} total={3} label="Enter the code" />
          <p className="text-[13px] text-muted-foreground">
            Sent to <span className="font-medium text-ink">+91 {phone}</span>.
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
          <Button className="h-12 rounded-xl text-[15px]" onClick={verifyOtp}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify & continue
          </Button>
          <button
            onClick={() => setStep("phone")}
            className="inline-flex items-center justify-center gap-1 text-[12.5px] text-muted-foreground hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" /> Change number
          </button>
        </div>
      )}

      {/* Step: form */}
      {step === "form" && (
        <div className="mt-6 flex flex-col gap-5">
          <StepBadge n={2} total={3} label="Describe the issue" />

          <div>
            <p className="mb-2 text-[13px] font-medium text-muted-foreground">What&apos;s it about?</p>
            <div className="flex flex-wrap gap-2">
              {CITIZEN_CATEGORIES.map((c) => (
                <button
                  key={c.category}
                  onClick={() => {
                    setCategory(c.category);
                    setCategoryLabel(c.label);
                  }}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors",
                    category === c.category
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-line text-body hover:border-line-dark",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-muted-foreground" htmlFor="cz-ward">
              Your area
            </label>
            <select
              id="cz-ward"
              className={FIELD}
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
            >
              {MOCK_CONSTITUENCY.wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-muted-foreground" htmlFor="cz-desc">
              What&apos;s happening?
            </label>
            <textarea
              id="cz-desc"
              className={cn(FIELD, "min-h-[110px] resize-y leading-relaxed")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The main road drain has been overflowing for 3 days near the market."
            />
          </div>

          {/* Photo + voice */}
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
                {photoNames.length ? `${photoNames.length} photo${photoNames.length > 1 ? "s" : ""}` : "Add photo"}
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
                {hasVoice ? "Voice note · 0:14" : "Add voice note"}
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
                    <button
                      onClick={() => setPhotoNames((p) => p.filter((_, idx) => idx !== i))}
                      aria-label={`Remove ${n}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button className="h-12 rounded-xl text-[15px]" onClick={fileGrievance}>
            Submit report
          </Button>
        </div>
      )}

      {/* Step: done */}
      {step === "done" && ticket && (
        <div className="mt-8 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 text-[20px] font-semibold text-ink">Report filed</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Your MP&apos;s office has received it. Save your ticket number.
          </p>
          <div className="mt-5 w-full rounded-xl border border-line/60 bg-surface p-4 text-left">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Ticket className="h-4 w-4" />
              Ticket number
            </div>
            <p className="num mt-1 text-[22px] font-semibold tracking-tight text-ink">{ticket.id}</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {ticket.categoryLabel} · {ticket.wardName}
            </p>
            <div className="mt-4 border-t border-line/60 pt-4">
              <StatusTimeline status={ticket.status} />
            </div>
          </div>
          <div className="mt-5 flex w-full gap-2.5">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={() => setMode("track")}
            >
              Track report
            </Button>
            <Button className="h-11 flex-1 rounded-xl" onClick={resetReport}>
              File another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBadge({ n, total, label }: { n: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-[11px] font-medium text-primary">
        Step {n} / {total}
      </span>
      <span className="text-[13px] font-medium text-ink">{label}</span>
    </div>
  );
}

function StatusTimeline({ status }: { status: CitizenTicket["status"] }) {
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
              {s.label}
            </span>
            {i === currentIdx && (
              <span className="ml-auto text-[11px] font-medium text-primary">Current</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function TrackReport({
  find,
  onBack,
}: {
  find: (id: string) => CitizenTicket | undefined;
  onBack: () => void;
}) {
  const [id, setId] = useState("");
  const [result, setResult] = useState<CitizenTicket | null | "notfound">(null);

  function check() {
    if (!id.trim()) return;
    const t = find(id);
    setResult(t ?? "notfound");
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <h1 className="mt-4 text-[22px] font-semibold text-ink">Track a report</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">Enter the ticket number you were given.</p>

      <div className="mt-5 flex gap-2">
        <input
          className={FIELD}
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="NDL-2026-1234"
        />
        <Button className="h-auto rounded-xl px-5" onClick={check}>
          Check
        </Button>
      </div>

      {result === "notfound" && (
        <p className="mt-5 rounded-xl border border-dashed border-line px-4 py-6 text-center text-[13px] text-muted-foreground">
          No report found with that number. Check the ticket and try again.
        </p>
      )}

      {result && result !== "notfound" && (
        <div className="mt-5 rounded-xl border border-line/60 bg-surface p-4">
          <p className="num text-[17px] font-semibold text-ink">{result.id}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {result.categoryLabel} · {result.wardName}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-body">{result.description}</p>
          <div className="mt-4 border-t border-line/60 pt-4">
            <StatusTimeline status={result.status} />
          </div>
        </div>
      )}
    </div>
  );
}
