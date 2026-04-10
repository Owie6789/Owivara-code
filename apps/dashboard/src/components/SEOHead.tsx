import { Helmet } from 'react-helmet-async'
import { SEO } from '../config/seo'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: readonly string[]
  path?: string
  noindex?: boolean
  image?: string
}

/**
 * SEOHead Component
 * Use this in every page component to set meta tags, OG, Twitter Cards, and structured data.
 *
 * Example:
 * <SEOHead
 *   title="Custom Page Title"
 *   description="Custom description"
 *   path="/custom-page"
 * />
 */
export default function SEOHead({
  title = SEO.DEFAULT_TITLE,
  description = SEO.DEFAULT_DESCRIPTION,
  keywords = [...SEO.DEFAULT_KEYWORDS] as string[],
  path = '/',
  noindex = false,
  image = SEO.OG.IMAGE,
}: SEOHeadProps) {
  const fullUrl = `${SEO.SITE_URL}${path}`
  const robots = noindex ? SEO.ROBOTS.NOINDEX : SEO.ROBOTS.INDEX

  // Page-specific overrides
  const pageOverride = SEO.PAGES[path as keyof typeof SEO.PAGES]
  const finalTitle = pageOverride?.title || title
  const finalDescription = pageOverride?.description || description
  const finalNoindex = (pageOverride as any)?.noindex ?? noindex
  const finalRobots = finalNoindex ? SEO.ROBOTS.NOINDEX : robots

  // Structured data
  const schemaData = {
    ...SEO.SCHEMA,
    name: finalTitle,
    description: finalDescription,
    url: fullUrl,
  }

  return (
    <Helmet>
      {/* Basic meta */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={finalRobots} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={SEO.OG.TYPE} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={`${SEO.SITE_URL}${image}`} />
      <meta property="og:image:width" content={String(SEO.OG.IMAGE_WIDTH)} />
      <meta
        property="og:image:height"
        content={String(SEO.OG.IMAGE_HEIGHT)}
      />
      <meta property="og:site_name" content={SEO.OG.SITE_NAME} />
      <meta property="og:locale" content={SEO.LOCALE} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={SEO.TWITTER.CARD} />
      <meta name="twitter:site" content={SEO.TWITTER.SITE} />
      <meta name="twitter:creator" content={SEO.TWITTER.CREATOR} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${SEO.SITE_URL}${image}`} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      {/* Additional */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Owivara" />
      <meta name="theme-color" content="#0B0C10" />
    </Helmet>
  )
}
