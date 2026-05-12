import { MetadataRoute } from 'next'
import { getLatestVideos } from '@/lib/jav'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { videos } = await getLatestVideos()
    const baseUrl = 'https://cuanflix.site' 

    const videoLinks = videos.map((video) => ({
        url: `${baseUrl}/watch/${video.href}`,
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
        ...videoLinks,
    ]
}
