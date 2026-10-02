import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/login',
    },
    sitemap: 'https://www.gradient365.com/sitemap.xml',
    host: 'https://www.gradient365.com',
  }
}
