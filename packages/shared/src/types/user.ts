import type { Timestamp, UiLanguage } from "./common";

/** Six-role RBAC (§15). */
export const USER_ROLES = [
  "mp",
  "chief_of_staff",
  "constituency_coordinator",
  "field_worker",
  "communications",
  "observer",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Field workers are ward-scoped via this (§15). */
export interface ScopeRestrictions {
  ward_ids?: string[];
}

export interface NotificationPrefs {
  email_digest: "daily" | "weekly" | "off";
  urgent_alerts: boolean;
}

/**
 * `users/{user_id}` — an MP-office staff member with a role + scope (§6.1, §15).
 */
export interface User {
  id: string;
  role: UserRole;
  constituency: string;
  name: string;
  email: string;
  phone: string;
  language_preference: UiLanguage;
  scope_restrictions?: ScopeRestrictions;
  notification_prefs: NotificationPrefs;
  created_at: Timestamp;
  last_active: Timestamp;
}

export const USERS_COLLECTION = "users" as const;
