/**
 * Owivara SEO Configuration
 * All meta tags, Open Graph, Twitter Cards, and structured data
 */

export const SEO = {
  // Default meta
  DEFAULT_TITLE: 'Owivara — WhatsApp Bot Control Panel',
  DEFAULT_DESCRIPTION:
    'Orchestrate WhatsApp bots with ease. Private-first, AI-powered, built for Nigeria and Africa. Join the freemium BaaS platform that puts your data first.',
  DEFAULT_KEYWORDS: [
    'WhatsApp bot',
    'WhatsApp automation',
    'Nigeria',
    'Africa',
    'BaaS',
    'Backend as a Service',
    'AI chatbot',
    'WhatsApp business',
    'bot control panel',
    'freemium SaaS',
  ] as const,
  SITE_URL: 'https://owivara.pxxl.click',
  LOCALE: 'en_NG',

  // Open Graph
  OG: {
    TITLE: 'Owivara — WhatsApp Bot Control Panel',
    DESCRIPTION:
      'Private-first WhatsApp bot orchestration platform. Build, manage, and scale AI-powered WhatsApp bots for Nigeria and Africa.',
    IMAGE: '/og-image.png', // TODO: Add actual OG image to public/ folder
    IMAGE_WIDTH: 1200,
    IMAGE_HEIGHT: 630,
    TYPE: 'website',
    SITE_NAME: 'Owivara',
  },

  // Twitter Card
  TWITTER: {
    CARD: 'summary_large_image',
    SITE: '@owivara', // TODO: Update with actual Twitter handle
    CREATOR: '@owivara',
    TITLE: 'Owivara — WhatsApp Bot Control Panel',
    DESCRIPTION:
      'Private-first WhatsApp bot orchestration platform for Nigeria and Africa.',
    IMAGE: '/og-image.png',
  },

  // Structured Data (JSON-LD)
  SCHEMA: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Owivara',
    description:
      'WhatsApp Bot Control Panel — Private-first, AI-powered, built for Nigeria and Africa',
    url: 'https://owivara.pxxl.click',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      description: 'Freemium - Free tier available with premium upgrades',
    },
    provider: {
      '@type': 'Organization',
      name: 'Owivara',
      url: 'https://owivara.pxxl.click',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NG',
      },
    },
  },

  // Page-specific overrides
  PAGES: {
    '/': {
      title: 'Owivara — WhatsApp Bot Control Panel for Africa',
      description:
        'The freemium WhatsApp bot platform for Nigeria and Africa. Build AI-powered bots without coding. Private, secure, and fast.',
    },
    '/login': {
      title: 'Login — Owivara',
      description: 'Sign in to your Owivara WhatsApp bot control panel.',
      noindex: true as const, // Don't index auth pages
    },
    '/signup': {
      title: 'Sign Up — Owivara',
      description:
        'Create your free Owivara account and start building WhatsApp bots today.',
      noindex: true as const,
    },
    '/dashboard': {
      title: 'Dashboard — Owivara',
      description: 'Manage your WhatsApp bots and automation workflows.',
      noindex: true as const, // Dashboard is private
    },
  },

  // Robots
  ROBOTS: {
    INDEX: 'index, follow',
    NOINDEX: 'noindex, nofollow',
  },
} as const

export type SEOConfig = typeof SEO
