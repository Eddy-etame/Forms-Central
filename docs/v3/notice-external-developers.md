# Notice to the external developers — new origin (draft, not sent)

Status: **draft**. The author decides when (and whether) to send it, and the
shut-down date of the old deployment. Five accounts created their forms on the
old origin from the public signup; the author's own client sites were already
moved on 2026-11-07.

What stays true whatever they do: the old deployment and the new one read the
same database, so leads keep arriving in the same dashboard until the old
deployment is switched off. Nothing breaks on the day of the notice.

Placeholders: `{first name}` and `{date}` (the shut-down date of
`inlett.vercel.app`, at least 30 days after sending).

---

## English

**Subject:** Inlet has a new address — one line to change before {date}

Hi {first name},

Inlet, the form backend your site posts to, now lives at a new address:

    https://eam-inlet.vercel.app

Your forms, your leads and your login are unchanged. The only thing to update
is the address your site sends to:

- **HTML forms:** in the `action` attribute, replace `https://inlett.vercel.app`
  with `https://eam-inlet.vercel.app`.
- **JavaScript / frameworks:** change the `FORM_API_URL` value (or the `fetch`
  URL) the same way. Your `FORM_ID` does not change.

The old address keeps working until **{date}**, so there is no rush, but it
will stop answering after that day.

Your dashboard: https://eam-inlet.vercel.app/developer/login — same e-mail,
same password. Since your last visit, every form belongs to a client of yours
(the business the site is built for), who receives the leads by e-mail and in
a private inbox. Your existing forms were attached to a default client made
from your own details; rename it from the **Clients** page whenever you like.

If anything looks off after the change, reply to this e-mail.

— Eddy, Inlet

## Français

**Objet :** Inlet change d’adresse — une ligne à modifier avant le {date}

Bonjour {first name},

Inlet, le service qui reçoit les formulaires de votre site, a une nouvelle
adresse :

    https://eam-inlet.vercel.app

Vos formulaires, vos leads et votre accès ne changent pas. La seule chose à
mettre à jour est l’adresse vers laquelle votre site envoie :

- **Formulaires HTML :** dans l’attribut `action`, remplacez
  `https://inlett.vercel.app` par `https://eam-inlet.vercel.app`.
- **JavaScript / frameworks :** modifiez de la même façon la valeur
  `FORM_API_URL` (ou l’URL du `fetch`). Votre `FORM_ID` ne change pas.

L’ancienne adresse continue de fonctionner jusqu’au **{date}** ; rien ne
presse, mais elle ne répondra plus après cette date.

Votre tableau de bord : https://eam-inlet.vercel.app/developer/login — même
e-mail, même mot de passe. Depuis votre dernière visite, chaque formulaire
appartient à l’un de vos clients (l’entreprise pour laquelle le site est
construit), qui reçoit les leads par e-mail et dans une boîte privée. Vos
formulaires existants ont été rattachés à un client par défaut créé à partir
de vos propres coordonnées ; renommez-le depuis la page **Clients** quand vous
voulez.

Si quelque chose vous semble anormal après le changement, répondez à cet
e-mail.

— Eddy, Inlet

---

## Who (from the database, 2026-11-07, addresses masked)

| Account | Plan | Signed up | Forms on the old origin |
|---------|------|-----------|-------------------------|
| con***@marchedemo.com | free | 2026-06-04 | yes |
| rhe***@gmail.com | free | 2026-06-04 | yes |
| Rem***@gmail.com | free | 2026-06-05 | yes |
| yam***@gmail.com | free | 2026-10-21 | yes |
| ali***@gmail.com | free | 2026-10-22 | yes |

The exact addresses are in the `clients` table; the notice goes out from the
operator mailbox, one message per developer, no bulk tool.
