import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = 'Plugged | Nigerian Fashion Store';
const DEFAULT_DESCRIPTION =
  'Premium Nigerian fashion e-commerce platform featuring traditional and contemporary designs.';
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/darhndmms/image/upload/v1765207904/WhatsApp_Image_2025-10-28_at_11.51.32_0752b31a_-_Copy_ivmyz2.jpg';
const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  'https://pluggedby212.shop';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

export function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  noIndex,
  structuredData,
}: SeoProps) {
  const canonicalUrl = (() => {
    if (url) {
      try {
        return new URL(url, SITE_URL).href;
      } catch (e) {
        return SITE_URL;
      }
    }
    if (typeof window !== 'undefined') return window.location.href;
    return SITE_URL;
  })();

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
