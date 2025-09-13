// src/lib/constants.ts

/** Canonical team list (alphabetized) used across the app */
export const TEAMS = [
  "AIM",
  "B2B",
  "BX",
  "Expanded Core",
  "Fraud",
  "GTM",
  "Implementation",
  "Ops Data",
  "Performance / UA",
  "Receipt Quality",
  "Sales",
  "Stratops",
  "Support",
] as const;

// (optional) handy type if you need it elsewhere
export type Team = typeof TEAMS[number];
