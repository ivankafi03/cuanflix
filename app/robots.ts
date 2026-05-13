import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard/',
        '/api/',
        '/_next/',
        '/auth/',
      ],
    },
    sitemap: 'https://cuanflix.site/sitemap.xml',
  };
}
