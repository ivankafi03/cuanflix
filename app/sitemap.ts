import { MetadataRoute } from 'next';
import { getHomepageCategories } from '@/lib/jav';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cuanflix.site';

  const staticRoutes = [
    '',
    '/auth/login',
    '/auth/register',
    '/indo',
    '/jav',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Video Routes from Homepage Categories
  // Kita ambil semua video yang muncul di beranda untuk awal
  const categories = await getHomepageCategories();
  const videoRoutes: any[] = [];

  if (categories && categories.length > 0) {
    categories.forEach((category) => {
      category.videos.forEach((video: any) => {
        videoRoutes.push({
          url: `${baseUrl}/watch/${video.href}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        });
      });
    });
  }

  // Remove duplicates
  const uniqueVideoRoutes = Array.from(new Map(videoRoutes.map(v => [v.url, v])).values());

  return [...staticRoutes, ...uniqueVideoRoutes];
}
