/**
 * Plan tiers — single source of truth.
 * The /pricing page, form and client limits, AI quotas and e-mail throttles
 * all read from here so marketing and enforcement never drift.
 *
 * Model (migration v22): a developer creates clients; every form belongs to a
 * client; leads go to the client. So the unit that scales with a developer's
 * business is the number of CLIENTS, and every plan — including Free — can
 * create clients and use the API/MCP. Free proves the product on a real site;
 * paid plans buy room (clients, forms, volume) and the developer's brand.
 *
 * Prices are listed in USD today; invoicing opens with the company (Q4 2026)
 * and the EUR price book will mirror these numbers 1:1.
 */

export type PlanId = 'free' | 'solo' | 'pro' | 'max';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD
  formLimit: number | null;        // null = unlimited
  clientLimit: number | null;      // max clients (businesses); null = unlimited
  submissionsPerMonth: number;
  emailsPerDay: number;
  aiMessages: number | null;       // lifetime for free, per-month for solo, null = unlimited
  whiteLabel: boolean;             // no "Powered by Inlet" on e-mails and portals
  csvExport: boolean;
  analytics: boolean;
  customSender: boolean;           // custom sender name + reply-to on client e-mails
  retentionDays: number | null;    // null = unlimited
  apiAccess: boolean;              // API keys + MCP server + server-to-server submit
  clientPortals: boolean;          // clients can sign in to their own portal
  prioritySupport: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    formLimit: 3,
    clientLimit: 2,
    submissionsPerMonth: 50,
    emailsPerDay: 20,
    aiMessages: 1, // lifetime trial
    whiteLabel: false,
    csvExport: false,
    analytics: false,
    customSender: false,
    retentionDays: 30,
    apiAccess: true,
    clientPortals: true,
    prioritySupport: false,
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    priceMonthly: 9,
    formLimit: 10,
    clientLimit: 10,
    submissionsPerMonth: 500,
    emailsPerDay: 100,
    aiMessages: 100, // per month
    whiteLabel: false,
    csvExport: true,
    analytics: true,
    customSender: true,
    retentionDays: 365,
    apiAccess: true,
    clientPortals: true,
    prioritySupport: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 19,
    formLimit: null,
    clientLimit: 50,
    submissionsPerMonth: 2500,
    emailsPerDay: 300,
    aiMessages: 500, // per month — metered, never "unlimited" (cost control)
    whiteLabel: true,
    csvExport: true,
    analytics: true,
    customSender: true,
    retentionDays: null,
    apiAccess: true,
    clientPortals: true,
    prioritySupport: false,
  },
  max: {
    id: 'max',
    name: 'Max',
    priceMonthly: 49,
    formLimit: null,
    clientLimit: null,
    submissionsPerMonth: 10000,
    emailsPerDay: 1000,
    aiMessages: 2000, // per month
    whiteLabel: true,
    csvExport: true,
    analytics: true,
    customSender: true,
    retentionDays: null,
    apiAccess: true,
    clientPortals: true,
    prioritySupport: true,
  },
};

export const PAID_PLAN_IDS: PlanId[] = ['solo', 'pro', 'max'];

/** Resolve a stored plan value defensively (unknown/legacy -> free). */
export function getPlan(planId: string | null | undefined): Plan {
  if (planId && planId in PLANS) return PLANS[planId as PlanId];
  return PLANS.free;
}

export function isPaidPlanId(v: unknown): v is Exclude<PlanId, 'free'> {
  return typeof v === 'string' && PAID_PLAN_IDS.includes(v as PlanId);
}
