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
  },
};

export function getAppDict(locale: Locale): AppDict {
  return appDictionaries[locale];
}
export type { AppDict };
