import type { Category } from "./common";

/**
 * Citizen grievance portal — the shared contract between the standalone citizen
 * app, the MP dashboard, and the Saarthi API. One definition so all three agree
 * on ticket shape, categories, statuses, and wards. (§ citizen intake.)
 */
export type TicketStatus = "received" | "acknowledged" | "in_progress" | "resolved";

export interface CitizenTicket {
  id: string;
  /** Masked on the record — the raw number is never surfaced (§14). */
  phoneMasked: string;
  category: Category;
  categoryLabel: string;
  wardId: string;
  wardName: string;
  description: string;
  photoCount: number;
  hasVoice: boolean;
  status: TicketStatus;
  /** ISO timestamp. */
  createdAt: string;
}

export interface SubmitTicketInput {
  phone: string;
  category: Category;
  categoryLabel: string;
  wardId: string;
  wardName: string;
  description: string;
  photoCount: number;
  hasVoice: boolean;
}

export interface CitizenCategoryOption {
  category: Category;
  label: string;
  label_hi: string;
}

/** Citizen-friendly framing of the shared category taxonomy. */
export const CITIZEN_CATEGORIES: CitizenCategoryOption[] = [
  { category: "water", label: "Water supply", label_hi: "जल आपूर्ति" },
  { category: "infrastructure", label: "Roads, drains & lighting", label_hi: "सड़क, नाली और रोशनी" },
  { category: "health", label: "Health & sanitation", label_hi: "स्वास्थ्य और स्वच्छता" },
  { category: "air_quality", label: "Air & pollution", label_hi: "वायु और प्रदूषण" },
  { category: "other", label: "Something else", label_hi: "कुछ और" },
];

export const TICKET_STATUS_STEPS: { key: TicketStatus; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
];

export interface CitizenWard {
  id: string;
  name: string;
  sc_majority: boolean;
}

/** New Delhi Lok Sabha wards — shared so the portal and dashboard agree. */
export const NEW_DELHI_WARDS: CitizenWard[] = [
  { id: "karol-bagh", name: "Karol Bagh", sc_majority: true },
  { id: "rajinder-nagar", name: "Rajinder Nagar", sc_majority: false },
  { id: "kalkaji-ext", name: "Kalkaji Ext.", sc_majority: false },
  { id: "malviya-nagar", name: "Malviya Nagar", sc_majority: false },
  { id: "chanakyapuri", name: "Chanakyapuri", sc_majority: false },
  { id: "sarai-kale-khan", name: "Sarai Kale Khan", sc_majority: true },
  { id: "patel-nagar", name: "Patel Nagar", sc_majority: true },
  { id: "rk-puram", name: "R.K. Puram", sc_majority: false },
  { id: "sarojini-nagar", name: "Sarojini Nagar", sc_majority: false },
  { id: "kasturba-nagar", name: "Kasturba Nagar", sc_majority: false },
  { id: "green-park", name: "Green Park", sc_majority: false },
  { id: "greater-kailash", name: "Greater Kailash", sc_majority: false },
  { id: "delhi-cantt", name: "Delhi Cantt", sc_majority: false },
];
