export const okuCtaCopy = {
  entry: {
    brand: 'OKU Therapy',
    description:
      'Private, calm access into the OKU Therapy workspace for clients, practitioners, and admins.',
    label: 'Start a confidential consultation',
    loginBadge: 'Secure entry',
    loginDescription:
      'Sign in to your private OKU Therapy workspace. You will land in the right dashboard automatically.',
    loginTitle: 'Welcome back',
    signupBadge: 'Private onboarding',
    signupDescription:
      'Create a secure client or practitioner account and step into the right level of access.',
    signupTitle: 'Create your private OKU account',
  },
  carePromise: {
    heading: 'Private by design',
    points: [
      'Private, role-aware workspaces for clients, practitioners, and admins.',
      'Evidence-based assessments and guided care journeys in one place.',
      'Booking, progress tracking, and follow-up anchored in a calmer experience.',
    ],
  },
  authHighlights: {
    login: [
      {
        detail: 'Private sign-in with a role-aware handoff into the app.',
        label: 'Protected entry',
      },
      {
        detail: 'Calm, confidential access for clinical and client sessions.',
        label: 'Confidential by design',
      },
      {
        detail: 'Demo accounts are ready for local testing and QA.',
        label: 'Fast local access',
      },
      {
        detail: 'Built for the same brand system as the public site.',
        label: 'Brand aligned',
      },
    ],
    signup: [
      {
        detail: 'Clients can book, log mood, and complete assessments right away.',
        label: 'Client onboarding',
      },
      {
        detail: 'Practitioners are created as pending and verified by admin review.',
        label: 'Practitioner verification',
      },
      {
        detail: 'A simple profile-first setup keeps signup calm and fast.',
        label: 'Low-friction setup',
      },
      {
        detail: 'The new experience stays aligned with the homepage and brand tone.',
        label: 'Brand aligned',
      },
    ],
  },
} as const

export const okuMarketingRoutes = {
  authLogin: '/auth/login',
  authSignup: '/auth/signup',
  clientAssessments: '/client/assessments',
} as const

export const okuMarketingLinkCopy = {
  primaryConsultation: {
    label: okuCtaCopy.entry.label,
    sourceLabels: ['Book a free 1:1 consultation', 'Book a free consultation'],
    targetHref: okuMarketingRoutes.authSignup,
  },
  footerConsultation: {
    label: okuCtaCopy.entry.label,
    sourceLabels: ['Free Consultation'],
    targetHref: okuMarketingRoutes.authSignup,
  },
  assessmentEntry: {
    label: 'Assessments',
    sourceLabels: ['Take Quiz'],
    targetHref: okuMarketingRoutes.clientAssessments,
  },
} as const

export const okuMarketingCopyRewrite = [
  {
    from: 'Book a free consultation to begin gently.',
    to: `${okuCtaCopy.entry.label} to begin gently.`,
  },
  {
    from:
      'Our free 20-minute consultation is a space to ask questions, feel things out, and see if we’re the right fit—no pressure, no prep needed.',
    to: 'Our confidential 20-minute consultation is a space to ask questions, feel things out, and see if we’re the right fit - no pressure, no prep needed.',
  },
] as const
