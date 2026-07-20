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
  },
};

export function getAppDict(locale: Locale): AppDict {
  return appDictionaries[locale];
}
export type { AppDict };
