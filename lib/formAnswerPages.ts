/**
 * The two plain pages the submit endpoint shows a visitor whose browser posted
 * a form without JavaScript: "sent" (when there is nowhere to send them back
 * to) and "not sent".
 *
 * They are read by the visitors of a client's site, not by developers, so
 * they speak to a visitor, in the visitor's language, and keep the technical
 * line — the code a developer needs — small and apart. Every value written
 * into them is escaped; they carry no inline script (the "back" link is wired
 * by public/form-back.js, the one script their policy allows).
 *
 * No imports: testable alone.
 */

export type AnswerLang = 'fr' | 'en';

/** English for a browser that asks for English first; French otherwise (the product's default). */
export function answerLang(acceptLanguage: string | null | undefined): AnswerLang {
  return /^\s*en\b/i.test(acceptLanguage || '') ? 'en' : 'fr';
}

export function escapeHtml(text: string): string {
  return String(text).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] as string));
}

const OK_CSS = `body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#F9FAFB;color:#0F172A}.card{background:#fff;padding:2.5rem;border-radius:1.5rem;border:1px solid #F1F5F9;box-shadow:0 10px 15px -3px rgba(0,0,0,.05);text-align:center;max-width:400px}.icon{font-size:3rem;margin-bottom:1rem}h1{font-size:1.25rem;font-weight:700;margin:0 0 .5rem}p{font-size:.875rem;color:#64748B;line-height:1.6;margin:0}.back{display:inline-block;margin-top:1.5rem;padding:.625rem 1.25rem;background:#0F172A;color:#fff;text-decoration:none;border-radius:.75rem;font-size:.875rem;font-weight:600}`;
const ERR_CSS = `body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FFF5F5;color:#9B2C2C}.card{background:#fff;padding:2.5rem;border-radius:1.5rem;border:1px solid #FED7D7;box-shadow:0 10px 15px -3px rgba(0,0,0,.05);text-align:center;max-width:450px}.icon{font-size:3rem;margin-bottom:1rem;color:#E53E3E}h1{font-size:1.25rem;font-weight:700;margin:0 0 .5rem}p{font-size:.875rem;color:#C53030;line-height:1.6;margin:0}.code{font-family:monospace;background:#FEEBC8;color:#C05621;padding:.2rem .4rem;border-radius:.25rem;font-size:.75rem;display:inline-block;margin-top:.5rem}.remedy{margin-top:1rem;font-size:.875rem;color:#742A2A;background:#FED7D7;padding:.75rem;border-radius:.5rem;border:1px solid #FC8181}.back{display:inline-block;margin-top:1.5rem;padding:.625rem 1.25rem;background:#E53E3E;color:#fff;text-decoration:none;border-radius:.75rem;font-size:.875rem;font-weight:600}.dev{margin-top:1.25rem;padding-top:1rem;border-top:1px solid #FED7D7;font-size:.75rem;line-height:1.5;color:#9B2C2C;text-align:left}.dev b{display:block;margin-bottom:.25rem;font-weight:600}`;

const COPY = {
  en: {
    sentTitle: 'Message sent',
    sentBody: 'Your message has been received.',
    backToSite: 'Back to the site',
    failTitle: 'Your message could not be sent',
    failBody: 'Go back to the form and try again in a moment. If it keeps happening, contact the site another way.',
    backToForm: 'Back to the form',
    forDeveloper: 'For the developer of this site',
    remedy: 'What to do:',
    specific: {
      RATE_LIMIT_EXCEEDED: 'Too many submissions in a short time. Wait a minute, then try again.',
      SENDER_BLACKLISTED: 'Submissions from your connection are paused for 24 hours. Try again later, without a VPN or a proxy.',
      HOST_BLACKLISTED: 'Submissions from your connection are paused for 24 hours. Try again later, without a VPN or a proxy.',
      PAYLOAD_TOO_LARGE: 'What you sent is too large. Make the attached files smaller, then try again.',
    } as Record<string, string>,
  },
  fr: {
    sentTitle: 'Message envoyé',
    sentBody: 'Votre message a bien été reçu.',
    backToSite: 'Retour au site',
    failTitle: 'Votre message n’a pas pu être envoyé',
    failBody: 'Revenez au formulaire et réessayez dans un instant. Si le problème continue, contactez le site par un autre moyen.',
    backToForm: 'Retour au formulaire',
    forDeveloper: 'Pour le développeur de ce site',
    remedy: 'À faire :',
    specific: {
      RATE_LIMIT_EXCEEDED: 'Trop d’envois en peu de temps. Patientez une minute, puis réessayez.',
      SENDER_BLACKLISTED: 'Les envois depuis votre connexion sont suspendus pendant 24 heures. Réessayez plus tard, sans VPN ni proxy.',
      HOST_BLACKLISTED: 'Les envois depuis votre connexion sont suspendus pendant 24 heures. Réessayez plus tard, sans VPN ni proxy.',
      PAYLOAD_TOO_LARGE: 'Votre envoi est trop volumineux. Réduisez la taille des fichiers joints, puis réessayez.',
    } as Record<string, string>,
  },
};

// On a small screen the card keeps a margin and the page can scroll.
const SMALL_SCREENS = 'body{height:auto;min-height:100vh}.card{margin:1rem}';
const BACK_SCRIPT = '<script src="/form-back.js" defer></script>';
const shell = (lang: AnswerLang, title: string, css: string, card: string) =>
  `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title>
<style>${css}${SMALL_SCREENS}</style></head>
<body><div class="card">${card}</div>${BACK_SCRIPT}</body></html>`;

export function successPageHtml(lang: AnswerLang): string {
  const c = COPY[lang];
  return shell(lang, c.sentTitle, OK_CSS, `<div class="icon">✓</div><h1>${c.sentTitle}</h1><p>${c.sentBody}</p><a href="#" data-back class="back">${c.backToSite}</a>`);
}

export function errorPageHtml(lang: AnswerLang, e: { code: string; message: string; remedy?: string | null }): string {
  const c = COPY[lang];
  const said = c.specific[e.code] ?? c.failBody;
  const technical =
    `<div class="dev"><b>${c.forDeveloper}</b><span class="code">${escapeHtml(e.code)}</span> ${escapeHtml(e.message)}` +
    (e.remedy ? `<br><strong>${c.remedy}</strong> ${escapeHtml(e.remedy)}` : '') +
    `</div>`;
  return shell(lang, c.failTitle, ERR_CSS, `<div class="icon">⚠</div><h1>${c.failTitle}</h1><p>${said}</p><a href="#" data-back class="back">${c.backToForm}</a>${technical}`);
}
