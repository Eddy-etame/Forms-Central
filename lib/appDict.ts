import type { Locale } from './i18n';

/**
 * Product (in-app) copy for the authenticated client workspace — separate from
 * the marketing dictionary. French default / English via the same locale
 * resolution (cookie → geo → default). Threaded from server layout/page into
 * the client components as props (no flash, no client cookie read).
 */
interface AppDict {
  auth: {
    shell: {
      badgeText: string; headlineA: string; headlineHighlight: string;
      point1Title: string; point1Desc: string; point2Title: string; point2Desc: string; point3Title: string; point3Desc: string;
      footerTagline: string; backToSite: string; orDivider: string;
    };
    adminLogin: {
      enterCode: string; adminAccess: string; codeEmailedBody: string; enterPasswordBody: string;
      verificationCodeLabel: string; verifying: string; verifyAndSignIn: string; backToPassword: string;
      passwordLabel: string; signingIn: string; signIn: string;
      errTooMany: string; errIncorrectPassword: string; errNetwork: string; errIncorrectCode: string;
    };
    clientLogin: {
      enterCode: string; codeEmailedBody: string; verificationCodeLabel: string; verifying: string;
      verifyAndSignIn: string; useDifferentAccount: string;
      welcomeBack: string; subtitle: string; googleSignIn: string;
      emailLabel: string; passwordLabel: string; forgotPassword: string; signingIn: string; signIn: string;
      noAccount: string; createOneFree: string;
      errGoogleFailed: string; errEvicted: string; errTooMany: string; errIncorrect: string; errNetwork: string; errIncorrectCode: string;
    };
    clientSignup: {
      title: string; subtitle: string; googleSignUp: string;
      nameLabel: string; namePlaceholder: string; emailLabel: string; passwordLabel: string; passwordPlaceholder: string;
      creating: string; createAccount: string; alreadyHave: string; signIn: string;
      errCouldNotCreate: string; errNetwork: string;
    };
    forgotPassword: {
      title: string; checkInbox: string; enterEmailBody: string; emailLabel: string;
      sending: string; sendResetLink: string; confirmBody: string; backToSignIn: string;
    };
    resetPassword: {
      passwordUpdated: string; chooseNewPassword: string; canSignInNow: string; enterNewPasswordBody: string; goToSignIn: string;
      missingTokenA: string; missingTokenB: string; forgotPasswordLinkText: string;
      newPasswordLabel: string; newPasswordPlaceholder: string; confirmPasswordLabel: string; confirmPasswordPlaceholder: string;
      updating: string; updatePassword: string;
      errTooShort: string; errMismatch: string; errCouldNotReset: string; errNetwork: string; loading: string;
    };
  };
  choosePlan: {
    kicker: string; title: string; subtitle: string;
    recommended: string; ctaChoose: string; continueFree: string; freeNote: string;
  };
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
    nf: {
      createTitle: string; liveTitle: string; nameHint: string; nameLabel: string; namePlaceholder: string;
      seePro: string; creating: string; createBtn: string;
      readyBody: string; openGuide: string; done: string; couldNotCreate: string; couldNotReach: string;
      clientLabel: string; clientPlaceholder: string; newClientOption: string; needClient: string;
      clientNameLabel: string; clientEmailLabel: string; clientEmailHint: string; siteUrlLabel: string; siteUrlHint: string;
      langLabel: string; inviteLabel: string; leadsGoTo: string; noEmailInCode: string; originsOpenWarn: string;
      envTitle: string; openSettings: string;
    };
    onboarding: {
      kicker: string; title: string; subtitle: string;
      s1Title: string; s1Done: string; s1Forms: string; s1Body: string;
      s2Title: string; s2Body: string; jsAlt: string; readDocs: string; orPointAiAt: string;
      s3Title: string; s3Body: string; waiting: string;
      footer: string; copy: string; copied: string;
    };
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
    emailedMsg: string;
    namePlaceholder: string; emailPlaceholder: string; creating: string; createBtn: string;
    portalLogin: string; count: string; loading: string;
    emptyTitle: string; emptyBody: string;
    formsTheySee: string; noneAssigned: string; assignForm: string;
    couldNotCreate: string; couldNotReach: string;
    resetBtn: string; resetConfirmTitle: string; resetConfirmBody: string; resetConfirmBtn: string; cancel: string;
    resetting: string; resetOk: string; resetErr: string;
    websiteLabel: string; websitePlaceholder: string; langLabel: string; inviteNow: string; inviteHint: string;
    sendAccess: string; resendAccess: string; accessSent: string; hasAccess: string; noAccessYet: string;
    notifyLeads: string; edit: string; save: string; cancelEdit: string; deleteBlocked: string; deleteConfirmTitle: string; deleteConfirmBody: string; deleteBtn: string;
    leadsBy: string; createdExisting: string;
  };
  formPage: {
    formView: string; subtitle: string; exportCsv: string;
    totalSubmissions: string; forThisForm: string; trend30: string;
    moreDataTitle: string; moreDataBody: string;
    structuredData: string; searchResults: string;
    date: string; more: string; noData: string; file: string; viewDetails: string;
    fullSubmission: string; submittedAt: string; attachedDoc: string; downloadFile: string;
    settings: {
      title: string; subtitle: string; loading: string;
      nameLabel: string; clientLabel: string; originsLabel: string; originsHint: string;
      successUrlLabel: string; successUrlHint: string; webhookLabel: string; webhookHint: string;
      autoReplyLabel: string; autoReplyHint: string; subjectLabel: string; messageLabel: string; messageHint: string;
      developerCopyLabel: string; developerCopyHint: string; activeLabel: string; activeHint: string;
      save: string; saving: string; saved: string; saveErr: string;
      integrationTitle: string; integrationSubtitle: string; leadsGoTo: string;
      deleteTitle: string; deleteBody: string; deleteBtn: string; deleteErr: string; cancel: string;
    };
  };
  snippets: { copy: string; copied: string; helperTab: string; filesHint: string; noEmail: string };
  upgrade: { request: string; requested: string; pending: string; signIn: string; err: string; current: string; note: string };
  admin: {
    nav: { dashboard: string; analytics: string; revenue: string; forms: string; clients: string; emailHealth: string; security: string; logs: string; blacklist: string; myAtelier: string; signOut: string; adminLabel: string; lightMode: string; darkMode: string };
    home: {
      title: string; subtitle: string; loading: string;
      forms: string; clients: string; leadsReceived: string; blacklist: string;
      recentSubmissions: string; recentSubtitle: string; viewAll: string;
      noLeads: string; unknownForm: string; submissionId: string;
    };
    blacklist: {
      title: string; subtitle: string; banTarget: string;
      noActive: string; colDate: string; colTarget: string; colType: string; colReason: string; colAction: string; remove: string;
      modalTitle: string; targetLabel: string; targetPlaceholder: string;
      typeLabel: string; typeIp: string; typeFingerprint: string; typeHost: string;
      reasonLabel: string; reasonPlaceholder: string;
      cancel: string; banning: string; submitBan: string;
      requiredErr: string; existsErr: string;
      removeConfirmTitle: string; removeConfirmBody: string; removeConfirmBtn: string;
      removeErr: string; removedOk: string;
    };
    forms: {
      title: string; subtitle: string; newForm: string; noForms: string;
      client: string; unknownClient: string; corsOrigins: string; integration: string;
      requiredErr: string; createErr: string; activatedOk: string; pausedOk: string; updateErr: string;
      deleteConfirmTitle: string; deleteConfirmBody: string; deleteConfirmBtn: string; deleteErr: string; deletedOk: string;
      needClientFirst: string;
      modalTitle: string; formNameLabel: string; formNamePlaceholder: string;
      recipientLabel: string; clientLabel: string; clientDefaultHint: string; corsLabel: string; corsPlaceholder: string; corsHint: string;
      autoReply: string; subjectLabel: string; subjectPlaceholder: string;
      messageLabel: string; messagePlaceholder: string; messageHint: string;
      cancel: string; creating: string; create: string;
    };
    clients: {
      title: string; subtitle: string; newClient: string; noClients: string;
      accessLinkLabel: string; sendAccessLink: string;
      requiredErr: string; saveErr: string;
      deleteConfirmTitle: string; deleteConfirmBody: string; deleteConfirmBtn: string; deleteErr: string; deletedOk: string;
      passwordErr: string; networkErr: string;
      resetConfirmTitle: string; resetConfirmBody: string; resetConfirmBtn: string; resetOk: string; resetErr: string;
      hide: string; show: string; resetPasswordTitle: string; edit: string; delete: string;
      editModalTitle: string; createModalTitle: string;
      clientNameLabel: string; clientNamePlaceholder: string;
      emailLabel: string; emailPlaceholder: string;
      phoneLabel: string; phonePlaceholder: string;
      artDirectionTitle: string; logoUrlLabel: string; logoUrlPlaceholder: string;
      primaryColorLabel: string; fontFamilyLabel: string; fontSans: string; fontSerif: string; fontMono: string;
      customSenderTitle: string; paidBadge: string; customSenderDescA: string; customSenderDescC: string;
      senderNameLabel: string; senderNamePlaceholder: string; senderNameHint: string;
      replyToLabel: string; replyToPlaceholder: string; replyToHint: string;
      securityTitle: string; twoFactorLabel: string; twoFactorHint: string; theirAddress: string;
      cancel: string; saving: string; save: string;
      endClientsToggle: string; endClientsEmpty: string; endClientsLoading: string; endClientsLoadErr: string;
      endClientResetTitle: string; endClientResetConfirmTitle: string; endClientResetConfirmBody: string; endClientResetConfirmBtn: string;
      endClientResetOk: string; endClientResetErr: string;
    };
    formDetail: {
      notFoundTitle: string; backToList: string; backToForms: string; recipientClient: string;
      deactivate: string; activate: string; updateErr: string; activatedOk: string; pausedOk: string;
      directIntegrationTitle: string; directIntegrationDesc: string; htmlExampleLabel: string;
      advancedSettingsTitle: string; advancedSettingsDesc: string;
      redirectUrlLabel: string; redirectUrlPlaceholder: string; redirectUrlHint: string;
      webhookUrlLabel: string; webhookUrlPlaceholder: string; webhookUrlHint: string;
      enableAutoReply: string; enableAutoReplyHint: string;
      subjectLabel: string; subjectPlaceholder: string;
      messageLabel: string; messagePlaceholder: string; messageHintA: string; messageHintB: string; messageHintC: string;
      saving: string; saveSettings: string; settingsErr: string; settingsOk: string;
      corsTitle: string; corsDesc: string; corsPlaceholder: string; updateCors: string; corsErr: string; corsOk: string;
      leadsReceived: string; noSubmissions: string;
      colDate: string; colIp: string; colPreview: string; colAction: string; details: string;
      submissionDetailsTitle: string; dateLabel: string; ipLabel: string; close: string;
    };
    email: {
      title: string; subtitle: string; refresh: string;
      outageTitle: string; outageBody: string;
      statSendingAccounts: string; statSendingAccountsHint: string;
      statOutages24h: string; statOutages24hHint: string;
      statLastOutage: string; statLastOutageHintSome: string; statLastOutageHintNone: string;
      loadingAccounts: string; noAccountsA: string; noAccountsB: string;
      accountPrefix: string; fromLabel: string; failures24hLabel: string; noRecentFailures: string;
      footerA: string; footerB: string;
      statusHealthy: string; statusRecovering: string; statusFailing: string; statusDisabled: string;
      justNow: string; minAgo: string; hourAgo: string; dayAgo: string; noneDash: string;
    };
    security: {
      title: string; subtitle: string; refresh: string;
      migrationStrong: string; migrationA: string; migrationB: string;
      statFailedLogins: string; statRateBlocks: string; statAdminFails: string;
      noisiestIps: string;
      colWhen: string; colEvent: string; colActor: string; colIp: string; colDetail: string;
      loadingEvents: string; noEvents: string; dash: string;
      justNow: string; minAgo: string; hourAgo: string; dayAgo: string;
      evAdminLoginOk: string; evAdminLoginFailed: string; evClientLoginOk: string; evClientLoginFailed: string;
      evPortalLoginFailed: string; evRateLimitBlock: string; evPasswordResetRequest: string;
    };
    logs: {
      title: string; subtitle: string; liveMode: string; pollingMode: string;
      colTimestamp: string; colErrorType: string; colForm: string; colMessage: string;
      loadingLogs: string; noFailures: string; unknownForm: string;
    };
    analytics: {
      title: string; subtitleDisabled: string; subtitleEnabled: string;
      notEnabledA: string; notEnabledB: string; refresh: string;
      kpiViewsToday: string; kpiViewsTodayHint: string;
      kpiVisitorsToday: string; kpiVisitorsTodayHint: string;
      kpiViews7d: string; kpiViews7dHint: string;
      kpiViewsAllTime: string; kpiViewsAllTimeHint: string;
      last30Days: string; chartViews: string; chartVisitors: string;
      topPages: string; topReferrers: string; devices: string; countries: string; noData: string;
      recentVisitors: string; colWhen: string; colPage: string; colReferrer: string; colDevice: string; colCountry: string;
      direct: string; noVisits: string; dash: string;
    };
    revenue: {
      title: string; subtitle: string; couldNotLoad: string;
      kpiMrr: string; kpiMrrHint: string; kpiPaid: string; kpiPaidHint: string;
      kpiConversion: string; kpiConversionHint: string; kpiArpu: string; kpiArpuHint: string;
      planMix: string; perMonth: string; paying: string; free: string;
      growth6mo: string; newSignups: string; newPaid: string;
      recentPaidAccounts: string; colAccount: string; colPlan: string; colSince: string; noPaidYet: string;
    };
    submissions: {
      title: string; subtitle: string; exportCsv: string; noLeads: string; noData: string;
      colDate: string; colForm: string; colIp: string; colDataPreview: string; colAction: string; details: string; unknownForm: string;
      leadDetailsTitle: string; dateLabel: string; ipLabel: string; fingerprintLabel: string; close: string;
    };
  };
  portal: {
    login: {
      title: string; subtitle: string; emailLabel: string; passwordLabel: string;
      signingIn: string; signIn: string; errTooMany: string; errIncorrect: string; errNetwork: string;
      forgot: string;
    };
    setPassword: {
      title: string; resetTitle: string; subtitle: string; passwordLabel: string; confirmLabel: string; placeholder: string;
      submit: string; submitting: string; errMismatch: string; errShort: string; errNetwork: string; missingToken: string; askNew: string;
    };
    forgot: { title: string; body: string; emailLabel: string; send: string; sending: string; sent: string; back: string };
    layout: {
      defaultBrandName: string; poweredBy: string; signOut: string;
    };
    home: {
      title: string;
      loadingLeads: string; emptyTitle: string; emptyBody: string;
      yourLeads: string; totalAcrossOne: string; totalAcrossMany: string;
      exportCsv: string; searchPlaceholder: string; allForms: string; formFallback: string;
      colDate: string; colForm: string; colPreview: string; noMatch: string;
      submissionTitle: string; close: string; downloadFile: string;
    };
  };
}

export const appDictionaries: Record<Locale, AppDict> = {
  en: {
    auth: {
      shell: {
        badgeText: 'One backend for every site you build', headlineA: 'The form backend that', headlineHighlight: 'disappears into your stack.',
        point1Title: 'No SMTP, no backend', point1Desc: 'Two values wire any site — the service does the rest.',
        point2Title: 'AI + proof-of-work anti-spam', point2Desc: 'Modern spam blocked before it ever reaches you.',
        point3Title: 'Every lead stored, then delivered', point3Desc: 'The lead is saved first; your client gets it by e-mail and in a private inbox.',
        footerTagline: 'One developer account · your clients · their forms · every lead kept', backToSite: '← Back to site', orDivider: 'or',
      },
      adminLogin: {
        enterCode: 'Enter your code', adminAccess: 'Admin access',
        codeEmailedBody: 'A 6-digit code was emailed to the admin address. It expires in 10 minutes.',
        enterPasswordBody: 'Enter the admin password to continue.',
        verificationCodeLabel: 'Verification code', verifying: 'Verifying…', verifyAndSignIn: 'Verify & sign in', backToPassword: '← Back to password',
        passwordLabel: 'Password', signingIn: 'Signing in…', signIn: 'Sign in',
        errTooMany: 'Too many attempts. Wait a minute and try again.', errIncorrectPassword: 'Incorrect password.', errNetwork: 'Could not reach the server.', errIncorrectCode: 'Incorrect code.',
      },
      clientLogin: {
        enterCode: 'Enter your code', codeEmailedBody: 'We emailed a 6-digit code to {email}. It expires in 10 minutes.',
        verificationCodeLabel: 'Verification code', verifying: 'Verifying…', verifyAndSignIn: 'Verify & sign in', useDifferentAccount: '← Use a different account',
        welcomeBack: 'Welcome back', subtitle: 'Developer sign-in — your clients, forms and leads.', googleSignIn: 'Sign in with Google',
        emailLabel: 'Email', passwordLabel: 'Password', forgotPassword: 'Forgot password?', signingIn: 'Signing in…', signIn: 'Sign in',
        noAccount: 'No account yet?', createOneFree: 'Create one free',
        errGoogleFailed: 'Google sign-in failed or was cancelled. Try again or use your password.',
        errEvicted: 'You were signed out because this account reached its device limit — a newer sign-in on another device took this slot.',
        errTooMany: 'Too many attempts. Please wait a minute and try again.', errIncorrect: 'Incorrect email or password.', errNetwork: 'Could not reach the server.', errIncorrectCode: 'Incorrect code.',
      },
      clientSignup: {
        title: 'Create your developer account', subtitle: 'Developers sign up here, then create their clients and wire their forms. Free to start.', googleSignUp: 'Sign up with Google',
        nameLabel: 'Name or company', namePlaceholder: 'Acme Studio', emailLabel: 'Email', passwordLabel: 'Password', passwordPlaceholder: 'At least 8 characters',
        creating: 'Creating your account…', createAccount: 'Create account', alreadyHave: 'Already have an account?', signIn: 'Sign in',
        errCouldNotCreate: 'Could not create the account.', errNetwork: 'Could not reach the server.',
      },
      forgotPassword: {
        title: 'Reset your password', checkInbox: 'Check your inbox.', enterEmailBody: "Enter your email and we'll send a reset link.", emailLabel: 'Email',
        sending: 'Sending…', sendResetLink: 'Send reset link',
        confirmBody: 'If an account exists for {email}, a reset link is on its way. The link expires in 1 hour.', backToSignIn: '← Back to sign in',
      },
      resetPassword: {
        passwordUpdated: 'Password updated', chooseNewPassword: 'Choose a new password', canSignInNow: 'You can now sign in with your new password.',
        enterNewPasswordBody: 'Enter a new password for your account.', goToSignIn: 'Go to sign in',
        missingTokenA: 'This reset link is missing its token. Request a new one from the', missingTokenB: 'page.', forgotPasswordLinkText: 'forgot password',
        newPasswordLabel: 'New password', newPasswordPlaceholder: 'At least 8 characters', confirmPasswordLabel: 'Confirm password', confirmPasswordPlaceholder: 'Re-enter password',
        updating: 'Updating…', updatePassword: 'Update password',
        errTooShort: 'Password must be at least 8 characters.', errMismatch: 'Passwords do not match.', errCouldNotReset: 'Could not reset your password.', errNetwork: 'Could not reach the server.', loading: 'Loading…',
      },
    },
    choosePlan: {
      kicker: 'Account created',
      title: 'Pick the plan that grows with you',
      subtitle: 'Change or cancel anytime. Paid plans are activated on request, the same day, while card checkout opens.',
      recommended: 'Recommended',
      ctaChoose: 'Get {plan}',
      continueFree: 'Continue with the limited Free plan',
      freeNote: '3 forms · 50 submissions/mo — enough to try it on a real site.',
    },
    sidebar: {
      general: 'General', overview: 'Overview', developer: 'API & MCP', endClients: 'Clients',
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
      nf: {
        createTitle: 'Create a form', liveTitle: 'Your form is live', nameLabel: 'Form name',
        nameHint: 'Every form belongs to a client: the business whose site it lives on. Its leads go to that client — the e-mail never appears in your code.',
        namePlaceholder: 'e.g. Contact — acme.com',
        seePro: 'See plans', creating: 'Creating…', createBtn: 'Create form',
        readyBody: 'is live. Pick your stack and paste the code — it ships only the public form id.',
        openGuide: 'Open the integration guide', done: 'Done', couldNotCreate: 'Could not create the form.', couldNotReach: 'Could not reach the server.',
        clientLabel: 'Client', clientPlaceholder: 'Pick a client…', newClientOption: '+ New client', needClient: 'Create a client first — every form belongs to one.',
        clientNameLabel: 'Business name', clientEmailLabel: 'Where leads go (client e-mail)', clientEmailHint: 'Stored on our side only. Never written in your HTML.',
        siteUrlLabel: 'Site URL', siteUrlHint: 'We allow this site (and its www twin) to post. Add more sites later in the form settings.',
        langLabel: 'Auto-reply language', inviteLabel: 'E-mail the client a link to their lead inbox now',
        leadsGoTo: 'Leads go to', noEmailInCode: 'no e-mail address in your code',
        originsOpenWarn: 'No site URL given: any site can post to this form until you set one in the settings.',
        envTitle: 'Env values', openSettings: 'Open form settings',
      },
      onboarding: {
        kicker: 'Getting started', title: "Let's get your first lead", subtitle: 'Three steps, about two minutes. No SMTP, no backend to run.',
        s1Title: 'Create a form', s1Done: 'Done · {n} form{s}', s1Forms: '', s1Body: "Name it after the website it lives on. You'll get an ID to wire up.",
        s2Title: 'Add it to your website', s2Body: 'Pick your stack and paste the code. It ships only the public form id — no e-mail, no key.',
        jsAlt: 'Prefer a JavaScript integration with proof-of-work spam protection?', readDocs: 'Read the docs', orPointAiAt: 'or point your AI at',
        s3Title: 'Receive your first lead', s3Body: 'Submit your form once to test it. Your lead lands here instantly — with the owner notified and a branded auto-reply sent for you.',
        waiting: 'Waiting for your first submission… refresh after you send one.',
        footer: 'Once your first lead arrives, this page becomes your live analytics dashboard.',
        copy: 'Copy', copied: 'Copied',
      },
    },
    palette: {
      quickActions: 'Quick actions', searchPlaceholder: 'Search forms, pages, actions…',
      nothingMatches: 'Nothing matches', navigate: 'navigate', open: 'open',
      gNavigate: 'Navigate', gForms: 'Forms', gResources: 'Resources', gAccount: 'Account',
      overview: 'Overview', overviewHint: 'Dashboard home',
      clientPortals: 'Clients', clientPortalsHint: 'Businesses & their inboxes',
      devApi: 'API & MCP', devApiHint: 'Keys, MCP, webhooks',
      openForm: 'Open form',
      documentation: 'Documentation', documentationHint: 'Integration guide',
      pricing: 'Pricing & plans', pricingHint: 'Upgrade',
      signOut: 'Sign out', signOutHint: 'End session',
    },
    developer: {
      title: 'API & MCP', subtitle: 'API keys, webhooks and the MCP server — your AI assistant can set a whole site up in one call.',
      lockTitle: 'API & MCP access is not included in this plan', lockBody: 'Connect Claude, Cursor or any MCP client and let it create clients, forms and read your leads for you.', seePlans: 'See plans',
      apiKeys: 'API keys', newKeyOnce: 'Your new key — shown only once, store it now', keyNamePlaceholder: 'Key name (e.g. claude-code)', creating: 'Creating…', newKey: 'New key',
      loading: 'Loading…', noKeys: 'No active keys.', lastUsed: 'last used {date}', neverUsed: 'never used',
      couldNotCreate: 'Could not create the key.', couldNotReach: 'Could not reach the server.',
      webhooksTitle: 'Webhooks — every lead, POSTed to your app',
      wDescA: 'Set an https endpoint per form and every stored lead arrives as a signed',
      wDescB: 'POST — verify the', wDescC: 'header (snippet in the', wDescD: '). Delivery never blocks or loses a lead.',
      createFormFirst: 'Create a form first — webhooks are configured per form.', webhookPlaceholder: 'https://api.yourapp.com/hooks/inlet (empty = disabled)', saving: 'Saving…', save: 'Save', saved: 'Saved.', couldNotSave: 'Could not save.', networkError: 'Network error.',
      mcpTitle: 'MCP server — your AI runs your forms', mcpDescA: 'Connect Claude Code, Cursor, or any MCP client and your assistant can', mcpDescStrong: 'create clients and forms, fetch the exact embed for the framework, check form health and read leads', mcpDescB: 'without leaving the editor. One call, `setup_site`, takes a site from zero to live.', endpoint: 'Endpoint', toolsAvailable: 'Tools:',
    },
    endClients: {
      title: 'Clients', subtitle: 'The businesses you build sites for. Each one receives its leads by e-mail and in a private, branded inbox.', newBtn: 'New client',
      lockTitle: 'Client limit reached', lockBody: 'Your plan’s client limit is reached. Upgrade to add more businesses.', seePlans: 'See plans',
      emailedMsg: 'An access link was e-mailed to {email} — they choose their own password; you never see it.',
      namePlaceholder: 'Business name (e.g. Acme Corp)', emailPlaceholder: 'contact@acme.com — where their leads go', creating: 'Creating…', createBtn: 'Create client',
      portalLogin: 'Their inbox:', count: '{n} / {limit} clients', loading: 'Loading…',
      emptyTitle: 'No clients yet', emptyBody: 'Create the first business you build for. Every form you create belongs to one of your clients.',
      formsTheySee: 'Their forms', noneAssigned: 'No form yet — create one from the overview.', assignForm: '+ Move a form here…',
      couldNotCreate: 'Could not create the client.', couldNotReach: 'Could not reach the server.',
      resetBtn: 'Send access link', resetConfirmTitle: 'Send a new access link?', resetConfirmBody: 'They receive a single-use link to choose a new password. Their current password keeps working until they use it.', resetConfirmBtn: 'Send link', cancel: 'Cancel',
      resetting: 'Sending…', resetOk: 'Access link sent.', resetErr: 'Could not send the link.',
      websiteLabel: 'Website', websitePlaceholder: 'https://acme.com (optional)', langLabel: 'Language', inviteNow: 'E-mail them their inbox access now', inviteHint: 'A single-use link; they pick their password. Nothing is sent if unchecked.',
      sendAccess: 'Send access', resendAccess: 'Resend access', accessSent: 'Link sent', hasAccess: 'Has access', noAccessYet: 'No access yet',
      notifyLeads: 'Gets each lead by e-mail', edit: 'Edit', save: 'Save', cancelEdit: 'Cancel', deleteBlocked: 'This client still has forms — move or delete them first.',
      deleteConfirmTitle: 'Remove this client?', deleteConfirmBody: 'Their inbox access ends. Their forms must be moved or deleted first.', deleteBtn: 'Remove',
      leadsBy: 'Leads by e-mail', createdExisting: 'You already have a client with this e-mail.',
    },
    formPage: {
      formView: 'Form view', subtitle: 'Data and files submitted through this form.', exportCsv: 'Export CSV',
      totalSubmissions: 'Total submissions', forThisForm: 'For this form', trend30: 'Trend (last 30 days)',
      moreDataTitle: 'More data needed', moreDataBody: 'The chart unlocks at 10 submissions.',
      structuredData: 'Structured data', searchResults: 'Search these results…',
      date: 'Date', more: '… ({n} more)', noData: 'No data found.', file: 'File', viewDetails: 'View details →',
      fullSubmission: 'Full submission', submittedAt: 'Submitted {date}', attachedDoc: 'Attached document', downloadFile: 'Download file',
      settings: {
        title: 'Form settings', subtitle: 'Who receives the leads, which sites may post, what the visitor gets back.', loading: 'Loading settings…',
        nameLabel: 'Form name', clientLabel: 'Client (receives the leads)', originsLabel: 'Allowed sites', originsHint: 'One origin per line, e.g. https://acme.com. Use * to allow any site (not recommended).',
        successUrlLabel: 'Success page', successUrlHint: 'Where the visitor lands after a native (no-JavaScript) submit. Optional.',
        webhookLabel: 'Webhook URL', webhookHint: 'Every stored lead is POSTed here as signed JSON (X-Inlet-Signature). https only. Optional.',
        autoReplyLabel: 'Auto-reply to the visitor', autoReplyHint: 'Sent to the “email” field, in the client’s brand. Withheld for leads flagged as suspect.',
        subjectLabel: 'Subject', messageLabel: 'Message', messageHint: 'Use {{name}} for the visitor’s name. Empty = the default message.',
        developerCopyLabel: 'Copy me on every lead', developerCopyHint: 'The client always receives the lead; this adds a copy for you.',
        activeLabel: 'Form is live', activeHint: 'Paused forms answer 403 and store nothing.',
        save: 'Save settings', saving: 'Saving…', saved: 'Saved.', saveErr: 'Could not save.',
        integrationTitle: 'Integration', integrationSubtitle: 'Pick your stack. The code carries only the public form id.', leadsGoTo: 'Leads go to',
        deleteTitle: 'Delete this form', deleteBody: 'The form and every lead it stored are deleted. Sites still posting to it will get a 404.', deleteBtn: 'Delete form', deleteErr: 'Could not delete the form.', cancel: 'Cancel',
      },
    },
    snippets: { copy: 'Copy', copied: 'Copied', helperTab: 'inlet.js (helper)', filesHint: 'Two files: the helper once per project, the form where you need it.', noEmail: 'No e-mail address and no key in this code — the form id routes to your client’s inbox on our side.' },
    upgrade: { request: 'Request {plan}', requested: '{plan} requested — we confirm by e-mail', pending: 'Request pending', signIn: 'Sign in to request', err: 'Could not send the request.', current: 'Current plan', note: 'Card checkout opens with invoicing. Until then a request is activated by hand, the same day.' },
    admin: {
      nav: { dashboard: 'Dashboard', analytics: 'Analytics', revenue: 'Revenue', forms: 'Forms', clients: 'Clients', emailHealth: 'Email health', security: 'Security', logs: 'Logs & failures', blacklist: 'Blacklist', myAtelier: 'My Atelier', signOut: 'Sign out', adminLabel: 'Admin', lightMode: 'Light mode', darkMode: 'Dark mode' },
      home: {
        title: 'Dashboard', subtitle: 'Overview of your form service activity.', loading: 'Loading…',
        forms: 'Forms', clients: 'Clients', leadsReceived: 'Leads received', blacklist: 'Blacklist',
        recentSubmissions: 'Recent submissions', recentSubtitle: 'The 5 most recent leads across your forms.', viewAll: 'View all',
        noLeads: 'No leads yet.', unknownForm: 'Unknown form', submissionId: 'Submission ID:',
      },
      blacklist: {
        title: 'Security blacklist', subtitle: 'View and manage banned IPs, fingerprints and hosts.', banTarget: 'Ban a target',
        noActive: 'No active bans.', colDate: 'Date', colTarget: 'Target', colType: 'Type', colReason: 'Reason', colAction: 'Action', remove: 'Remove',
        modalTitle: 'Ban a target', targetLabel: 'Target to ban (IP, fingerprint or host)', targetPlaceholder: 'e.g. 198.51.100.42 or a VPS hostname',
        typeLabel: 'Target type', typeIp: 'IP address', typeFingerprint: 'Fingerprint', typeHost: 'Host (reverse DNS domain)',
        reasonLabel: 'Ban reason', reasonPlaceholder: 'e.g. Spam observed from this server',
        cancel: 'Cancel', banning: 'Banning…', submitBan: 'Ban target',
        requiredErr: 'Target and reason are required.', existsErr: 'That target already exists or is invalid.',
        removeConfirmTitle: 'Remove from blacklist?', removeConfirmBody: 'This target will be able to submit forms again immediately.', removeConfirmBtn: 'Remove',
        removeErr: 'Could not remove the target.', removedOk: 'Target removed from the blacklist.',
      },
      forms: {
        title: 'Forms', subtitle: 'Configure your forms and get their integration links.', newForm: 'New form', noForms: 'No forms yet.',
        client: 'Client', unknownClient: 'Unknown', corsOrigins: 'CORS origins', integration: 'Integration',
        requiredErr: 'Name and client are required.', createErr: 'Could not create the form.', activatedOk: 'Form activated.', pausedOk: 'Form paused.', updateErr: 'Could not update the form.',
        deleteConfirmTitle: 'Delete this form?', deleteConfirmBody: 'The form and its settings are permanently deleted. Sites still posting to it will start receiving 404s.', deleteConfirmBtn: 'Delete form', deleteErr: 'Could not delete the form.', deletedOk: 'Form deleted.',
        needClientFirst: 'Create at least one developer first — every form belongs to a developer and one of its clients.',
        modalTitle: 'Create a form', formNameLabel: 'Form name', formNamePlaceholder: 'e.g. Acme contact form',
        recipientLabel: 'Developer', clientLabel: 'Client (receives the leads)', clientDefaultHint: 'No client yet — a default one is created from the developer’s own details', corsLabel: 'Allowed CORS origins (comma-separated)', corsPlaceholder: 'e.g. https://acme.com, https://blog.acme.com (or * for all)', corsHint: 'Comma-separate multiple sites. Use `*` to allow all.',
        autoReply: 'Auto-reply', subjectLabel: 'Email subject', subjectPlaceholder: 'We received your message',
        messageLabel: 'Confirmation message', messagePlaceholder: "e.g. Thanks for your message. We'll get back to you soon…", messageHint: "Leave empty to use the default message (which includes the recipient client's name).",
        cancel: 'Cancel', creating: 'Creating…', create: 'Create',
      },
      clients: {
        title: 'Developers', subtitle: 'The developer accounts on the platform. Each one creates its own clients and forms.', newClient: 'New developer', noClients: 'No developers yet.',
        accessLinkLabel: 'Password: never visible. Send a set-password link instead.', sendAccessLink: 'Send link',
        requiredErr: 'Name and email are required.', saveErr: 'Could not save the developer.',
        deleteConfirmTitle: 'Delete this client?', deleteConfirmBody: 'This permanently deletes the client and every form they own. Their leads stay in the database but lose their owner.', deleteConfirmBtn: 'Delete client', deleteErr: 'Could not delete the client.', deletedOk: 'Client deleted.',
        passwordErr: 'Could not retrieve the password.', networkErr: 'Network error.',
        resetConfirmTitle: 'Send a set-password link?', resetConfirmBody: 'The developer receives a single-use link (1 hour) to choose a new password. Their current password keeps working until they use it.', resetConfirmBtn: 'Send link', resetOk: 'Set-password link sent.', resetErr: 'Could not send the link.',
        hide: 'Hide', show: 'Show', resetPasswordTitle: 'Reset password', edit: 'Edit', delete: 'Delete',
        editModalTitle: 'Edit client', createModalTitle: 'Create a client',
        clientNameLabel: 'Client name', clientNamePlaceholder: 'e.g. Acme Corp',
        emailLabel: 'Email address', emailPlaceholder: 'e.g. contact@acme.com',
        phoneLabel: 'Phone number (SMS)', phonePlaceholder: 'e.g. +1 555 123 4567',
        artDirectionTitle: 'Email art direction', logoUrlLabel: 'Logo URL', logoUrlPlaceholder: 'https://.../logo.png',
        primaryColorLabel: 'Primary color', fontFamilyLabel: 'Font family', fontSans: 'Sans-serif (default)', fontSerif: 'Serif (classic)', fontMono: 'Monospace (code)',
        customSenderTitle: 'Custom sender', paidBadge: 'Paid',
        customSenderDescA: 'How this client’s brand appears on the confirmation emails their customers receive. Applied only on paid plans. A true custom',
        customSenderDescC: 'address activates once the client’s domain is verified.',
        senderNameLabel: 'Sender display name', senderNamePlaceholder: 'e.g. Shu', senderNameHint: 'Shown as the sender name. Falls back to the client name if empty.',
        replyToLabel: 'Reply-to address', replyToPlaceholder: 'e.g. contact@shu.com', replyToHint: 'Replies from their customers go here. Works today — no domain needed.',
        securityTitle: 'Security', twoFactorLabel: 'Require two-factor sign-in', twoFactorHint: 'After their password, this client must enter a 6-digit code emailed to {email}.', theirAddress: 'their address',
        cancel: 'Cancel', saving: 'Saving…', save: 'Save',
        endClientsToggle: 'End-clients', endClientsEmpty: 'No end-clients yet.', endClientsLoading: 'Loading…', endClientsLoadErr: 'Could not load end-clients.',
        endClientResetTitle: 'Send access link', endClientResetConfirmTitle: 'Send this client a new access link?', endClientResetConfirmBody: 'They receive a single-use link to choose a new password.', endClientResetConfirmBtn: 'Send link',
        endClientResetOk: 'Access link sent.', endClientResetErr: 'Could not send the link.',
      },
      formDetail: {
        notFoundTitle: 'Form not found', backToList: 'Back to list', backToForms: 'Back to forms', recipientClient: 'Recipient client:',
        deactivate: 'Deactivate form', activate: 'Activate form', updateErr: 'Could not update the form.', activatedOk: 'Form activated.', pausedOk: 'Form paused.',
        directIntegrationTitle: 'Direct HTML integration', directIntegrationDesc: 'Copy this URL into the `action` attribute of your standard HTML form.', htmlExampleLabel: 'HTML code example:',
        advancedSettingsTitle: 'Advanced settings & auto-reply', advancedSettingsDesc: 'Configure the redirect page and the automatic confirmation email sent to the prospect.',
        redirectUrlLabel: 'Redirect URL (success)', redirectUrlPlaceholder: 'e.g. https://yoursite.com/thanks', redirectUrlHint: 'Forces a redirect to this page after submission (overrides your frontend config). Leave empty to use the one in your code.',
        webhookUrlLabel: 'Webhook URL (signed POST per lead)', webhookUrlPlaceholder: 'e.g. https://api.yourapp.com/hooks/inlet', webhookUrlHint: 'Every stored lead is POSTed here as JSON, HMAC-signed (X-Inlet-Signature). Must be https. Leave empty to disable.',
        enableAutoReply: 'Enable auto-reply', enableAutoReplyHint: 'Sends a confirmation email to the address provided.',
        subjectLabel: 'Email subject', subjectPlaceholder: 'We received your message',
        messageLabel: 'Message (plain text)', messagePlaceholder: 'e.g. Hi {{name}}, we received your request…', messageHintA: 'Use', messageHintB: 'or', messageHintC: "to dynamically include the sender's name. Leave empty to use the default message.",
        saving: 'Saving…', saveSettings: 'Save settings', settingsErr: 'Could not save the settings.', settingsOk: 'Settings updated.',
        corsTitle: 'Configured CORS domains', corsDesc: 'Specify allowed domains (comma-separated). Use `*` to allow all.', corsPlaceholder: 'https://yoursite.com, https://other.com', updateCors: 'Update CORS', corsErr: 'Could not save the CORS domains.', corsOk: 'CORS domains updated.',
        leadsReceived: 'Leads received ({n})', noSubmissions: 'No submissions yet.',
        colDate: 'Date', colIp: 'IP', colPreview: 'Preview', colAction: 'Action', details: 'Details',
        submissionDetailsTitle: 'Submission details', dateLabel: 'Date:', ipLabel: 'IP:', close: 'Close',
      },
      email: {
        title: 'Email health', subtitle: 'Live status of every sending account. A suspended or rate-limited provider shows here the moment it fails.', refresh: 'Refresh',
        outageTitle: 'No account can send right now', outageBody: 'Every configured account is disabled or failing. New leads will still be captured, but notification & auto-reply emails are not going out. Re-enable an account or add a fresh provider.',
        statSendingAccounts: 'Sending accounts', statSendingAccountsHint: 'active / configured',
        statOutages24h: 'Outages (24h)', statOutages24hHint: 'all-accounts-failed events',
        statLastOutage: 'Last outage', statLastOutageHintSome: 'most recent total failure', statLastOutageHintNone: 'none recorded',
        loadingAccounts: 'Loading account status…', noAccountsA: 'No sending accounts configured. Add', noAccountsB: 'credentials to your environment.',
        accountPrefix: 'Account ', fromLabel: 'from', failures24hLabel: 'Failures (24h):', noRecentFailures: 'no recent failures',
        footerA: 'Disable a suspended account cleanly by setting', footerB: 'in your environment — it drops out of rotation without deleting its credentials.',
        statusHealthy: 'Healthy', statusRecovering: 'Recovering', statusFailing: 'Failing', statusDisabled: 'Disabled',
        justNow: 'just now', minAgo: '{n}m ago', hourAgo: '{n}h ago', dayAgo: '{n}d ago', noneDash: '—',
      },
      security: {
        title: 'Security', subtitle: 'Live audit trail — failed logins, rate-limit blocks and account activity across the platform.', refresh: 'Refresh',
        migrationStrong: 'One-time setup:', migrationA: 'run', migrationB: 'in the Supabase SQL editor to enable the audit trail. Events are already being recorded once the table exists.',
        statFailedLogins: 'Failed logins (24h)', statRateBlocks: 'Rate-limit blocks (24h)', statAdminFails: 'Admin login failures (24h)',
        noisiestIps: 'Noisiest source IPs (24h)',
        colWhen: 'When', colEvent: 'Event', colActor: 'Actor', colIp: 'IP', colDetail: 'Detail',
        loadingEvents: 'Loading events…', noEvents: 'No security events recorded yet — all quiet.', dash: '—',
        justNow: 'just now', minAgo: '{n}m ago', hourAgo: '{n}h ago', dayAgo: '{n}d ago',
        evAdminLoginOk: 'Admin login', evAdminLoginFailed: 'Admin login failed', evClientLoginOk: 'Client login', evClientLoginFailed: 'Client login failed',
        evPortalLoginFailed: 'Portal login failed', evRateLimitBlock: 'Rate limit block', evPasswordResetRequest: 'Password reset request',
      },
      logs: {
        title: 'Logs & failures', subtitle: 'Track SMTP failures, honeypot triggers and anti-spam blocks.', liveMode: 'Live mode (1s)', pollingMode: 'Polling (2m)',
        colTimestamp: 'Timestamp', colErrorType: 'Error type', colForm: 'Form', colMessage: 'Message',
        loadingLogs: 'Loading logs…', noFailures: 'No failures logged.', unknownForm: 'Unknown',
      },
      analytics: {
        title: 'Traffic analytics', subtitleDisabled: 'Who visits, what they view, where they come from.', subtitleEnabled: 'First-party, privacy-safe (IPs are hashed). Refreshes automatically.',
        notEnabledA: "Analytics isn't enabled yet. Run", notEnabledB: 'in Supabase, then this page fills in automatically.', refresh: 'Refresh',
        kpiViewsToday: 'Views today', kpiViewsTodayHint: 'page views (24h)',
        kpiVisitorsToday: 'Visitors today', kpiVisitorsTodayHint: 'unique sessions (24h)',
        kpiViews7d: 'Views · 7 days', kpiViews7dHint: '{n} unique visitors',
        kpiViewsAllTime: 'Views · all time', kpiViewsAllTimeHint: 'since tracking began',
        last30Days: 'Last 30 days', chartViews: 'Views', chartVisitors: 'Visitors',
        topPages: 'Top pages', topReferrers: 'Top referrers', devices: 'Devices', countries: 'Countries', noData: 'No data yet.',
        recentVisitors: 'Recent visitors', colWhen: 'When', colPage: 'Page', colReferrer: 'Referrer', colDevice: 'Device', colCountry: 'Country',
        direct: 'Direct', noVisits: 'No visits recorded yet.', dash: '—',
      },
      revenue: {
        title: 'Revenue & subscribers', subtitle: "Who's paying, monthly recurring revenue, and growth.", couldNotLoad: 'Could not load revenue.',
        kpiMrr: 'MRR', kpiMrrHint: '{arr} ARR', kpiPaid: 'Paid subscribers', kpiPaidHint: 'of {n} accounts',
        kpiConversion: 'Conversion', kpiConversionHint: 'paid ÷ total accounts', kpiArpu: 'ARPU', kpiArpuHint: 'avg revenue / paying user',
        planMix: 'Plan mix', perMonth: '/mo', paying: 'Paying', free: 'Free',
        growth6mo: 'Growth · last 6 months', newSignups: 'New signups', newPaid: 'New paid',
        recentPaidAccounts: 'Recent paid accounts', colAccount: 'Account', colPlan: 'Plan', colSince: 'Since', noPaidYet: "No paid subscribers yet — they'll appear here as accounts upgrade.",
      },
      submissions: {
        title: 'Leads / Submissions', subtitle: 'Every message received across all your forms.', exportCsv: 'Export CSV', noLeads: 'No leads yet.', noData: 'No data',
        colDate: 'Date', colForm: 'Form', colIp: 'IP', colDataPreview: 'Data preview', colAction: 'Action', details: 'Details', unknownForm: 'Unknown',
        leadDetailsTitle: 'Lead details', dateLabel: 'Date:', ipLabel: 'IP:', fingerprintLabel: 'Fingerprint:', close: 'Close',
      },
    },
    portal: {
      login: {
        title: 'Your lead inbox', subtitle: 'Sign in to see and answer the requests sent from your website.', emailLabel: 'Email', passwordLabel: 'Password',
        signingIn: 'Signing in…', signIn: 'Sign in',
        errTooMany: 'Too many attempts. Please wait a minute and try again.', errIncorrect: 'Incorrect email or password.', errNetwork: 'Could not reach the server.',
        forgot: 'Forgot password?',
      },
      setPassword: {
        title: 'Choose your password', resetTitle: 'Choose a new password', subtitle: 'This opens your private inbox: every request sent from your website, kept and answerable.',
        passwordLabel: 'Password', confirmLabel: 'Confirm password', placeholder: 'At least 8 characters',
        submit: 'Save and open my inbox', submitting: 'Saving…',
        errMismatch: 'Passwords do not match.', errShort: 'Password must be at least 8 characters.', errNetwork: 'Could not reach the server.',
        missingToken: 'This link is incomplete. Open it again from the e-mail, or ask for a new one.', askNew: 'Ask for a new link',
      },
      forgot: { title: 'Reset your password', body: 'Enter the e-mail your inbox was created with. If it exists, a single-use link is on its way.', emailLabel: 'Email', send: 'Send the link', sending: 'Sending…', sent: 'If an account exists for this address, a link has been sent. It expires in 1 hour.', back: '← Back to sign in' },
      layout: {
        defaultBrandName: 'Client portal', poweredBy: 'Powered by Inlet', signOut: 'Sign out',
      },
      home: {
        title: 'Your leads',
        loadingLeads: 'Loading your leads…', emptyTitle: 'No leads yet', emptyBody: "When your forms receive submissions, they'll appear here in real time.",
        yourLeads: 'Your leads', totalAcrossOne: '{n} total across {m} form', totalAcrossMany: '{n} total across {m} forms',
        exportCsv: 'Export CSV', searchPlaceholder: 'Search leads…', allForms: 'All forms', formFallback: 'Form',
        colDate: 'Date', colForm: 'Form', colPreview: 'Preview', noMatch: 'No leads match your search.',
        submissionTitle: 'Submission', close: 'Close', downloadFile: 'Download file',
      },
    },
  },
  fr: {
    auth: {
      shell: {
        badgeText: 'Un seul backend pour tous vos sites', headlineA: 'Le backend de formulaires qui', headlineHighlight: 'disparaît dans votre stack.',
        point1Title: 'Sans SMTP, sans backend', point1Desc: 'Deux valeurs suffisent à câbler n’importe quel site — le service fait le reste.',
        point2Title: 'IA + anti-spam par preuve de travail', point2Desc: 'Le spam moderne est bloqué avant même de vous atteindre.',
        point3Title: 'Chaque lead enregistré, puis livré', point3Desc: 'Le lead est d’abord sauvegardé ; votre client le reçoit par e-mail et dans une boîte privée.',
        footerTagline: 'Un compte développeur · vos clients · leurs formulaires · chaque lead conservé', backToSite: '← Retour au site', orDivider: 'ou',
      },
      adminLogin: {
        enterCode: 'Saisissez votre code', adminAccess: 'Accès administrateur',
        codeEmailedBody: 'Un code à 6 chiffres a été envoyé à l’adresse admin. Il expire dans 10 minutes.',
        enterPasswordBody: 'Saisissez le mot de passe admin pour continuer.',
        verificationCodeLabel: 'Code de vérification', verifying: 'Vérification…', verifyAndSignIn: 'Vérifier & se connecter', backToPassword: '← Retour au mot de passe',
        passwordLabel: 'Mot de passe', signingIn: 'Connexion…', signIn: 'Se connecter',
        errTooMany: 'Trop de tentatives. Patientez une minute et réessayez.', errIncorrectPassword: 'Mot de passe incorrect.', errNetwork: 'Impossible de joindre le serveur.', errIncorrectCode: 'Code incorrect.',
      },
      clientLogin: {
        enterCode: 'Saisissez votre code', codeEmailedBody: 'Nous avons envoyé un code à 6 chiffres à {email}. Il expire dans 10 minutes.',
        verificationCodeLabel: 'Code de vérification', verifying: 'Vérification…', verifyAndSignIn: 'Vérifier & se connecter', useDifferentAccount: '← Utiliser un autre compte',
        welcomeBack: 'Content de vous revoir', subtitle: 'Connexion développeur — vos clients, vos formulaires et vos leads.', googleSignIn: 'Se connecter avec Google',
        emailLabel: 'E-mail', passwordLabel: 'Mot de passe', forgotPassword: 'Mot de passe oublié ?', signingIn: 'Connexion…', signIn: 'Se connecter',
        noAccount: 'Pas encore de compte ?', createOneFree: 'Créez-en un gratuitement',
        errGoogleFailed: 'La connexion Google a échoué ou a été annulée. Réessayez ou utilisez votre mot de passe.',
        errEvicted: 'Vous avez été déconnecté car ce compte a atteint sa limite d’appareils — une nouvelle connexion sur un autre appareil a pris cette place.',
        errTooMany: 'Trop de tentatives. Veuillez patienter une minute et réessayer.', errIncorrect: 'E-mail ou mot de passe incorrect.', errNetwork: 'Impossible de joindre le serveur.', errIncorrectCode: 'Code incorrect.',
      },
      clientSignup: {
        title: 'Créez votre compte développeur', subtitle: 'Les développeurs s’inscrivent ici, puis créent leurs clients et câblent leurs formulaires. Gratuit pour commencer.', googleSignUp: 'S’inscrire avec Google',
        nameLabel: 'Nom ou entreprise', namePlaceholder: 'Acme Studio', emailLabel: 'E-mail', passwordLabel: 'Mot de passe', passwordPlaceholder: 'Au moins 8 caractères',
        creating: 'Création de votre compte…', createAccount: 'Créer le compte', alreadyHave: 'Déjà un compte ?', signIn: 'Se connecter',
        errCouldNotCreate: 'Impossible de créer le compte.', errNetwork: 'Impossible de joindre le serveur.',
      },
      forgotPassword: {
        title: 'Réinitialisez votre mot de passe', checkInbox: 'Consultez votre boîte de réception.', enterEmailBody: 'Saisissez votre e-mail et nous vous enverrons un lien de réinitialisation.', emailLabel: 'E-mail',
        sending: 'Envoi…', sendResetLink: 'Envoyer le lien',
        confirmBody: 'Si un compte existe pour {email}, un lien de réinitialisation est en route. Le lien expire dans 1 heure.', backToSignIn: '← Retour à la connexion',
      },
      resetPassword: {
        passwordUpdated: 'Mot de passe mis à jour', chooseNewPassword: 'Choisissez un nouveau mot de passe', canSignInNow: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
        enterNewPasswordBody: 'Saisissez un nouveau mot de passe pour votre compte.', goToSignIn: 'Aller à la connexion',
        missingTokenA: 'Ce lien de réinitialisation n’a pas de jeton. Demandez-en un nouveau depuis la page', missingTokenB: '.', forgotPasswordLinkText: 'mot de passe oublié',
        newPasswordLabel: 'Nouveau mot de passe', newPasswordPlaceholder: 'Au moins 8 caractères', confirmPasswordLabel: 'Confirmez le mot de passe', confirmPasswordPlaceholder: 'Ressaisissez le mot de passe',
        updating: 'Mise à jour…', updatePassword: 'Mettre à jour le mot de passe',
        errTooShort: 'Le mot de passe doit contenir au moins 8 caractères.', errMismatch: 'Les mots de passe ne correspondent pas.', errCouldNotReset: 'Impossible de réinitialiser votre mot de passe.', errNetwork: 'Impossible de joindre le serveur.', loading: 'Chargement…',
      },
    },
    choosePlan: {
      kicker: 'Compte créé',
      title: 'Choisissez le forfait qui vous accompagne',
      subtitle: 'Changez ou annulez à tout moment. Les forfaits payants sont activés sur demande, le jour même, en attendant le paiement par carte.',
      recommended: 'Recommandé',
      ctaChoose: 'Choisir {plan}',
      continueFree: 'Continuer avec le forfait Gratuit (limité)',
      freeNote: '3 formulaires · 50 soumissions/mois — de quoi l’essayer sur un vrai site.',
    },
    sidebar: {
      general: 'Général', overview: 'Vue d’ensemble', developer: 'API & MCP', endClients: 'Clients',
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
      nf: {
        createTitle: 'Créer un formulaire', liveTitle: 'Votre formulaire est en ligne', nameLabel: 'Nom du formulaire',
        nameHint: 'Chaque formulaire appartient à un client : l’entreprise dont le site l’héberge. Ses leads vont à ce client — l’e-mail n’apparaît jamais dans votre code.',
        namePlaceholder: 'ex. Contact — acme.com',
        seePro: 'Voir les forfaits', creating: 'Création…', createBtn: 'Créer le formulaire',
        readyBody: 'est en ligne. Choisissez votre stack et collez le code — il ne contient que l’identifiant public du formulaire.',
        openGuide: 'Ouvrir le guide d’intégration', done: 'Terminé', couldNotCreate: 'Impossible de créer le formulaire.', couldNotReach: 'Impossible de joindre le serveur.',
        clientLabel: 'Client', clientPlaceholder: 'Choisir un client…', newClientOption: '+ Nouveau client', needClient: 'Créez d’abord un client — chaque formulaire lui appartient.',
        clientNameLabel: 'Nom de l’entreprise', clientEmailLabel: 'Destination des leads (e-mail du client)', clientEmailHint: 'Conservé uniquement de notre côté. Jamais écrit dans votre HTML.',
        siteUrlLabel: 'URL du site', siteUrlHint: 'Nous autorisons ce site (et sa version www) à envoyer. Ajoutez d’autres sites plus tard dans les réglages du formulaire.',
        langLabel: 'Langue de la réponse automatique', inviteLabel: 'Envoyer dès maintenant au client un lien vers sa boîte de leads',
        leadsGoTo: 'Les leads vont à', noEmailInCode: 'aucune adresse e-mail dans votre code',
        originsOpenWarn: 'Aucune URL de site : n’importe quel site peut envoyer à ce formulaire tant que vous n’en définissez pas une dans les réglages.',
        envTitle: 'Valeurs d’environnement', openSettings: 'Ouvrir les réglages du formulaire',
      },
      onboarding: {
        kicker: 'Pour commencer', title: 'Obtenez votre premier lead', subtitle: 'Trois étapes, environ deux minutes. Sans SMTP, sans backend à gérer.',
        s1Title: 'Créez un formulaire', s1Done: 'Terminé · {n} formulaire{s}', s1Forms: '', s1Body: "Nommez-le d'après le site sur lequel il vit. Vous obtiendrez un ID à câbler.",
        s2Title: 'Ajoutez-le à votre site', s2Body: 'Choisissez votre stack et collez le code. Il ne contient que l’identifiant public du formulaire — ni e-mail, ni clé.',
        jsAlt: 'Vous préférez une intégration JavaScript avec protection anti-spam par preuve de travail ?', readDocs: 'Lire la documentation', orPointAiAt: 'ou pointez votre IA vers',
        s3Title: 'Recevez votre premier lead', s3Body: 'Soumettez votre formulaire une fois pour le tester. Votre lead arrive ici instantanément — le propriétaire est notifié et une réponse automatique à votre image est envoyée pour vous.',
        waiting: 'En attente de votre première soumission… actualisez après en avoir envoyé une.',
        footer: 'Dès que votre premier lead arrive, cette page devient votre tableau de bord analytique en direct.',
        copy: 'Copier', copied: 'Copié',
      },
    },
    palette: {
      quickActions: 'Actions rapides', searchPlaceholder: 'Rechercher formulaires, pages, actions…',
      nothingMatches: 'Aucun résultat pour', navigate: 'naviguer', open: 'ouvrir',
      gNavigate: 'Naviguer', gForms: 'Formulaires', gResources: 'Ressources', gAccount: 'Compte',
      overview: 'Vue d’ensemble', overviewHint: 'Accueil du tableau de bord',
      clientPortals: 'Clients', clientPortalsHint: 'Entreprises & leurs boîtes de leads',
      devApi: 'API & MCP', devApiHint: 'Clés, MCP, webhooks',
      openForm: 'Ouvrir le formulaire',
      documentation: 'Documentation', documentationHint: 'Guide d’intégration',
      pricing: 'Tarifs & forfaits', pricingHint: 'Passer à un forfait supérieur',
      signOut: 'Se déconnecter', signOutHint: 'Terminer la session',
    },
    developer: {
      title: 'API & MCP', subtitle: 'Clés API, webhooks et serveur MCP — votre assistant IA peut configurer un site entier en un appel.',
      lockTitle: 'L’accès API & MCP n’est pas inclus dans ce forfait', lockBody: 'Connectez Claude, Cursor ou n’importe quel client MCP et laissez-le créer vos clients, vos formulaires et lire vos leads pour vous.', seePlans: 'Voir les forfaits',
      apiKeys: 'Clés API', newKeyOnce: 'Votre nouvelle clé — affichée une seule fois, enregistrez-la maintenant', keyNamePlaceholder: 'Nom de la clé (ex. claude-code)', creating: 'Création…', newKey: 'Nouvelle clé',
      loading: 'Chargement…', noKeys: 'Aucune clé active.', lastUsed: 'utilisée le {date}', neverUsed: 'jamais utilisée',
      couldNotCreate: 'Impossible de créer la clé.', couldNotReach: 'Impossible de joindre le serveur.',
      webhooksTitle: 'Webhooks — chaque lead, envoyé (POST) à votre application',
      wDescA: 'Définissez un endpoint https par formulaire et chaque lead stocké arrive en POST signé',
      wDescB: '— vérifiez l’en-tête', wDescC: '(extrait dans la', wDescD: '). La livraison ne bloque ni ne perd jamais un lead.',
      createFormFirst: 'Créez d’abord un formulaire — les webhooks se configurent par formulaire.', webhookPlaceholder: 'https://api.votreapp.com/hooks/inlet (vide = désactivé)', saving: 'Enregistrement…', save: 'Enregistrer', saved: 'Enregistré.', couldNotSave: 'Impossible d’enregistrer.', networkError: 'Erreur réseau.',
      mcpTitle: 'Serveur MCP — votre IA pilote vos formulaires', mcpDescA: 'Connectez Claude Code, Cursor ou n’importe quel client MCP et votre assistant peut', mcpDescStrong: 'créer des clients et des formulaires, récupérer le code exact pour le framework, vérifier la santé d’un formulaire et lire les leads', mcpDescB: 'sans quitter l’éditeur. Un seul appel, `setup_site`, met un site en ligne.', endpoint: 'Endpoint', toolsAvailable: 'Outils :',
    },
    endClients: {
      title: 'Clients', subtitle: 'Les entreprises pour lesquelles vous créez des sites. Chacune reçoit ses leads par e-mail et dans une boîte privée à sa marque.', newBtn: 'Nouveau client',
      lockTitle: 'Limite de clients atteinte', lockBody: 'La limite de clients de votre forfait est atteinte. Passez à un forfait supérieur pour ajouter d’autres entreprises.', seePlans: 'Voir les forfaits',
      emailedMsg: 'Un lien d’accès a été envoyé à {email} — il choisit son propre mot de passe ; vous ne le voyez jamais.',
      namePlaceholder: 'Nom de l’entreprise (ex. Acme Corp)', emailPlaceholder: 'contact@acme.com — là où vont ses leads', creating: 'Création…', createBtn: 'Créer le client',
      portalLogin: 'Sa boîte :', count: '{n} / {limit} clients', loading: 'Chargement…',
      emptyTitle: 'Aucun client pour l’instant', emptyBody: 'Créez la première entreprise pour laquelle vous travaillez. Chaque formulaire que vous créez appartient à l’un de vos clients.',
      formsTheySee: 'Ses formulaires', noneAssigned: 'Aucun formulaire — créez-en un depuis la vue d’ensemble.', assignForm: '+ Déplacer un formulaire ici…',
      couldNotCreate: 'Impossible de créer le client.', couldNotReach: 'Impossible de joindre le serveur.',
      resetBtn: 'Envoyer un lien d’accès', resetConfirmTitle: 'Envoyer un nouveau lien d’accès ?', resetConfirmBody: 'Il reçoit un lien à usage unique pour choisir un nouveau mot de passe. Son mot de passe actuel continue de fonctionner tant qu’il ne l’utilise pas.', resetConfirmBtn: 'Envoyer le lien', cancel: 'Annuler',
      resetting: 'Envoi…', resetOk: 'Lien d’accès envoyé.', resetErr: 'Impossible d’envoyer le lien.',
      websiteLabel: 'Site web', websitePlaceholder: 'https://acme.com (optionnel)', langLabel: 'Langue', inviteNow: 'Lui envoyer dès maintenant l’accès à sa boîte', inviteHint: 'Un lien à usage unique ; il choisit son mot de passe. Rien n’est envoyé si décoché.',
      sendAccess: 'Envoyer l’accès', resendAccess: 'Renvoyer l’accès', accessSent: 'Lien envoyé', hasAccess: 'A accès', noAccessYet: 'Pas encore d’accès',
      notifyLeads: 'Reçoit chaque lead par e-mail', edit: 'Modifier', save: 'Enregistrer', cancelEdit: 'Annuler', deleteBlocked: 'Ce client a encore des formulaires — déplacez-les ou supprimez-les d’abord.',
      deleteConfirmTitle: 'Retirer ce client ?', deleteConfirmBody: 'Son accès à sa boîte prend fin. Ses formulaires doivent d’abord être déplacés ou supprimés.', deleteBtn: 'Retirer',
      leadsBy: 'Leads par e-mail', createdExisting: 'Vous avez déjà un client avec cet e-mail.',
    },
    formPage: {
      formView: 'Vue du formulaire', subtitle: 'Données et fichiers soumis via ce formulaire.', exportCsv: 'Exporter CSV',
      totalSubmissions: 'Total des soumissions', forThisForm: 'Pour ce formulaire', trend30: 'Tendance (30 derniers jours)',
      moreDataTitle: 'Plus de données nécessaires', moreDataBody: 'Le graphique se débloque à 10 soumissions.',
      structuredData: 'Données structurées', searchResults: 'Rechercher dans ces résultats…',
      date: 'Date', more: '… ({n} de plus)', noData: 'Aucune donnée trouvée.', file: 'Fichier', viewDetails: 'Voir les détails →',
      fullSubmission: 'Soumission complète', submittedAt: 'Soumis le {date}', attachedDoc: 'Document joint', downloadFile: 'Télécharger le fichier',
      settings: {
        title: 'Réglages du formulaire', subtitle: 'Qui reçoit les leads, quels sites peuvent envoyer, ce que le visiteur reçoit en retour.', loading: 'Chargement des réglages…',
        nameLabel: 'Nom du formulaire', clientLabel: 'Client (reçoit les leads)', originsLabel: 'Sites autorisés', originsHint: 'Une origine par ligne, ex. https://acme.com. Utilisez * pour autoriser tous les sites (déconseillé).',
        successUrlLabel: 'Page de succès', successUrlHint: 'Où le visiteur arrive après un envoi natif (sans JavaScript). Optionnel.',
        webhookLabel: 'URL de webhook', webhookHint: 'Chaque lead enregistré est envoyé ici en JSON signé (X-Inlet-Signature). https uniquement. Optionnel.',
        autoReplyLabel: 'Réponse automatique au visiteur', autoReplyHint: 'Envoyée au champ « email », à la marque du client. Retenue pour les leads signalés comme suspects.',
        subjectLabel: 'Objet', messageLabel: 'Message', messageHint: 'Utilisez {{name}} pour le nom du visiteur. Vide = message par défaut.',
        developerCopyLabel: 'Me mettre en copie de chaque lead', developerCopyHint: 'Le client reçoit toujours le lead ; ceci ajoute une copie pour vous.',
        activeLabel: 'Formulaire en ligne', activeHint: 'Un formulaire en pause répond 403 et n’enregistre rien.',
        save: 'Enregistrer', saving: 'Enregistrement…', saved: 'Enregistré.', saveErr: 'Impossible d’enregistrer.',
        integrationTitle: 'Intégration', integrationSubtitle: 'Choisissez votre stack. Le code ne contient que l’identifiant public du formulaire.', leadsGoTo: 'Les leads vont à',
        deleteTitle: 'Supprimer ce formulaire', deleteBody: 'Le formulaire et tous les leads qu’il a enregistrés sont supprimés. Les sites qui lui envoient encore des données recevront un 404.', deleteBtn: 'Supprimer le formulaire', deleteErr: 'Impossible de supprimer le formulaire.', cancel: 'Annuler',
      },
    },
    snippets: { copy: 'Copier', copied: 'Copié', helperTab: 'inlet.js (helper)', filesHint: 'Deux fichiers : le helper une fois par projet, le formulaire là où vous en avez besoin.', noEmail: 'Ni adresse e-mail ni clé dans ce code — l’identifiant du formulaire est routé vers la boîte de votre client de notre côté.' },
    upgrade: { request: 'Demander {plan}', requested: '{plan} demandé — nous confirmons par e-mail', pending: 'Demande en attente', signIn: 'Connectez-vous pour demander', err: 'Impossible d’envoyer la demande.', current: 'Forfait actuel', note: 'Le paiement par carte ouvre avec la facturation. D’ici là, une demande est activée à la main, le jour même.' },
    admin: {
      nav: { dashboard: 'Tableau de bord', analytics: 'Analytique', revenue: 'Revenus', forms: 'Formulaires', clients: 'Clients', emailHealth: 'Santé e-mail', security: 'Sécurité', logs: 'Journaux & échecs', blacklist: 'Liste noire', myAtelier: 'Mon atelier', signOut: 'Se déconnecter', adminLabel: 'Admin', lightMode: 'Mode clair', darkMode: 'Mode sombre' },
      home: {
        title: 'Tableau de bord', subtitle: 'Vue d’ensemble de l’activité de votre service de formulaires.', loading: 'Chargement…',
        forms: 'Formulaires', clients: 'Clients', leadsReceived: 'Leads reçus', blacklist: 'Liste noire',
        recentSubmissions: 'Soumissions récentes', recentSubtitle: 'Les 5 derniers leads sur l’ensemble de vos formulaires.', viewAll: 'Tout voir',
        noLeads: 'Aucun lead pour l’instant.', unknownForm: 'Formulaire inconnu', submissionId: 'ID de soumission :',
      },
      blacklist: {
        title: 'Liste noire de sécurité', subtitle: 'Consultez et gérez les IP, empreintes et hôtes bannis.', banTarget: 'Bannir une cible',
        noActive: 'Aucun bannissement actif.', colDate: 'Date', colTarget: 'Cible', colType: 'Type', colReason: 'Raison', colAction: 'Action', remove: 'Retirer',
        modalTitle: 'Bannir une cible', targetLabel: 'Cible à bannir (IP, empreinte ou hôte)', targetPlaceholder: 'ex. 198.51.100.42 ou un nom d’hôte VPS',
        typeLabel: 'Type de cible', typeIp: 'Adresse IP', typeFingerprint: 'Empreinte (fingerprint)', typeHost: 'Hôte (domaine DNS inversé)',
        reasonLabel: 'Motif du bannissement', reasonPlaceholder: 'ex. Spam observé depuis ce serveur',
        cancel: 'Annuler', banning: 'Bannissement…', submitBan: 'Bannir la cible',
        requiredErr: 'La cible et le motif sont requis.', existsErr: 'Cette cible existe déjà ou est invalide.',
        removeConfirmTitle: 'Retirer de la liste noire ?', removeConfirmBody: 'Cette cible pourra à nouveau soumettre des formulaires immédiatement.', removeConfirmBtn: 'Retirer',
        removeErr: 'Impossible de retirer la cible.', removedOk: 'Cible retirée de la liste noire.',
      },
      forms: {
        title: 'Formulaires', subtitle: 'Configurez vos formulaires et récupérez leurs liens d’intégration.', newForm: 'Nouveau formulaire', noForms: 'Aucun formulaire pour l’instant.',
        client: 'Client', unknownClient: 'Inconnu', corsOrigins: 'Origines CORS', integration: 'Intégration',
        requiredErr: 'Le nom et le client sont requis.', createErr: 'Impossible de créer le formulaire.', activatedOk: 'Formulaire activé.', pausedOk: 'Formulaire mis en pause.', updateErr: 'Impossible de mettre à jour le formulaire.',
        deleteConfirmTitle: 'Supprimer ce formulaire ?', deleteConfirmBody: 'Le formulaire et ses paramètres sont supprimés définitivement. Les sites qui lui envoient encore des données recevront des erreurs 404.', deleteConfirmBtn: 'Supprimer le formulaire', deleteErr: 'Impossible de supprimer le formulaire.', deletedOk: 'Formulaire supprimé.',
        needClientFirst: 'Créez d’abord au moins un développeur — chaque formulaire appartient à un développeur et à l’un de ses clients.',
        modalTitle: 'Créer un formulaire', formNameLabel: 'Nom du formulaire', formNamePlaceholder: 'ex. Formulaire de contact Acme',
        recipientLabel: 'Développeur', clientLabel: 'Client (reçoit les leads)', clientDefaultHint: 'Pas encore de client — un client par défaut est créé à partir des coordonnées du développeur', corsLabel: 'Origines CORS autorisées (séparées par des virgules)', corsPlaceholder: 'ex. https://acme.com, https://blog.acme.com (ou * pour tout autoriser)', corsHint: 'Séparez plusieurs sites par des virgules. Utilisez `*` pour tout autoriser.',
        autoReply: 'Réponse automatique', subjectLabel: 'Objet de l’e-mail', subjectPlaceholder: 'Nous avons bien reçu votre message',
        messageLabel: 'Message de confirmation', messagePlaceholder: 'ex. Merci pour votre message. Nous revenons vers vous rapidement…', messageHint: 'Laissez vide pour utiliser le message par défaut (qui inclut le nom du client destinataire).',
        cancel: 'Annuler', creating: 'Création…', create: 'Créer',
      },
      clients: {
        title: 'Développeurs', subtitle: 'Les comptes développeurs de la plateforme. Chacun crée ses propres clients et formulaires.', newClient: 'Nouveau développeur', noClients: 'Aucun développeur pour l’instant.',
        accessLinkLabel: 'Mot de passe : jamais visible. Envoyez un lien de définition à la place.', sendAccessLink: 'Envoyer le lien',
        requiredErr: 'Le nom et l’e-mail sont requis.', saveErr: 'Impossible de sauvegarder le développeur.',
        deleteConfirmTitle: 'Supprimer ce client ?', deleteConfirmBody: 'Cette action supprime définitivement le client et tous les formulaires qui lui appartiennent. Leurs leads restent dans la base de données mais perdent leur propriétaire.', deleteConfirmBtn: 'Supprimer le client', deleteErr: 'Impossible de supprimer le client.', deletedOk: 'Client supprimé.',
        passwordErr: 'Impossible de récupérer le mot de passe.', networkErr: 'Erreur réseau.',
        resetConfirmTitle: 'Envoyer un lien de définition du mot de passe ?', resetConfirmBody: 'Le développeur reçoit un lien à usage unique (1 heure) pour choisir un nouveau mot de passe. Son mot de passe actuel continue de fonctionner tant qu’il ne l’utilise pas.', resetConfirmBtn: 'Envoyer le lien', resetOk: 'Lien envoyé.', resetErr: 'Impossible d’envoyer le lien.',
        hide: 'Cacher', show: 'Voir', resetPasswordTitle: 'Réinitialiser le mot de passe', edit: 'Modifier', delete: 'Supprimer',
        editModalTitle: 'Modifier le client', createModalTitle: 'Créer un client',
        clientNameLabel: 'Nom du client', clientNamePlaceholder: 'ex. Acme Corp',
        emailLabel: 'Adresse e-mail', emailPlaceholder: 'ex. contact@acme.com',
        phoneLabel: 'Numéro de téléphone (SMS)', phonePlaceholder: 'ex. +1 555 123 4567',
        artDirectionTitle: 'Direction artistique (e-mails)', logoUrlLabel: 'URL du logo', logoUrlPlaceholder: 'https://.../logo.png',
        primaryColorLabel: 'Couleur principale', fontFamilyLabel: 'Police de caractères', fontSans: 'Sans-serif (par défaut)', fontSerif: 'Serif (classique)', fontMono: 'Monospace (code)',
        customSenderTitle: 'Expéditeur personnalisé', paidBadge: 'Payant',
        customSenderDescA: 'Comment la marque de ce client apparaît sur les e-mails de confirmation reçus par ses clients. Appliqué uniquement sur les forfaits payants. Une véritable adresse',
        customSenderDescC: 'personnalisée s’active une fois le domaine du client vérifié.',
        senderNameLabel: 'Nom d’affichage de l’expéditeur', senderNamePlaceholder: 'ex. Shu', senderNameHint: 'Affiché comme nom de l’expéditeur. Utilise le nom du client si laissé vide.',
        replyToLabel: 'Adresse de réponse', replyToPlaceholder: 'ex. contact@shu.com', replyToHint: 'Les réponses de leurs clients arrivent ici. Fonctionne dès aujourd’hui — aucun domaine requis.',
        securityTitle: 'Sécurité', twoFactorLabel: 'Exiger une connexion à deux facteurs', twoFactorHint: 'Après son mot de passe, ce client doit saisir un code à 6 chiffres envoyé à {email}.', theirAddress: 'son adresse',
        cancel: 'Annuler', saving: 'Enregistrement…', save: 'Enregistrer',
        endClientsToggle: 'Clients finaux', endClientsEmpty: 'Aucun client final pour l’instant.', endClientsLoading: 'Chargement…', endClientsLoadErr: 'Impossible de charger les clients finaux.',
        endClientResetTitle: 'Envoyer un lien d’accès', endClientResetConfirmTitle: 'Envoyer à ce client un nouveau lien d’accès ?', endClientResetConfirmBody: 'Il reçoit un lien à usage unique pour choisir un nouveau mot de passe.', endClientResetConfirmBtn: 'Envoyer le lien',
        endClientResetOk: 'Lien d’accès envoyé.', endClientResetErr: 'Impossible d’envoyer le lien.',
      },
      formDetail: {
        notFoundTitle: 'Formulaire introuvable', backToList: 'Retour à la liste', backToForms: 'Retour aux formulaires', recipientClient: 'Client destinataire :',
        deactivate: 'Désactiver le formulaire', activate: 'Activer le formulaire', updateErr: 'Impossible de mettre à jour le formulaire.', activatedOk: 'Formulaire activé.', pausedOk: 'Formulaire mis en pause.',
        directIntegrationTitle: 'Intégration HTML directe', directIntegrationDesc: 'Copiez cette URL dans l’attribut `action` de votre formulaire HTML standard.', htmlExampleLabel: 'Exemple de code HTML :',
        advancedSettingsTitle: 'Paramètres avancés & réponse automatique', advancedSettingsDesc: 'Configurez la page de redirection et l’e-mail de confirmation automatique envoyé au prospect.',
        redirectUrlLabel: 'URL de redirection (succès)', redirectUrlPlaceholder: 'ex. https://votresite.com/merci', redirectUrlHint: 'Force une redirection vers cette page après soumission (remplace la config de votre frontend). Laissez vide pour utiliser celle de votre code.',
        webhookUrlLabel: 'URL de webhook (POST signé par lead)', webhookUrlPlaceholder: 'ex. https://api.votreapp.com/hooks/inlet', webhookUrlHint: 'Chaque lead enregistré est envoyé ici en JSON, signé par HMAC (X-Inlet-Signature). Doit être en https. Laissez vide pour désactiver.',
        enableAutoReply: 'Activer la réponse automatique', enableAutoReplyHint: 'Envoie un e-mail de confirmation à l’adresse fournie.',
        subjectLabel: 'Objet de l’e-mail', subjectPlaceholder: 'Nous avons bien reçu votre message',
        messageLabel: 'Message (texte brut)', messagePlaceholder: 'ex. Bonjour {{name}}, nous avons bien reçu votre demande…', messageHintA: 'Utilisez', messageHintB: 'ou', messageHintC: 'pour inclure dynamiquement le nom de l’expéditeur. Laissez vide pour utiliser le message par défaut.',
        saving: 'Enregistrement…', saveSettings: 'Enregistrer les paramètres', settingsErr: 'Impossible d’enregistrer les paramètres.', settingsOk: 'Paramètres mis à jour.',
        corsTitle: 'Domaines CORS configurés', corsDesc: 'Précisez les domaines autorisés (séparés par des virgules). Utilisez `*` pour tout autoriser.', corsPlaceholder: 'https://votresite.com, https://autre.com', updateCors: 'Mettre à jour CORS', corsErr: 'Impossible d’enregistrer les domaines CORS.', corsOk: 'Domaines CORS mis à jour.',
        leadsReceived: 'Leads reçus ({n})', noSubmissions: 'Aucune soumission pour l’instant.',
        colDate: 'Date', colIp: 'IP', colPreview: 'Aperçu', colAction: 'Action', details: 'Détails',
        submissionDetailsTitle: 'Détails de la soumission', dateLabel: 'Date :', ipLabel: 'IP :', close: 'Fermer',
      },
      email: {
        title: 'Santé e-mail', subtitle: 'État en direct de chaque compte d’envoi. Un fournisseur suspendu ou limité apparaît ici dès qu’il échoue.', refresh: 'Actualiser',
        outageTitle: 'Aucun compte ne peut envoyer pour le moment', outageBody: 'Tous les comptes configurés sont désactivés ou en échec. Les nouveaux leads continuent d’être capturés, mais les e-mails de notification et de réponse automatique ne partent plus. Réactivez un compte ou ajoutez un nouveau fournisseur.',
        statSendingAccounts: 'Comptes d’envoi', statSendingAccountsHint: 'actifs / configurés',
        statOutages24h: 'Pannes (24h)', statOutages24hHint: 'événements « tous comptes en échec »',
        statLastOutage: 'Dernière panne', statLastOutageHintSome: 'échec total le plus récent', statLastOutageHintNone: 'aucune enregistrée',
        loadingAccounts: 'Chargement de l’état des comptes…', noAccountsA: 'Aucun compte d’envoi configuré. Ajoutez des identifiants', noAccountsB: 'à votre environnement.',
        accountPrefix: 'Compte ', fromLabel: 'depuis', failures24hLabel: 'Échecs (24h) :', noRecentFailures: 'aucun échec récent',
        footerA: 'Désactivez proprement un compte suspendu en définissant', footerB: 'dans votre environnement — il sort de la rotation sans supprimer ses identifiants.',
        statusHealthy: 'Sain', statusRecovering: 'En rétablissement', statusFailing: 'En échec', statusDisabled: 'Désactivé',
        justNow: 'à l’instant', minAgo: 'il y a {n}m', hourAgo: 'il y a {n}h', dayAgo: 'il y a {n}j', noneDash: '—',
      },
      security: {
        title: 'Sécurité', subtitle: 'Journal d’audit en direct — connexions échouées, blocages de débit et activité des comptes sur la plateforme.', refresh: 'Actualiser',
        migrationStrong: 'Configuration unique :', migrationA: 'exécutez', migrationB: 'dans l’éditeur SQL Supabase pour activer le journal d’audit. Les événements sont déjà enregistrés dès que la table existe.',
        statFailedLogins: 'Connexions échouées (24h)', statRateBlocks: 'Blocages de débit (24h)', statAdminFails: 'Échecs de connexion admin (24h)',
        noisiestIps: 'IP sources les plus actives (24h)',
        colWhen: 'Quand', colEvent: 'Événement', colActor: 'Acteur', colIp: 'IP', colDetail: 'Détail',
        loadingEvents: 'Chargement des événements…', noEvents: 'Aucun événement de sécurité enregistré pour l’instant — tout est calme.', dash: '—',
        justNow: 'à l’instant', minAgo: 'il y a {n}m', hourAgo: 'il y a {n}h', dayAgo: 'il y a {n}j',
        evAdminLoginOk: 'Connexion admin', evAdminLoginFailed: 'Échec de connexion admin', evClientLoginOk: 'Connexion client', evClientLoginFailed: 'Échec de connexion client',
        evPortalLoginFailed: 'Échec de connexion portail', evRateLimitBlock: 'Blocage de débit', evPasswordResetRequest: 'Demande de réinitialisation du mot de passe',
      },
      logs: {
        title: 'Journaux & échecs', subtitle: 'Suivez les échecs SMTP, les déclenchements de pot de miel et les blocages anti-spam.', liveMode: 'Mode direct (1s)', pollingMode: 'Actualisation (2m)',
        colTimestamp: 'Horodatage', colErrorType: 'Type d’erreur', colForm: 'Formulaire', colMessage: 'Message',
        loadingLogs: 'Chargement des journaux…', noFailures: 'Aucun échec enregistré.', unknownForm: 'Inconnu',
      },
      analytics: {
        title: 'Analytique du trafic', subtitleDisabled: 'Qui visite, ce qu’ils consultent, d’où ils viennent.', subtitleEnabled: 'First-party, respectueux de la vie privée (IP hachées). Actualisation automatique.',
        notEnabledA: 'L’analytique n’est pas encore activée. Exécutez', notEnabledB: 'dans Supabase, puis cette page se remplit automatiquement.', refresh: 'Actualiser',
        kpiViewsToday: 'Vues aujourd’hui', kpiViewsTodayHint: 'pages vues (24h)',
        kpiVisitorsToday: 'Visiteurs aujourd’hui', kpiVisitorsTodayHint: 'sessions uniques (24h)',
        kpiViews7d: 'Vues · 7 jours', kpiViews7dHint: '{n} visiteurs uniques',
        kpiViewsAllTime: 'Vues · total', kpiViewsAllTimeHint: 'depuis le début du suivi',
        last30Days: '30 derniers jours', chartViews: 'Vues', chartVisitors: 'Visiteurs',
        topPages: 'Pages les plus vues', topReferrers: 'Meilleurs référents', devices: 'Appareils', countries: 'Pays', noData: 'Aucune donnée pour l’instant.',
        recentVisitors: 'Visiteurs récents', colWhen: 'Quand', colPage: 'Page', colReferrer: 'Référent', colDevice: 'Appareil', colCountry: 'Pays',
        direct: 'Direct', noVisits: 'Aucune visite enregistrée pour l’instant.', dash: '—',
      },
      revenue: {
        title: 'Revenus & abonnés', subtitle: 'Qui paie, revenu récurrent mensuel, et croissance.', couldNotLoad: 'Impossible de charger les revenus.',
        kpiMrr: 'MRR', kpiMrrHint: '{arr} ARR', kpiPaid: 'Abonnés payants', kpiPaidHint: 'sur {n} comptes',
        kpiConversion: 'Conversion', kpiConversionHint: 'payants ÷ total des comptes', kpiArpu: 'ARPU', kpiArpuHint: 'revenu moyen / utilisateur payant',
        planMix: 'Répartition des forfaits', perMonth: '/mois', paying: 'Payants', free: 'Gratuits',
        growth6mo: 'Croissance · 6 derniers mois', newSignups: 'Nouvelles inscriptions', newPaid: 'Nouveaux payants',
        recentPaidAccounts: 'Comptes payants récents', colAccount: 'Compte', colPlan: 'Forfait', colSince: 'Depuis', noPaidYet: 'Aucun abonné payant pour l’instant — ils apparaîtront ici dès qu’un compte passe au payant.',
      },
      submissions: {
        title: 'Leads / Soumissions', subtitle: 'Chaque message reçu sur l’ensemble de vos formulaires.', exportCsv: 'Exporter en CSV', noLeads: 'Aucun lead pour l’instant.', noData: 'Aucune donnée',
        colDate: 'Date', colForm: 'Formulaire', colIp: 'IP', colDataPreview: 'Aperçu des données', colAction: 'Action', details: 'Détails', unknownForm: 'Inconnu',
        leadDetailsTitle: 'Détails du lead', dateLabel: 'Date :', ipLabel: 'IP :', fingerprintLabel: 'Empreinte :', close: 'Fermer',
      },
    },
    portal: {
      login: {
        title: 'Votre boîte de leads', subtitle: 'Connectez-vous pour voir et traiter les demandes envoyées depuis votre site.', emailLabel: 'E-mail', passwordLabel: 'Mot de passe',
        signingIn: 'Connexion…', signIn: 'Se connecter',
        errTooMany: 'Trop de tentatives. Veuillez patienter une minute et réessayer.', errIncorrect: 'E-mail ou mot de passe incorrect.', errNetwork: 'Impossible de joindre le serveur.',
        forgot: 'Mot de passe oublié ?',
      },
      setPassword: {
        title: 'Choisissez votre mot de passe', resetTitle: 'Choisissez un nouveau mot de passe', subtitle: 'Il ouvre votre boîte privée : chaque demande envoyée depuis votre site, conservée et prête à être traitée.',
        passwordLabel: 'Mot de passe', confirmLabel: 'Confirmez le mot de passe', placeholder: 'Au moins 8 caractères',
        submit: 'Enregistrer et ouvrir ma boîte', submitting: 'Enregistrement…',
        errMismatch: 'Les mots de passe ne correspondent pas.', errShort: 'Le mot de passe doit contenir au moins 8 caractères.', errNetwork: 'Impossible de joindre le serveur.',
        missingToken: 'Ce lien est incomplet. Rouvrez-le depuis l’e-mail, ou demandez-en un nouveau.', askNew: 'Demander un nouveau lien',
      },
      forgot: { title: 'Réinitialisez votre mot de passe', body: 'Saisissez l’e-mail avec lequel votre boîte a été créée. S’il existe, un lien à usage unique est en route.', emailLabel: 'E-mail', send: 'Envoyer le lien', sending: 'Envoi…', sent: 'Si un compte existe pour cette adresse, un lien a été envoyé. Il expire dans 1 heure.', back: '← Retour à la connexion' },
      layout: {
        defaultBrandName: 'Portail client', poweredBy: 'Propulsé par Inlet', signOut: 'Se déconnecter',
      },
      home: {
        title: 'Vos leads',
        loadingLeads: 'Chargement de vos leads…', emptyTitle: 'Aucun lead pour l’instant', emptyBody: 'Dès que vos formulaires recevront des soumissions, elles apparaîtront ici en temps réel.',
        yourLeads: 'Vos leads', totalAcrossOne: '{n} au total sur {m} formulaire', totalAcrossMany: '{n} au total sur {m} formulaires',
        exportCsv: 'Exporter en CSV', searchPlaceholder: 'Rechercher des leads…', allForms: 'Tous les formulaires', formFallback: 'Formulaire',
        colDate: 'Date', colForm: 'Formulaire', colPreview: 'Aperçu', noMatch: 'Aucun lead ne correspond à votre recherche.',
        submissionTitle: 'Soumission', close: 'Fermer', downloadFile: 'Télécharger le fichier',
      },
    },
  },
};

export function getAppDict(locale: Locale): AppDict {
  return appDictionaries[locale];
}
export type { AppDict };
