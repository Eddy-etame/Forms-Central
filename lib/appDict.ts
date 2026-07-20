import type { Locale } from './i18n';

/**
 * Product (in-app) copy for the authenticated client workspace — separate from
 * the marketing dictionary. French default / English via the same locale
 * resolution (cookie → geo → default). Threaded from server layout/page into
 * the client components as props (no flash, no client cookie read).
 */
interface AppDict {
  sidebar: {
    general: string; overview: string; developer: string; endClients: string;
    yourForms: string; noForms: string; signOut: string; lightMode: string; darkMode: string;
  };
  dashboard: {
    title: string; subtitle: string; newForm: string; exportCsv: string;
    firstLeadTitle: string; firstLeadBody: string;
    createFirstTitle: string; createFirstBody: string;
    totalLeads: string; allTimeVolume: string;
    last7: string; recentMomentum: string;
    activeForms: string; conversionSources: string;
    analyticsLockTitle: string; analyticsLockBody: string; // {n} placeholder
    submissionTrend: string; last30: string;
    topForms: string; byShare: string; noData: string;
    leadDatabase: string; searchPlaceholder: string;
    colDate: string; colForm: string; colIdentity: string; colPreview: string;
    noMatch: string; unknown: string;
    detailsTitle: string; receivedVia: string; // {date} {form} placeholders
    downloadFile: string;
  };
  palette: {
    quickActions: string; searchPlaceholder: string; nothingMatches: string; navigate: string; open: string;
    gNavigate: string; gForms: string; gResources: string; gAccount: string;
    overview: string; overviewHint: string;
    clientPortals: string; clientPortalsHint: string;
    devApi: string; devApiHint: string;
    openForm: string;
    documentation: string; documentationHint: string;
    pricing: string; pricingHint: string;
    signOut: string; signOutHint: string;
  };
  developer: {
    title: string; subtitle: string;
    lockTitle: string; lockBody: string; seePlans: string;
    apiKeys: string; newKeyOnce: string; keyNamePlaceholder: string; creating: string; newKey: string;
    loading: string; noKeys: string; lastUsed: string; neverUsed: string;
    couldNotCreate: string; couldNotReach: string;
    webhooksTitle: string; wDescA: string; wDescB: string; wDescC: string; wDescD: string;
    createFormFirst: string; webhookPlaceholder: string; saving: string; save: string; saved: string; couldNotSave: string; networkError: string;
    mcpTitle: string; mcpDescA: string; mcpDescStrong: string; mcpDescB: string; endpoint: string; toolsAvailable: string;
  };
  endClients: {
    title: string; subtitle: string; newBtn: string;
    lockTitle: string; lockBody: string; seePlans: string;
    createdMsg: string; portalUrl: string; email: string; tempPassword: string;
    namePlaceholder: string; emailPlaceholder: string; creating: string; createBtn: string;
    portalLogin: string; count: string; loading: string;
    emptyTitle: string; emptyBody: string;
    formsTheySee: string; noneAssigned: string; assignForm: string;
    couldNotCreate: string; couldNotReach: string;
  };
}

export const appDictionaries: Record<Locale, AppDict> = {
  en: {
    sidebar: {
      general: 'General', overview: 'Overview', developer: 'Developer', endClients: 'End-clients',
      yourForms: 'Your forms', noForms: 'No forms connected yet.', signOut: 'Sign out', lightMode: 'Light mode', darkMode: 'Dark mode',
    },
    dashboard: {
      title: 'Overview', subtitle: 'Manage your forms and review your latest leads.',
      newForm: 'New form', exportCsv: 'Export CSV',
      firstLeadTitle: 'Your first lead just landed.',
      firstLeadBody: 'The integration works — every submission from here on arrives exactly like this.',
      createFirstTitle: 'Create your first form',
      createFirstBody: 'Name it, copy two values into your website, and submissions start landing here — with spam blocked and branded auto-replies sent for you.',
      totalLeads: 'Total leads', allTimeVolume: 'All-time volume',
      last7: 'Last 7 days', recentMomentum: 'Recent momentum',
      activeForms: 'Active forms', conversionSources: 'Conversion sources',
      analyticsLockTitle: 'Advanced analytics unlocks at 15 leads',
      analyticsLockBody: 'Charts and performance stats unlock automatically once you reach 15 leads. Only {n} more to go!',
      submissionTrend: 'Submission trend', last30: 'Last 30 days',
      topForms: 'Top forms', byShare: 'By share of leads', noData: 'No data yet.',
      leadDatabase: 'Lead database', searchPlaceholder: 'Search name, email…',
      colDate: 'Date', colForm: 'Form', colIdentity: 'Primary identity', colPreview: 'Preview',
      noMatch: 'No leads match your search.', unknown: 'Unknown',
      detailsTitle: 'Submission details',
      receivedVia: 'Received {date} via {form}',
      downloadFile: 'Download file',
    },
    palette: {
      quickActions: 'Quick actions', searchPlaceholder: 'Search forms, pages, actions…',
      nothingMatches: 'Nothing matches', navigate: 'navigate', open: 'open',
      gNavigate: 'Navigate', gForms: 'Forms', gResources: 'Resources', gAccount: 'Account',
      overview: 'Overview', overviewHint: 'Dashboard home',
      clientPortals: 'Client portals', clientPortalsHint: 'End-client access',
      devApi: 'Developer & API', devApiHint: 'Keys, MCP, webhooks',
      openForm: 'Open form',
      documentation: 'Documentation', documentationHint: 'Integration guide',
      pricing: 'Pricing & plans', pricingHint: 'Upgrade',
      signOut: 'Sign out', signOutHint: 'End session',
    },
    developer: {
      title: 'Developer', subtitle: 'API keys and the MCP server — let your AI assistant run your forms.',
      lockTitle: 'API & MCP access starts on the Solo plan', lockBody: 'Connect Claude, Cursor or any MCP client and let it create forms and read your leads for you.', seePlans: 'See plans',
      apiKeys: 'API keys', newKeyOnce: 'Your new key — shown only once, store it now', keyNamePlaceholder: 'Key name (e.g. claude-code)', creating: 'Creating…', newKey: 'New key',
      loading: 'Loading…', noKeys: 'No active keys.', lastUsed: 'last used {date}', neverUsed: 'never used',
      couldNotCreate: 'Could not create the key.', couldNotReach: 'Could not reach the server.',
      webhooksTitle: 'Webhooks — every lead, POSTed to your app',
      wDescA: 'Set an https endpoint per form and every stored lead arrives as a signed',
      wDescB: 'POST — verify the', wDescC: 'header (snippet in the', wDescD: '). Delivery never blocks or loses a lead.',
      createFormFirst: 'Create a form first — webhooks are configured per form.', webhookPlaceholder: 'https://api.yourapp.com/hooks/inlet (empty = disabled)', saving: 'Saving…', save: 'Save', saved: 'Saved.', couldNotSave: 'Could not save.', networkError: 'Network error.',
      mcpTitle: 'MCP server — your AI runs your forms', mcpDescA: 'Connect Claude Code, Cursor, or any MCP client and your assistant can', mcpDescStrong: 'create forms, read leads, and fetch integration snippets', mcpDescB: 'without leaving the editor.', endpoint: 'Endpoint', toolsAvailable: 'Tools available:',
    },
    endClients: {
      title: 'End-clients', subtitle: 'Give each client a private, branded portal to view only their own leads.', newBtn: 'New end-client',
      lockTitle: 'Client portals start on the Solo plan', lockBody: 'Create white-label portals so each client logs in and sees only their leads.', seePlans: 'See plans',
      createdMsg: 'End-client created — share these credentials now (the password is shown only once):', portalUrl: 'Portal URL', email: 'Email', tempPassword: 'Temporary password',
      namePlaceholder: 'Client name (e.g. Acme Corp)', emailPlaceholder: 'client@company.com', creating: 'Creating…', createBtn: 'Create end-client',
      portalLogin: 'Portal login:', count: '{n} / {limit} end-clients', loading: 'Loading…',
      emptyTitle: 'No end-clients yet', emptyBody: 'Create one, then assign the forms whose leads they should see.',
      formsTheySee: 'Forms they can see', noneAssigned: 'None assigned yet.', assignForm: '+ Assign a form…',
      couldNotCreate: 'Could not create the end-client.', couldNotReach: 'Could not reach the server.',
    },
  },
  fr: {
    sidebar: {
      general: 'Général', overview: 'Vue d’ensemble', developer: 'Développeur', endClients: 'Clients finaux',
      yourForms: 'Vos formulaires', noForms: 'Aucun formulaire connecté pour l’instant.', signOut: 'Se déconnecter', lightMode: 'Mode clair', darkMode: 'Mode sombre',
    },
    dashboard: {
      title: 'Vue d’ensemble', subtitle: 'Gérez vos formulaires et consultez vos derniers leads.',
      newForm: 'Nouveau formulaire', exportCsv: 'Exporter CSV',
      firstLeadTitle: 'Votre premier lead vient d’arriver.',
      firstLeadBody: 'L’intégration fonctionne — chaque soumission arrivera désormais exactement comme celle-ci.',
      createFirstTitle: 'Créez votre premier formulaire',
      createFirstBody: 'Nommez-le, copiez deux valeurs dans votre site, et les soumissions commencent à arriver ici — spam bloqué et réponses automatiques à votre image envoyées pour vous.',
      totalLeads: 'Total des leads', allTimeVolume: 'Volume total',
      last7: '7 derniers jours', recentMomentum: 'Dynamique récente',
      activeForms: 'Formulaires actifs', conversionSources: 'Sources de conversion',
      analyticsLockTitle: 'L’analytique avancée se débloque à 15 leads',
      analyticsLockBody: 'Les graphiques et statistiques de performance se débloquent automatiquement dès que vous atteignez 15 leads. Plus que {n} !',
      submissionTrend: 'Tendance des soumissions', last30: '30 derniers jours',
      topForms: 'Meilleurs formulaires', byShare: 'Par part de leads', noData: 'Aucune donnée pour l’instant.',
      leadDatabase: 'Base de leads', searchPlaceholder: 'Rechercher un nom, un e-mail…',
      colDate: 'Date', colForm: 'Formulaire', colIdentity: 'Identité principale', colPreview: 'Aperçu',
      noMatch: 'Aucun lead ne correspond à votre recherche.', unknown: 'Inconnu',
      detailsTitle: 'Détails de la soumission',
      receivedVia: 'Reçu le {date} via {form}',
      downloadFile: 'Télécharger le fichier',
    },
    palette: {
      quickActions: 'Actions rapides', searchPlaceholder: 'Rechercher formulaires, pages, actions…',
      nothingMatches: 'Aucun résultat pour', navigate: 'naviguer', open: 'ouvrir',
      gNavigate: 'Naviguer', gForms: 'Formulaires', gResources: 'Ressources', gAccount: 'Compte',
      overview: 'Vue d’ensemble', overviewHint: 'Accueil du tableau de bord',
      clientPortals: 'Portails clients', clientPortalsHint: 'Accès des clients finaux',
      devApi: 'Développeur & API', devApiHint: 'Clés, MCP, webhooks',
      openForm: 'Ouvrir le formulaire',
      documentation: 'Documentation', documentationHint: 'Guide d’intégration',
      pricing: 'Tarifs & forfaits', pricingHint: 'Passer à un forfait supérieur',
      signOut: 'Se déconnecter', signOutHint: 'Terminer la session',
    },
    developer: {
      title: 'Développeur', subtitle: 'Clés API et serveur MCP — laissez votre assistant IA piloter vos formulaires.',
      lockTitle: 'L’accès API & MCP démarre au forfait Solo', lockBody: 'Connectez Claude, Cursor ou n’importe quel client MCP et laissez-le créer des formulaires et lire vos leads pour vous.', seePlans: 'Voir les forfaits',
      apiKeys: 'Clés API', newKeyOnce: 'Votre nouvelle clé — affichée une seule fois, enregistrez-la maintenant', keyNamePlaceholder: 'Nom de la clé (ex. claude-code)', creating: 'Création…', newKey: 'Nouvelle clé',
      loading: 'Chargement…', noKeys: 'Aucune clé active.', lastUsed: 'utilisée le {date}', neverUsed: 'jamais utilisée',
      couldNotCreate: 'Impossible de créer la clé.', couldNotReach: 'Impossible de joindre le serveur.',
      webhooksTitle: 'Webhooks — chaque lead, envoyé (POST) à votre application',
      wDescA: 'Définissez un endpoint https par formulaire et chaque lead stocké arrive en POST signé',
      wDescB: '— vérifiez l’en-tête', wDescC: '(extrait dans la', wDescD: '). La livraison ne bloque ni ne perd jamais un lead.',
      createFormFirst: 'Créez d’abord un formulaire — les webhooks se configurent par formulaire.', webhookPlaceholder: 'https://api.votreapp.com/hooks/inlet (vide = désactivé)', saving: 'Enregistrement…', save: 'Enregistrer', saved: 'Enregistré.', couldNotSave: 'Impossible d’enregistrer.', networkError: 'Erreur réseau.',
      mcpTitle: 'Serveur MCP — votre IA pilote vos formulaires', mcpDescA: 'Connectez Claude Code, Cursor ou n’importe quel client MCP et votre assistant peut', mcpDescStrong: 'créer des formulaires, lire les leads et récupérer des extraits d’intégration', mcpDescB: 'sans quitter l’éditeur.', endpoint: 'Endpoint', toolsAvailable: 'Outils disponibles :',
    },
    endClients: {
      title: 'Clients finaux', subtitle: 'Offrez à chaque client un portail privé à sa marque pour consulter uniquement ses propres leads.', newBtn: 'Nouveau client final',
      lockTitle: 'Les portails clients démarrent au forfait Solo', lockBody: 'Créez des portails en marque blanche pour que chaque client se connecte et ne voie que ses leads.', seePlans: 'Voir les forfaits',
      createdMsg: 'Client final créé — partagez ces identifiants maintenant (le mot de passe n’est affiché qu’une seule fois) :', portalUrl: 'URL du portail', email: 'E-mail', tempPassword: 'Mot de passe temporaire',
      namePlaceholder: 'Nom du client (ex. Acme Corp)', emailPlaceholder: 'client@entreprise.com', creating: 'Création…', createBtn: 'Créer le client final',
      portalLogin: 'Connexion au portail :', count: '{n} / {limit} clients finaux', loading: 'Chargement…',
      emptyTitle: 'Aucun client final pour l’instant', emptyBody: 'Créez-en un, puis affectez les formulaires dont il doit voir les leads.',
      formsTheySee: 'Formulaires qu’il peut voir', noneAssigned: 'Aucun affecté pour l’instant.', assignForm: '+ Affecter un formulaire…',
      couldNotCreate: 'Impossible de créer le client final.', couldNotReach: 'Impossible de joindre le serveur.',
    },
  },
};

export function getAppDict(locale: Locale): AppDict {
  return appDictionaries[locale];
}
export type { AppDict };
