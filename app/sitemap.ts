import { MetadataRoute } from 'next'
import { getAllTemplates } from '@/lib/db/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://store.paing.xyz'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/license`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic template pages
  try {
    const templates = await getAllTemplates()
    const templatePages: MetadataRoute.Sitemap = templates.map((template) => ({
      url: `${baseUrl}/templates/${template.slug}`,
      lastModified: template.updatedAt ? new Date(template.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: template.featured ? 0.9 : 0.8,
    }))

    return [...staticPages, ...templatePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages only if templates fail to load
    return staticPages
  }
}

