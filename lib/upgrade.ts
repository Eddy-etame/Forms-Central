/**
 * Upgrade intent link. Self-serve checkout isn't live yet, so a paid-plan CTA
 * opens a pre-filled email to activate the upgrade (same-day, per the pricing
 * copy). Single source for the /pricing page and the post-signup plan screen.
 */
const UPGRADE_TO = 'eddy.eetame@gmail.com';

export function upgradeMailto(plan: string, accountEmail = ''): string {
  const subject = encodeURIComponent(`Inlet ${plan} upgrade`);
  const body = encodeURIComponent(
    `Hi, I'd like to upgrade my Inlet account to ${plan}. My account email is: ${accountEmail}`
  );
  return `mailto:${UPGRADE_TO}?subject=${subject}&body=${body}`;
}
