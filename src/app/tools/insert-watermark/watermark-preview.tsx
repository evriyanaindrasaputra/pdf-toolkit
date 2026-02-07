import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PDFPageRenderer } from "@/components/shared/pdf-page-renderer"
import Draggable from 'react-draggable'
import type { PDFDocumentProxy } from "@/lib/pdf-client"

interface WatermarkPreviewProps {
  pdfProxy: PDFDocumentProxy | null
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  containerRef: React.RefObject<HTMLDivElement | null>
  draggableRef: React.RefObject<any>
  dragPos: { x: number, y: number }
  setDragPos: React.Dispatch<React.SetStateAction<{ x: number, y: number }>>
  watermarkType: "text" | "image"
  text: string
  imageFile: File | null
  imagePreviewUrl: string | null
  color: string
  opacity: number
  rotation: number
  size: number
}

export function WatermarkPreview({
  pdfProxy,
  currentPage,
  setCurrentPage,
  containerRef,
  draggableRef,
  dragPos,
  setDragPos,
  watermarkType,
  text,
  imageFile,
  imagePreviewUrl,
  color,
  opacity,
  rotation,
  size
}: WatermarkPreviewProps) {
  return (
    <Card className="overflow-hidden bg-muted/20">
      <CardContent className="p-0 flex items-center justify-center min-h-[500px] relative">
        {pdfProxy ? (
          <div className="relative inline-block shadow-lg my-8" ref={containerRef}>
            <PDFPageRenderer
              pdf={pdfProxy}
              pageNumber={currentPage}
            />
            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
              <Draggable
                bounds="parent"
                position={dragPos}
                onDrag={(e, data) => setDragPos({ x: data.x, y: data.y })}
                nodeRef={draggableRef}
              >
                <div
                  ref={draggableRef}
                  className="absolute cursor-move origin-bottom-left select-none pointer-events-auto"
                >
                  <div
                    style={{
                      opacity: opacity,
                      transform: `rotate(${-rotation}deg)`,
                      transformOrigin: 'bottom left',
                      // For Text
                      color: watermarkType === "text" ? color : undefined,
                      fontSize: watermarkType === "text" ? `${size}px` : undefined,
                      fontWeight: 'bold',
                      fontFamily: 'Helvetica, sans-serif',
                      border: '1px dashed rgba(0,0,0,0.2)',
                      // For Image
                      width: watermarkType === "image" ? `${size}px` : undefined,
                      display: 'inline-block'
                    }}
                  >
                    {watermarkType === "text" ? (
                      <span className="whitespace-nowrap">{text}</span>
                    ) : (
                      imageFile && imagePreviewUrl ? (
                        <img
                          src={imagePreviewUrl}
                          alt="watermark"
                          className="w-full h-auto pointer-events-none"
                        />
                      ) : (
                        <div className="bg-muted/50 p-2 text-xs border rounded">Select Image</div>
                      )
                    )}
                  </div>
                </div>
              </Draggable>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-medium z-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span>Page {currentPage} of {pdfProxy?.numPages || 1}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCurrentPage(p => Math.min(pdfProxy?.numPages || 1, p + 1))}
            disabled={!pdfProxy || currentPage >= pdfProxy.numPages}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
