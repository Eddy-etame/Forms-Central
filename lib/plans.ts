/**
 * Plan tiers — single source of truth.
 * The /pricing page, form-creation limits, AI quotas and (soon) email
 * throttles all read from here so marketing and enforcement never drift.
 *
 * Tier design (Good–Better–Best + free entry, per Monetizing Innovation):
 * - free  : proof of value. Enough to trust the product, not to run a business on.
 * - solo  : the "sub-Pro" — freelancer with a handful of sites.
 * - pro   : the target tier (highlighted). Unlimited forms = the wedge.
 * - max   : the anchor. High-throughput agencies; makes Pro feel cheap.
 *
 * Email/day caps exist because delivery currently rides Brevo's free tier
 * (300 emails/day aggregate). Caps keep one tenant from exhausting the pool;
 * the Brevo plan upgrades as revenue grows.
 */

export type PlanId = 'free' | 'solo' | 'pro' | 'max';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD
  formLimit: number | null;        // null = unlimited
  submissionsPerMonth: number;
  emailsPerDay: number;
  aiMessages: number | null;       // lifetime for free, per-month for solo, null = unlimited
  whiteLabel: boolean;
  csvExport: boolean;
  analytics: boolean;
  customSender: boolean;           // custom sender name + reply-to on customer emails
  priorityDeliverability: boolean;
  retentionDays: number | null;    // null = unlimited
  apiAccess: boolean;              // API keys + MCP server
  clientPortals: boolean;          // white-label end-client login portals
  endClientLimit: number | null;   // max end-clients; null = unlimited
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    formLimit: 3,
    submissionsPerMonth: 50,
    emailsPerDay: 20,
    aiMessages: 1, // lifetime trial
    whiteLabel: false,
    csvExport: false,
    analytics: false,
    customSender: false,
    priorityDeliverability: false,
    retentionDays: 30,
    apiAccess: false,
    clientPortals: false,
    endClientLimit: 0,
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    priceMonthly: 9,
    formLimit: 10,
    submissionsPerMonth: 500,
    emailsPerDay: 100,
    aiMessages: 100, // per month
    whiteLabel: false,
    csvExport: true,
    analytics: true,
    customSender: true,
    priorityDeliverability: false,
    retentionDays: 365,
    apiAccess: true,
    clientPortals: true,
    endClientLimit: 3,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 19,
    formLimit: null,
    submissionsPerMonth: 2500,
    emailsPerDay: 300,
    aiMessages: null,
    whiteLabel: true,
    csvExport: true,
    analytics: true,
    customSender: true,
    priorityDeliverability: true,
    retentionDays: null,
    apiAccess: true,
    clientPortals: true,
    endClientLimit: 25,
  },
  max: {
    id: 'max',
    name: 'Max',
    priceMonthly: 49,
    formLimit: null,
    submissionsPerMonth: 10000,
    emailsPerDay: 1000,
    aiMessages: null,
    whiteLabel: true,
    csvExport: true,
    analytics: true,
    customSender: true,
    priorityDeliverability: true,
    retentionDays: null,
    apiAccess: true,
    clientPortals: true,
    endClientLimit: null,
  },
};

/** Resolve a stored plan value defensively (unknown/legacy -> free). */
export function getPlan(planId: string | null | undefined): Plan {
  if (planId && planId in PLANS) return PLANS[planId as PlanId];
  return PLANS.free;
}
