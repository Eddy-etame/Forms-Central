import type { Locale } from './i18n';

/**
 * Privacy policy and terms of service, both languages, written from what the
 * code actually does (see docs/v3/README.md for the facts behind each line).
 * `{contact}` is replaced at render time by the operator's address.
 */
export const LEGAL_DOCS = ['privacy', 'terms'] as const;
export type LegalDocId = (typeof LEGAL_DOCS)[number];
export function isLegalDoc(v: string): v is LegalDocId {
  return (LEGAL_DOCS as readonly string[]).includes(v);
}

export type LegalSection = { h: string; p?: string[]; ul?: string[] };
export type LegalDoc = { kicker: string; title: string; lead: string; updatedLabel: string; updated: string; seeAlso: string; sections: LegalSection[] };

const UPDATED = { en: '8 November 2026', fr: '8 novembre 2026' };

const EN: Record<LegalDocId, LegalDoc> = {
  privacy: {
    kicker: 'Legal',
    title: 'Privacy policy',
    lead: 'How Inlet handles the data of developers, of their clients and of the people who submit a form. Short, in plain words, and true to what the code does.',
    updatedLabel: 'Last updated:',
    updated: UPDATED.en,
    seeAlso: 'See also:',
    sections: [
      { h: 'Who is responsible', p: [
        'Inlet is a service operated by EAM (“we”). You can reach us at {contact}.',
        'For your developer account and the client contacts you add, we decide how the data is used: we are the controller.',
        'For leads — what visitors type into a form on a site you built — you and your client decide; we only store and deliver them on your instructions, as a processor. The privacy notice those visitors rely on is the one published on that site.',
      ] },
      { h: 'What we collect', ul: [
        'Developer account: name or company, e-mail address, a password hash (never the password), plan, API keys stored as hashes, the webhook signing secret, and sign-in events (time, IP address) kept for security.',
        'Clients you add: business name, e-mail address, website, language, and a password hash once they set one for their inbox.',
        'Leads: the fields the form sends (typically name, e-mail, message, sometimes a file), the time, the visitor’s IP address and a technical fingerprint used only to stop spam, and the spam status we assigned.',
        'Visits to the public pages: the path, the referring page, the browser’s user agent and a salted hash of the IP address — never the address itself — under a first-party cookie. No advertising network, no cross-site tracking.',
        'The assistant: the messages you send it, counted against your plan’s quota. Signed-out visitors get a random identifier in a cookie for their trial message.',
      ] },
      { h: 'Why, and on what basis', ul: [
        'To run the service you signed up for: storing leads, sending notifications and auto-replies, the dashboard, the API and the MCP server (performance of a contract).',
        'To keep it safe: rate limits, the honeypot, proof-of-work, automatic bans by IP, fingerprint and reverse-DNS host, sign-in protection (our legitimate interest in security, and yours).',
        'To understand which public pages are read, in aggregate (legitimate interest; the data cannot identify you).',
        'To meet legal obligations, such as keeping invoicing records.',
      ] },
      { h: 'Cookies', p: [
        'Inlet sets only first-party cookies: a session cookie for developers, one for client inboxes and one for the operator; the language you chose; the visit identifier for the public pages; the assistant identifier for signed-out visitors; and a short-lived state cookie during Google sign-in. None of them is used for advertising.',
      ] },
      { h: 'Where the data lives, and for how long', ul: [
        'Hosting, database and file storage run in the European Union.',
        'Account and client data stay as long as the account exists, and are deleted within 30 days after you ask us to close it.',
        'Leads are kept for the retention window of your plan: 30 days on Free, one year on Solo, without limit on Pro and Max. Leads past the window may be deleted at any time, together with their attachments. Export is one click, on every plan.',
        'Security logs and automatic bans expire on their own after a limited time.',
        'File attachments are stored at unguessable addresses; anyone holding the exact link can open the file, so treat lead e-mails as confidential.',
      ] },
      { h: 'Who else sees the data', ul: [
        'Our hosting and content-delivery provider (Vercel) and our database and storage provider (Supabase), both configured in European regions.',
        'E-mail delivery providers, which carry the notifications and auto-replies.',
        'AI model providers for the assistant (Google Gemini, with Groq as a fallback): they receive the messages you send the assistant. Lead content is sent to a model only when the optional spam classification is switched on; it is off by default.',
        'Your clients, who receive their leads by e-mail and in their inbox, and the endpoints you configured for webhooks.',
        'Some providers are established outside the European Union; those transfers rely on the providers’ standard contractual clauses or an adequacy decision. We never sell data.',
      ] },
      { h: 'Your rights', p: [
        'You can ask for access, correction, deletion, restriction or a copy of your data, and object to processing based on our legitimate interest. Leads export from the dashboard as CSV at any time. Write to {contact}; we answer within a month. You may also complain to your data-protection authority.',
        'If you submitted a form on a site built with Inlet, the site owner is your first contact; we help them answer you.',
      ] },
      { h: 'Security', p: [
        'Traffic is encrypted in transit. Passwords are hashed with scrypt, API keys are stored as hashes, webhooks are signed, sign-in can require a second factor by e-mail, and every read and write is scoped to the account that owns the data. No system is perfect: if you find a weakness, tell us at {contact} — we fix first and talk after.',
      ] },
      { h: 'Changes', p: ['When this policy changes in a way that matters, we say so in the dashboard and update the date above.'] },
    ],
  },
  terms: {
    kicker: 'Legal',
    title: 'Terms of service',
    lead: 'The agreement between you, the developer who opens an Inlet account, and EAM, which operates Inlet.',
    updatedLabel: 'Last updated:',
    updated: UPDATED.en,
    seeAlso: 'See also:',
    sections: [
      { h: 'The service', p: [
        'Inlet is a form backend: your sites post form fields to a form URL; we store each lead, deliver it to the client the form belongs to (by e-mail and in a private inbox), send the visitor a branded auto-reply, filter spam, and expose your data through a dashboard, an API and an MCP server. The features and limits of each plan are the ones listed on the pricing page.',
      ] },
      { h: 'Your account', ul: [
        'You must be at least 18 and give accurate details. Keep your password, API keys and webhook secret confidential; what happens under your keys is yours.',
        'Clients you add are people or businesses you work with. You are responsible for inviting the right e-mail address and for what your clients do with their inbox.',
      ] },
      { h: 'Your clients’ visitors', ul: [
        'You confirm that you may collect the data your forms ask for, and that the site carries a privacy notice naming the purpose and naming Inlet as a processor.',
        'We process leads only to store, deliver, protect and return them, as described in the privacy policy, which forms part of these terms. You remain the controller.',
      ] },
      { h: 'What you may not do', ul: [
        'Send unsolicited bulk e-mail, phishing or deceptive content through the service, or use it to harass anyone.',
        'Submit content that is unlawful, infringes someone’s rights, or contains special categories of data (health, beliefs, biometrics and the like) without a valid legal basis.',
        'Probe, overload or circumvent the anti-spam, the rate limits or the plan quotas, or spread one business across several free accounts to avoid paying.',
        'Resell access to Inlet as such without our written agreement; building client sites on it is exactly what it is for.',
      ] },
      { h: 'Plans and payment', ul: [
        'The Free plan costs nothing and has no time limit. Paid plans are priced per month in US dollars, taxes excluded, as shown on the pricing page.',
        'Today a paid plan is activated on request and invoiced; card checkout opens with invoicing. We tell you at least 30 days before a price changes.',
        'Over your monthly quota, leads keep being stored; only outgoing e-mail pauses until the next cycle or an upgrade.',
      ] },
      { h: 'Availability and support', p: [
        'We run Inlet with care but without a guaranteed uptime on the Free plan; maintenance may interrupt the service briefly. Support goes through {contact}; Max includes priority answers.',
      ] },
      { h: 'Your data', ul: [
        'Your leads are yours. You can export them as CSV at any time, on every plan.',
        'Leads are kept for the retention window of your plan (see pricing) and may be deleted after it, with their attachments.',
        'When you close your account, we delete its data within 30 days, except what the law requires us to keep.',
      ] },
      { h: 'Suspension and termination', p: [
        'We may suspend an account that breaks these terms, endangers the service or others, or stops paying for a paid plan, and we tell you why unless the law forbids it. You may stop using Inlet at any time by asking us to close your account.',
      ] },
      { h: 'Liability', p: [
        'Inlet is provided as it is. Within what the law allows, we are not liable for indirect losses, lost profits or lost data caused by a missed or delayed lead, and our total liability under these terms is limited to the fees you paid us in the twelve months before the claim. Nothing here limits a liability that cannot be limited by law.',
      ] },
      { h: 'Changes to these terms', p: [
        'If we change these terms in a way that matters, we tell you in the dashboard or by e-mail at least 30 days before the change applies. Continuing to use Inlet after that date means you accept the new terms.',
      ] },
      { h: 'Law and disputes', p: [
        'These terms are governed by the law of the country where the operator is established, without prejudice to mandatory rules that protect you where you live. We try to settle any disagreement amicably first; write to {contact}.',
      ] },
    ],
  },
};

const FR: Record<LegalDocId, LegalDoc> = {
  privacy: {
    kicker: 'Mentions légales',
    title: 'Politique de confidentialité',
    lead: 'Comment Inlet traite les données des développeurs, de leurs clients et des personnes qui envoient un formulaire. Court, en mots simples, et fidèle à ce que fait le code.',
    updatedLabel: 'Dernière mise à jour :',
    updated: UPDATED.fr,
    seeAlso: 'Voir aussi :',
    sections: [
      { h: 'Qui est responsable', p: [
        'Inlet est un service exploité par EAM (« nous »). Vous pouvez nous écrire à {contact}.',
        'Pour votre compte développeur et les contacts clients que vous ajoutez, c’est nous qui décidons de l’usage des données : nous sommes responsable de traitement.',
        'Pour les leads — ce que les visiteurs saisissent dans un formulaire d’un site que vous avez construit — c’est vous et votre client qui décidez ; nous ne faisons que les stocker et les transmettre selon vos instructions, en tant que sous-traitant. L’information que lisent ces visiteurs est celle publiée sur ce site.',
      ] },
      { h: 'Ce que nous collectons', ul: [
        'Compte développeur : nom ou entreprise, adresse e-mail, une empreinte du mot de passe (jamais le mot de passe), forfait, clés API stockées sous forme d’empreintes, le secret de signature des webhooks, et les événements de connexion (heure, adresse IP) conservés pour la sécurité.',
        'Clients que vous ajoutez : nom de l’entreprise, adresse e-mail, site web, langue, et une empreinte de mot de passe dès qu’ils en choisissent un pour leur boîte.',
        'Leads : les champs envoyés par le formulaire (en général nom, e-mail, message, parfois un fichier), l’heure, l’adresse IP du visiteur et une empreinte technique utilisées uniquement contre le spam, et le statut anti-spam attribué.',
        'Visites des pages publiques : le chemin, la page d’origine, le navigateur et un hachage salé de l’adresse IP — jamais l’adresse elle-même — sous un cookie propre au site. Aucune régie publicitaire, aucun suivi entre sites.',
        'L’assistant : les messages que vous lui envoyez, décomptés du quota de votre forfait. Les visiteurs non connectés reçoivent un identifiant aléatoire dans un cookie pour leur message d’essai.',
      ] },
      { h: 'Pourquoi, et sur quelle base', ul: [
        'Pour fournir le service auquel vous avez souscrit : stockage des leads, envoi des notifications et des réponses automatiques, tableau de bord, API et serveur MCP (exécution du contrat).',
        'Pour le protéger : limites de débit, honeypot, preuve de travail, bannissements automatiques par IP, empreinte et hôte DNS inversé, protection des connexions (notre intérêt légitime à la sécurité, et le vôtre).',
        'Pour savoir quelles pages publiques sont lues, de façon agrégée (intérêt légitime ; ces données ne permettent pas de vous identifier).',
        'Pour respecter nos obligations légales, comme la conservation des pièces de facturation.',
      ] },
      { h: 'Cookies', p: [
        'Inlet ne dépose que des cookies propres au site : un cookie de session pour les développeurs, un pour les boîtes clients et un pour l’opérateur ; la langue choisie ; l’identifiant de visite des pages publiques ; l’identifiant de l’assistant pour les visiteurs non connectés ; et un cookie d’état de courte durée pendant la connexion Google. Aucun ne sert à la publicité.',
      ] },
      { h: 'Où sont les données, et combien de temps', ul: [
        'L’hébergement, la base de données et le stockage de fichiers tournent dans l’Union européenne.',
        'Les données de compte et de clients restent tant que le compte existe, et sont supprimées dans les 30 jours après votre demande de fermeture.',
        'Les leads sont conservés pendant la durée de rétention de votre forfait : 30 jours en Free, un an en Solo, sans limite en Pro et Max. Les leads au-delà de cette durée peuvent être supprimés à tout moment, avec leurs pièces jointes. L’export tient en un clic, quel que soit le forfait.',
        'Les journaux de sécurité et les bannissements automatiques expirent d’eux-mêmes après une durée limitée.',
        'Les pièces jointes sont stockées à des adresses impossibles à deviner ; quiconque détient le lien exact peut ouvrir le fichier : traitez les e-mails de leads comme confidentiels.',
      ] },
      { h: 'Qui d’autre voit les données', ul: [
        'Notre hébergeur et réseau de diffusion (Vercel) et notre fournisseur de base de données et de stockage (Supabase), tous deux configurés dans des régions européennes.',
        'Les prestataires d’envoi d’e-mails, qui acheminent notifications et réponses automatiques.',
        'Les fournisseurs de modèles d’IA pour l’assistant (Google Gemini, avec Groq en secours) : ils reçoivent les messages que vous envoyez à l’assistant. Le contenu des leads n’est transmis à un modèle que si la classification anti-spam optionnelle est activée ; elle est désactivée par défaut.',
        'Vos clients, qui reçoivent leurs leads par e-mail et dans leur boîte, et les points de terminaison que vous avez configurés pour les webhooks.',
        'Certains prestataires sont établis hors de l’Union européenne ; ces transferts reposent sur leurs clauses contractuelles types ou sur une décision d’adéquation. Nous ne vendons jamais de données.',
      ] },
      { h: 'Vos droits', p: [
        'Vous pouvez demander l’accès, la rectification, la suppression, la limitation ou une copie de vos données, et vous opposer aux traitements fondés sur notre intérêt légitime. Les leads s’exportent en CSV depuis le tableau de bord à tout moment. Écrivez à {contact} ; nous répondons sous un mois. Vous pouvez aussi saisir votre autorité de protection des données.',
        'Si vous avez envoyé un formulaire sur un site construit avec Inlet, le propriétaire du site est votre premier interlocuteur ; nous l’aidons à vous répondre.',
      ] },
      { h: 'Sécurité', p: [
        'Le trafic est chiffré en transit. Les mots de passe sont hachés avec scrypt, les clés API stockées sous forme d’empreintes, les webhooks signés, la connexion peut exiger un second facteur par e-mail, et chaque lecture ou écriture est limitée au compte propriétaire des données. Aucun système n’est parfait : si vous trouvez une faille, écrivez à {contact} — nous corrigeons d’abord et discutons ensuite.',
      ] },
      { h: 'Modifications', p: ['Quand cette politique change de façon significative, nous le disons dans le tableau de bord et mettons à jour la date ci-dessus.'] },
    ],
  },
  terms: {
    kicker: 'Mentions légales',
    title: 'Conditions d’utilisation',
    lead: 'L’accord entre vous, développeur qui ouvre un compte Inlet, et EAM, qui exploite Inlet.',
    updatedLabel: 'Dernière mise à jour :',
    updated: UPDATED.fr,
    seeAlso: 'Voir aussi :',
    sections: [
      { h: 'Le service', p: [
        'Inlet est un backend de formulaires : vos sites envoient les champs d’un formulaire à une URL ; nous stockons chaque lead, le transmettons au client auquel appartient le formulaire (par e-mail et dans une boîte privée), envoyons au visiteur une réponse automatique à l’image du client, filtrons le spam, et exposons vos données via un tableau de bord, une API et un serveur MCP. Les fonctionnalités et limites de chaque forfait sont celles de la page Tarifs.',
      ] },
      { h: 'Votre compte', ul: [
        'Vous devez avoir au moins 18 ans et fournir des informations exactes. Gardez confidentiels votre mot de passe, vos clés API et votre secret de webhook ; ce qui se passe sous vos clés vous engage.',
        'Les clients que vous ajoutez sont des personnes ou des entreprises avec lesquelles vous travaillez. Vous êtes responsable d’inviter la bonne adresse e-mail et de l’usage que vos clients font de leur boîte.',
      ] },
      { h: 'Les visiteurs de vos clients', ul: [
        'Vous confirmez avoir le droit de collecter les données demandées par vos formulaires, et que le site affiche une information sur la vie privée indiquant la finalité et nommant Inlet comme sous-traitant.',
        'Nous ne traitons les leads que pour les stocker, les transmettre, les protéger et vous les restituer, comme décrit dans la politique de confidentialité, qui fait partie des présentes conditions. Vous restez responsable de traitement.',
      ] },
      { h: 'Ce que vous ne pouvez pas faire', ul: [
        'Envoyer des e-mails de masse non sollicités, du hameçonnage ou des contenus trompeurs via le service, ou l’utiliser pour harceler quiconque.',
        'Soumettre des contenus illicites, portant atteinte aux droits d’autrui, ou contenant des catégories particulières de données (santé, convictions, biométrie et assimilées) sans base légale valable.',
        'Sonder, surcharger ou contourner l’anti-spam, les limites de débit ou les quotas des forfaits, ou répartir une même activité sur plusieurs comptes gratuits pour éviter de payer.',
        'Revendre l’accès à Inlet en tant que tel sans notre accord écrit ; construire des sites clients avec Inlet est exactement sa raison d’être.',
      ] },
      { h: 'Forfaits et paiement', ul: [
        'Le forfait Free est gratuit et sans limite de durée. Les forfaits payants sont facturés par mois en dollars américains, hors taxes, aux prix de la page Tarifs.',
        'Aujourd’hui un forfait payant est activé sur demande et facturé ; le paiement par carte arrive avec la facturation. Nous vous prévenons au moins 30 jours avant tout changement de prix.',
        'Au-delà de votre quota mensuel, les leads continuent d’être stockés ; seuls les envois d’e-mails sont suspendus jusqu’au cycle suivant ou à un changement de forfait.',
      ] },
      { h: 'Disponibilité et support', p: [
        'Nous exploitons Inlet avec soin mais sans disponibilité garantie sur le forfait Free ; une maintenance peut interrompre brièvement le service. Le support passe par {contact} ; Max inclut des réponses prioritaires.',
      ] },
      { h: 'Vos données', ul: [
        'Vos leads vous appartiennent. Vous pouvez les exporter en CSV à tout moment, quel que soit le forfait.',
        'Les leads sont conservés pendant la durée de rétention de votre forfait (voir Tarifs) et peuvent être supprimés ensuite, avec leurs pièces jointes.',
        'Quand vous fermez votre compte, nous supprimons ses données dans les 30 jours, sauf ce que la loi nous impose de conserver.',
      ] },
      { h: 'Suspension et résiliation', p: [
        'Nous pouvons suspendre un compte qui enfreint ces conditions, met en danger le service ou des tiers, ou cesse de payer un forfait payant, et nous vous en donnons la raison sauf si la loi l’interdit. Vous pouvez cesser d’utiliser Inlet à tout moment en demandant la fermeture de votre compte.',
      ] },
      { h: 'Responsabilité', p: [
        'Inlet est fourni en l’état. Dans la mesure permise par la loi, nous ne répondons pas des pertes indirectes, manques à gagner ou pertes de données causés par un lead manqué ou retardé, et notre responsabilité totale au titre des présentes est limitée aux sommes que vous nous avez versées au cours des douze mois précédant la réclamation. Rien ici ne limite une responsabilité qui ne peut l’être légalement.',
      ] },
      { h: 'Modification des conditions', p: [
        'Si nous modifions ces conditions de façon significative, nous vous prévenons dans le tableau de bord ou par e-mail au moins 30 jours avant leur entrée en vigueur. Continuer à utiliser Inlet après cette date vaut acceptation des nouvelles conditions.',
      ] },
      { h: 'Droit applicable et litiges', p: [
        'Les présentes conditions sont régies par le droit du pays où l’opérateur est établi, sans préjudice des règles impératives qui vous protègent là où vous résidez. Nous cherchons d’abord une solution amiable à tout désaccord ; écrivez à {contact}.',
      ] },
    ],
  },
};

export function getLegal(locale: Locale): Record<LegalDocId, LegalDoc> {
  return locale === 'fr' ? FR : EN;
}
