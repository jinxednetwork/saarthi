"use client";

import { create } from "zustand";
import type { Category } from "@saarthi/shared";

/**
 * Citizen grievance portal store (§ mobile-first citizen intake). This is the
 * WhatsApp fallback: a citizen files a report and gets a ticket ID; the MP side
 * reads these same-origin tickets and folds them into the live feed. Persisted
 * to localStorage — no backend in the demo (production: Firestore + Gemini
 * auto-classify/cluster into the MP's signal graph).
 */
export type TicketStatus = "received" | "acknowledged" | "in_progress" | "resolved";

export interface CitizenTicket {
  id: string;
  phoneMasked: string;
  category: Category;
  categoryLabel: string;
  wardId: string;
  wardName: string;
  description: string;
  photoNames: string[];
  hasVoice: boolean;
  status: TicketStatus;
  createdAt: string;
}

export interface CitizenCategoryOption {
  category: Category;
  label: string;
  label_hi: string;
}

// Citizen-friendly framing of the shared category taxonomy.
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

export interface SubmitTicketInput {
  phone: string;
  category: Category;
  categoryLabel: string;
  wardId: string;
  wardName: string;
  description: string;
  photoNames: string[];
  hasVoice: boolean;
}

const STORAGE_KEY = "saarthi-citizen-tickets";

interface CitizenState {
  tickets: CitizenTicket[];
  hydrated: boolean;
  hydrate(): void;
  submit(input: SubmitTicketInput): CitizenTicket;
  find(id: string): CitizenTicket | undefined;
}

let seq = 0;

function ticketId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  seq += 1;
  return `NDL-${year}-${rand}${seq % 10}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `••••••${digits.slice(-4)}` : "••••";
}

function persist(tickets: CitizenTicket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

export function loadCitizenTickets(): CitizenTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CitizenTicket[]) : [];
  } catch {
    return [];
  }
}

export const useCitizenStore = create<CitizenState>((set, get) => ({
  tickets: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ tickets: loadCitizenTickets(), hydrated: true });
  },
  submit: (input) => {
    const ticket: CitizenTicket = {
      id: ticketId(),
      phoneMasked: maskPhone(input.phone),
      category: input.category,
      categoryLabel: input.categoryLabel,
      wardId: input.wardId,
      wardName: input.wardName,
      description: input.description,
      photoNames: input.photoNames,
      hasVoice: input.hasVoice,
      status: "received",
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const tickets = [ticket, ...s.tickets];
      persist(tickets);
      return { tickets, hydrated: true };
    });
    return ticket;
  },
  find: (id) => {
    const norm = id.trim().toUpperCase();
    return (get().hydrated ? get().tickets : loadCitizenTickets()).find(
      (t) => t.id.toUpperCase() === norm,
    );
  },
}));
