import { MetadataRoute } from 'next'
import { getLatestVideos } from '@/lib/jav'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { videos } = await getLatestVideos()
    const baseUrl = 'https://cuanflix.site' 

    const animeLinks = latestAnime.map((anime) => ({
        url: `${baseUrl}/watch/${getSlugFromUrl(anime.link)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 1,
        },
        ...animeLinks,
    ]
}
