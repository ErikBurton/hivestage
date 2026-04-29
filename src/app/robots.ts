import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/dashboard/band', '/dashboard/venue', '/dashboard/events/'],
    },
    sitemap: 'https://www.hivestage.live/sitemap.xml',
  }
}