import type { MetadataRoute } from 'next'

const base = 'https://www.gradient365.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-06-21')
  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/features`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/careers`, lastModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
