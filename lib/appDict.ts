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
      createTitle: string; liveTitle: string; nameHint: string; namePlaceholder: string;
      seePro: string; creating: string; createBtn: string;
      readyBody: string; openGuide: string; done: string; couldNotCreate: string; couldNotReach: string;
    };
    onboarding: {
      kicker: string; title: string; subtitle: string;
      s1Title: string; s1Done: string; s1Forms: string; s1Body: string;
      s2Title: string; s2Body: string; jsAlt: string; readDocs: string;
      s3Title: string; s3Body: string; waiting: string;
      footer: string;
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
    createdMsg: string; portalUrl: string; email: string; tempPassword: string;
    namePlaceholder: string; emailPlaceholder: string; creating: string; createBtn: string;
    portalLogin: string; count: string; loading: string;
    emptyTitle: string; emptyBody: string;
    formsTheySee: string; noneAssigned: string; assignForm: string;
    couldNotCreate: string; couldNotReach: string;
  };
  formPage: {
    formView: string; subtitle: string; exportCsv: string;
    totalSubmissions: string; forThisForm: string; trend30: string;
    moreDataTitle: string; moreDataBody: string;
    structuredData: string; searchResults: string;
    date: string; more: string; noData: string; file: string; viewDetails: string;
    fullSubmission: string; submittedAt: string; attachedDoc: string; downloadFile: string;
  };
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
      recipientLabel: string; corsLabel: string; corsPlaceholder: string; corsHint: string;
      autoReply: string; subjectLabel: string; subjectPlaceholder: string;
      messageLabel: string; messagePlaceholder: string; messageHint: string;
      cancel: string; creating: string; create: string;
    };
    clients: {
      title: string; subtitle: string; newClient: string; noClients: string;
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
    };
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
        point3Title: 'Self-hosted, you own the data', point3Desc: 'Your leads live on your infrastructure, always.',
        footerTagline: 'Self-hosted · privacy-first · you own the data', backToSite: '← Back to site', orDivider: 'or',
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
        welcomeBack: 'Welcome back', subtitle: 'Sign in to see your leads and performance.', googleSignIn: 'Sign in with Google',
        emailLabel: 'Email', passwordLabel: 'Password', forgotPassword: 'Forgot password?', signingIn: 'Signing in…', signIn: 'Sign in',
        noAccount: 'No account yet?', createOneFree: 'Create one free',
        errGoogleFailed: 'Google sign-in failed or was cancelled. Try again or use your password.',
        errEvicted: 'You were signed out because this account reached its device limit — a newer sign-in on another device took this slot.',
        errTooMany: 'Too many attempts. Please wait a minute and try again.', errIncorrect: 'Incorrect email or password.', errNetwork: 'Could not reach the server.', errIncorrectCode: 'Incorrect code.',
      },
      clientSignup: {
        title: 'Create your account', subtitle: 'Start free — one form backend for all your websites.', googleSignUp: 'Sign up with Google',
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
      nf: {
        createTitle: 'Create a form', liveTitle: 'Your form is live',
        nameHint: "Name it after the website or purpose — you'll get its ID and a working snippet right away.",
        namePlaceholder: 'e.g. Portfolio contact form',
        seePro: 'See Pro plans', creating: 'Creating…', createBtn: 'Create form',
        readyBody: 'is ready to receive submissions. Wire it with these two values:',
        openGuide: 'Open the integration guide', done: 'Done', couldNotCreate: 'Could not create the form.', couldNotReach: 'Could not reach the server.',
      },
      onboarding: {
        kicker: 'Getting started', title: "Let's get your first lead", subtitle: 'Three steps, about two minutes. No SMTP, no backend to run.',
        s1Title: 'Create a form', s1Done: 'Done · {n} form{s}', s1Forms: '', s1Body: "Name it after the website it lives on. You'll get an ID to wire up.",
        s2Title: 'Add it to your website', s2Body: 'Paste this HTML anywhere. It works with no JavaScript and no email setup.',
        jsAlt: 'Prefer a JavaScript integration with proof-of-work spam protection?', readDocs: 'Read the docs',
        s3Title: 'Receive your first lead', s3Body: 'Submit your form once to test it. Your lead lands here instantly — with the owner notified and a branded auto-reply sent for you.',
        waiting: 'Waiting for your first submission… refresh after you send one.',
        footer: 'Once your first lead arrives, this page becomes your live analytics dashboard.',
      },
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
    formPage: {
      formView: 'Form view', subtitle: 'Data and files submitted through this form.', exportCsv: 'Export CSV',
      totalSubmissions: 'Total submissions', forThisForm: 'For this form', trend30: 'Trend (last 30 days)',
      moreDataTitle: 'More data needed', moreDataBody: 'The chart unlocks at 10 submissions.',
      structuredData: 'Structured data', searchResults: 'Search these results…',
      date: 'Date', more: '… ({n} more)', noData: 'No data found.', file: 'File', viewDetails: 'View details →',
      fullSubmission: 'Full submission', submittedAt: 'Submitted {date}', attachedDoc: 'Attached document', downloadFile: 'Download file',
    },
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
        needClientFirst: 'Create at least one client first — every form belongs to a client.',
        modalTitle: 'Create a form', formNameLabel: 'Form name', formNamePlaceholder: 'e.g. Acme contact form',
        recipientLabel: 'Recipient client', corsLabel: 'Allowed CORS origins (comma-separated)', corsPlaceholder: 'e.g. https://acme.com, https://blog.acme.com (or * for all)', corsHint: 'Comma-separate multiple sites. Use `*` to allow all.',
        autoReply: 'Auto-reply', subjectLabel: 'Email subject', subjectPlaceholder: 'We received your message',
        messageLabel: 'Confirmation message', messagePlaceholder: "e.g. Thanks for your message. We'll get back to you soon…", messageHint: "Leave empty to use the default message (which includes the recipient client's name).",
        cancel: 'Cancel', creating: 'Creating…', create: 'Create',
      },
      clients: {
        title: 'Clients', subtitle: 'Manage the recipients who get form notifications.', newClient: 'New client', noClients: 'No clients yet.',
        requiredErr: 'Name and email are required.', saveErr: 'Could not save the client.',
        deleteConfirmTitle: 'Delete this client?', deleteConfirmBody: 'This permanently deletes the client and every form they own. Their leads stay in the database but lose their owner.', deleteConfirmBtn: 'Delete client', deleteErr: 'Could not delete the client.', deletedOk: 'Client deleted.',
        passwordErr: 'Could not retrieve the password.', networkErr: 'Network error.',
        resetConfirmTitle: 'Reset this client’s password?', resetConfirmBody: 'A new temporary password is generated and emailed to the client. Their current password stops working immediately.', resetConfirmBtn: 'Reset & email', resetOk: 'Password reset and emailed to the client.', resetErr: 'Could not reset the password.',
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
        title: 'Client portal', subtitle: 'Sign in to view your leads.', emailLabel: 'Email', passwordLabel: 'Password',
        signingIn: 'Signing in…', signIn: 'Sign in',
        errTooMany: 'Too many attempts. Please wait a minute and try again.', errIncorrect: 'Incorrect email or password.', errNetwork: 'Could not reach the server.',
      },
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
        point3Title: 'Auto-hébergé, vous possédez vos données', point3Desc: 'Vos leads restent sur votre propre infrastructure, toujours.',
        footerTagline: 'Auto-hébergé · respect de la vie privée · vous possédez vos données', backToSite: '← Retour au site', orDivider: 'ou',
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
        welcomeBack: 'Content de vous revoir', subtitle: 'Connectez-vous pour voir vos leads et vos performances.', googleSignIn: 'Se connecter avec Google',
        emailLabel: 'E-mail', passwordLabel: 'Mot de passe', forgotPassword: 'Mot de passe oublié ?', signingIn: 'Connexion…', signIn: 'Se connecter',
        noAccount: 'Pas encore de compte ?', createOneFree: 'Créez-en un gratuitement',
        errGoogleFailed: 'La connexion Google a échoué ou a été annulée. Réessayez ou utilisez votre mot de passe.',
        errEvicted: 'Vous avez été déconnecté car ce compte a atteint sa limite d’appareils — une nouvelle connexion sur un autre appareil a pris cette place.',
        errTooMany: 'Trop de tentatives. Veuillez patienter une minute et réessayer.', errIncorrect: 'E-mail ou mot de passe incorrect.', errNetwork: 'Impossible de joindre le serveur.', errIncorrectCode: 'Code incorrect.',
      },
      clientSignup: {
        title: 'Créez votre compte', subtitle: 'Commencez gratuitement — un seul backend de formulaires pour tous vos sites.', googleSignUp: 'S’inscrire avec Google',
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
      nf: {
        createTitle: 'Créer un formulaire', liveTitle: 'Votre formulaire est en ligne',
        nameHint: 'Nommez-le d’après le site ou son objectif — vous obtiendrez son ID et un extrait fonctionnel immédiatement.',
        namePlaceholder: 'ex. Formulaire de contact portfolio',
        seePro: 'Voir les forfaits Pro', creating: 'Création…', createBtn: 'Créer le formulaire',
        readyBody: 'est prêt à recevoir des soumissions. Câblez-le avec ces deux valeurs :',
        openGuide: 'Ouvrir le guide d’intégration', done: 'Terminé', couldNotCreate: 'Impossible de créer le formulaire.', couldNotReach: 'Impossible de joindre le serveur.',
      },
      onboarding: {
        kicker: 'Pour commencer', title: 'Obtenez votre premier lead', subtitle: 'Trois étapes, environ deux minutes. Sans SMTP, sans backend à gérer.',
        s1Title: 'Créez un formulaire', s1Done: 'Terminé · {n} formulaire{s}', s1Forms: '', s1Body: "Nommez-le d'après le site sur lequel il vit. Vous obtiendrez un ID à câbler.",
        s2Title: 'Ajoutez-le à votre site', s2Body: 'Collez ce HTML n’importe où. Ça fonctionne sans JavaScript et sans configuration e-mail.',
        jsAlt: 'Vous préférez une intégration JavaScript avec protection anti-spam par preuve de travail ?', readDocs: 'Lire la documentation',
        s3Title: 'Recevez votre premier lead', s3Body: 'Soumettez votre formulaire une fois pour le tester. Votre lead arrive ici instantanément — le propriétaire est notifié et une réponse automatique à votre image est envoyée pour vous.',
        waiting: 'En attente de votre première soumission… actualisez après en avoir envoyé une.',
        footer: 'Dès que votre premier lead arrive, cette page devient votre tableau de bord analytique en direct.',
      },
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
    formPage: {
      formView: 'Vue du formulaire', subtitle: 'Données et fichiers soumis via ce formulaire.', exportCsv: 'Exporter CSV',
      totalSubmissions: 'Total des soumissions', forThisForm: 'Pour ce formulaire', trend30: 'Tendance (30 derniers jours)',
      moreDataTitle: 'Plus de données nécessaires', moreDataBody: 'Le graphique se débloque à 10 soumissions.',
      structuredData: 'Données structurées', searchResults: 'Rechercher dans ces résultats…',
      date: 'Date', more: '… ({n} de plus)', noData: 'Aucune donnée trouvée.', file: 'Fichier', viewDetails: 'Voir les détails →',
      fullSubmission: 'Soumission complète', submittedAt: 'Soumis le {date}', attachedDoc: 'Document joint', downloadFile: 'Télécharger le fichier',
    },
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
        needClientFirst: 'Créez d’abord au moins un client — chaque formulaire appartient à un client.',
        modalTitle: 'Créer un formulaire', formNameLabel: 'Nom du formulaire', formNamePlaceholder: 'ex. Formulaire de contact Acme',
        recipientLabel: 'Client destinataire', corsLabel: 'Origines CORS autorisées (séparées par des virgules)', corsPlaceholder: 'ex. https://acme.com, https://blog.acme.com (ou * pour tout autoriser)', corsHint: 'Séparez plusieurs sites par des virgules. Utilisez `*` pour tout autoriser.',
        autoReply: 'Réponse automatique', subjectLabel: 'Objet de l’e-mail', subjectPlaceholder: 'Nous avons bien reçu votre message',
        messageLabel: 'Message de confirmation', messagePlaceholder: 'ex. Merci pour votre message. Nous revenons vers vous rapidement…', messageHint: 'Laissez vide pour utiliser le message par défaut (qui inclut le nom du client destinataire).',
        cancel: 'Annuler', creating: 'Création…', create: 'Créer',
      },
      clients: {
        title: 'Clients', subtitle: 'Gérez les destinataires qui reçoivent les notifications de formulaires.', newClient: 'Nouveau client', noClients: 'Aucun client pour l’instant.',
        requiredErr: 'Le nom et l’e-mail sont requis.', saveErr: 'Impossible de sauvegarder le client.',
        deleteConfirmTitle: 'Supprimer ce client ?', deleteConfirmBody: 'Cette action supprime définitivement le client et tous les formulaires qui lui appartiennent. Leurs leads restent dans la base de données mais perdent leur propriétaire.', deleteConfirmBtn: 'Supprimer le client', deleteErr: 'Impossible de supprimer le client.', deletedOk: 'Client supprimé.',
        passwordErr: 'Impossible de récupérer le mot de passe.', networkErr: 'Erreur réseau.',
        resetConfirmTitle: 'Réinitialiser le mot de passe de ce client ?', resetConfirmBody: 'Un nouveau mot de passe temporaire est généré et envoyé par e-mail au client. Son mot de passe actuel cesse de fonctionner immédiatement.', resetConfirmBtn: 'Réinitialiser & envoyer', resetOk: 'Mot de passe réinitialisé et envoyé par e-mail au client.', resetErr: 'Impossible de réinitialiser le mot de passe.',
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
        title: 'Portail client', subtitle: 'Connectez-vous pour consulter vos leads.', emailLabel: 'E-mail', passwordLabel: 'Mot de passe',
        signingIn: 'Connexion…', signIn: 'Se connecter',
        errTooMany: 'Trop de tentatives. Veuillez patienter une minute et réessayer.', errIncorrect: 'E-mail ou mot de passe incorrect.', errNetwork: 'Impossible de joindre le serveur.',
      },
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
