"use client"

import * as React from "react"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"

// Configure worker - using CDN for simplicity in this setup
// In production, we should probably copy the worker file to public/
if (typeof window !== "undefined" && !GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${"4.10.38"}/build/pdf.worker.min.mjs`
}

interface PDFPagePreviewProps {
  file: File
  pageIndex: number
  rotation: number
  className?: string
  scale?: number
}

export function PDFPagePreview({
  file,
  pageIndex,
  rotation,
  className,
  scale = 1,
}: PDFPagePreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const renderPage = async () => {
      try {
        setLoading(true)
        const buffer = await file.arrayBuffer()
        const loadingTask = getDocument({ data: buffer })
        const pdf = await loadingTask.promise
        const page = await pdf.getPage(pageIndex + 1) // pdfjs is 1-based

        if (!active) return

        const viewport = page.getViewport({ scale: scale, rotation: rotation }) // Apply visual rotation
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport,
        } as any).promise

        setLoading(false)
      } catch (error) {
        console.error("Error rendering page:", error)
        setLoading(false)
      }
    }

    renderPage()

    return () => {
      active = false
    }
  }, [file, pageIndex, rotation, scale])

  return (
    <div className={`relative overflow-hidden rounded-md border bg-background shadow-sm ${className}`}>
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )}
      <canvas ref={canvasRef} className="mx-auto block max-w-full" />
    </div>
  )
}
