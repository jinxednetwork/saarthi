"use client";

import { create } from "zustand";
import { SEED_PROPOSALS, type Proposal } from "./proposals";

/**
 * Proposals store — SEED proposals plus the MP's own session-authored ones
 * (persisted). Compare selection (up to two, for the head-to-head view) is
 * session-only. Manual proposals get a `usr_` id so only they are persisted;
 * the seed set always reloads from code.
 */
const STORAGE_KEY = "saarthi-proposals";

export interface NewProposalInput {
  title: string;
  summary: string;
  dimension: Proposal["dimension"];
  category: Proposal["category"];
  ward_id: string;
  pathway: Proposal["pathway"];
  cost_lakhs: number;
  mplads_eligible: boolean;
  benefits_sc: boolean;
}

interface ProposalsState {
  proposals: Proposal[];
  compareIds: string[];
  hydrated: boolean;
  hydrate(): void;
  addProposal(input: NewProposalInput): Proposal;
  toggleCompare(id: string): void;
  clearCompare(): void;
}

let seq = 0;

function persist(proposals: Proposal[]) {
  try {
    const user = proposals.filter((p) => p.id.startsWith("usr_"));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

export const useProposalsStore = create<ProposalsState>((set, get) => ({
  proposals: SEED_PROPOSALS,
  compareIds: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    let user: Proposal[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) user = JSON.parse(raw) as Proposal[];
    } catch {}
    set({ proposals: [...SEED_PROPOSALS, ...user], hydrated: true });
  },
  addProposal: (input) => {
    const proposal: Proposal = {
      id: `usr_${Date.now().toString(36)}_${++seq}`,
      origin: "manual",
      created_at: new Date().toISOString(),
      ...input,
    };
    set((s) => {
      const proposals = [...s.proposals, proposal];
      persist(proposals);
      return { proposals };
    });
    return proposal;
  },
  toggleCompare: (id) =>
    set((s) => {
      if (s.compareIds.includes(id)) {
        return { compareIds: s.compareIds.filter((x) => x !== id) };
      }
      // Keep at most two — dropping the oldest when a third is picked.
      const next = [...s.compareIds, id].slice(-2);
      return { compareIds: next };
    }),
  clearCompare: () => set({ compareIds: [] }),
}));
