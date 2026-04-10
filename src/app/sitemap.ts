import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: bands } = await supabase
    .from('bands')
    .select('id, created_at')

  const { data: venues } = await supabase
    .from('venues')
    .select('id, created_at')

  const bandUrls = bands?.map(band => ({
    url: `https://www.hivestage.live/bands/${band.id}`,
    lastModified: new Date(band.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || []

  const venueUrls = venues?.map(venue => ({
    url: `https://www.hivestage.live/venues/${venue.id}`,
    lastModified: new Date(venue.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || []

  return [
    {
      url: 'https://www.hivestage.live',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.hivestage.live/events',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.hivestage.live/signup',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...bandUrls,
    ...venueUrls,
  ]
}