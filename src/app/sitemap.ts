import { MetadataRoute } from 'next'

const tools = [
  "merge-pdf",
  "split-pdf",
  "rotate-pdf",
  "compress-pdf",
  "pdf-to-word",
  "jpg-to-pdf",
  "pdf-to-form",
  "ocr-pdf",
  "sign-pdf",
  "insert-watermark",
  "remove-watermark",
  "protect-pdf",
  "unprotect-pdf",
  "pdf-reader",
  "rsvp-reader"
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pdf-toolkit.vercel.app'
  
  const toolRoutes = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...toolRoutes,
  ]
}
