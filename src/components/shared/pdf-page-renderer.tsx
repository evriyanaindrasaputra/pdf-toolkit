"use client"

import * as React from "react"
import type { PDFDocumentProxy } from "@/lib/pdf-client"

interface PDFPageRendererProps {
  pdf: PDFDocumentProxy
  pageNumber: number // 1-based
  scale?: number
  className?: string
  rotate?: number
  children?: React.ReactNode
  onRenderSuccess?: (viewport: any) => void
}

export function PDFPageRenderer({
  pdf,
  pageNumber,
  scale = 1,
  className,
  rotate = 0,
  children,
  onRenderSuccess,
}: PDFPageRendererProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = React.useState(true)
  const [viewport, setViewport] = React.useState<any>(null)

  React.useEffect(() => {
    let active = true

    const renderPage = async () => {
      try {
        setLoading(true)
        const page = await pdf.getPage(pageNumber)

        if (!active) return

        const vp = page.getViewport({ scale, rotation: rotate })
        setViewport(vp)
        if (onRenderSuccess) onRenderSuccess(vp)

        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        canvas.height = vp.height
        canvas.width = vp.width

        await page.render({
          canvasContext: context,
          viewport: vp,
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
  }, [pdf, pageNumber, scale, rotate]) // Removed onRenderSuccess from deps to avoid loop if unstable

  return (
    <div 
        className={`relative ${className}`} 
        style={viewport ? { width: viewport.width, height: viewport.height } : undefined}
    >
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                 <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )}
      <canvas ref={canvasRef} className="block shadow-md" />
      {viewport && !loading && (
          <div className="absolute inset-0 z-0">
              {children}
          </div>
      )}
    </div>
  )
}
