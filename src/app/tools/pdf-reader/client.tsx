"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDocument, type PDFDocumentProxy } from "@/lib/pdf-client"
import { PDFPageRenderer } from "@/components/shared/pdf-page-renderer"
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Trash2,
  Maximize,
  RotateCw
} from "lucide-react"
import { toast } from "sonner"

export default function PDFReaderPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [pdfProxy, setPdfProxy] = React.useState<PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [scale, setScale] = React.useState(1.0)
  const [rotation, setRotation] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setFile(droppedFile)
    setIsLoading(true)
    
    try {
      const buffer = await droppedFile.arrayBuffer()
      const loadingTask = getDocument({ data: buffer })
      const pdf = await loadingTask.promise
      setPdfProxy(pdf)
      setCurrentPage(1)
      setScale(1.0)
      setRotation(0)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load PDF.")
    } finally {
      setIsLoading(false)
    }
  }

  const changePage = (delta: number) => {
    if (!pdfProxy) return
    const newPage = currentPage + delta
    if (newPage >= 1 && newPage <= pdfProxy.numPages) {
      setCurrentPage(newPage)
    }
  }

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(0.5, Math.min(3.0, prev + delta)))
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-3.5rem)] py-6 flex flex-col">
       <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            PDF Reader
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Read and navigate PDF documents in your browser.
          </p>
        </div>

        {!pdfProxy ? (
          <div className="mx-auto w-full max-w-3xl">
            <FileDropzone
              onDrop={handleDrop}
              accept={{ "application/pdf": [".pdf"] }}
              maxFiles={1}
              title="Open PDF file"
              description="View and read PDF documents locally."
            />
          </div>
        ) : (
            <div className="flex flex-col flex-1 gap-4 overflow-hidden rounded-xl border bg-muted/20">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background p-2 px-4 shadow-sm">
                    <div className="flex items-center gap-2 max-w-[40%] sm:max-w-none">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                                setFile(null)
                                setPdfProxy(null)
                            }}
                            title="Close File"
                            aria-label="Close File"
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <span className="truncate text-sm font-medium" title={file?.name}>
                            {file?.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => changePage(-1)}
                            disabled={currentPage <= 1}
                            aria-label="Previous Page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1 text-sm">
                            <Input 
                                className="h-7 w-12 px-1 text-center" 
                                value={currentPage}
                                onChange={(e) => {
                                    const page = parseInt(e.target.value)
                                    if (page >= 1 && page <= pdfProxy.numPages) {
                                        setCurrentPage(page)
                                    }
                                }}
                            />
                            <span className="text-muted-foreground whitespace-nowrap hidden sm:inline-block">/ {pdfProxy.numPages}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => changePage(1)}
                            disabled={currentPage >= pdfProxy.numPages}
                            aria-label="Next Page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 ml-auto sm:ml-0">
                        <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => handleZoom(-0.1)} aria-label="Zoom Out">
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm w-12 text-center hidden sm:inline-block">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => handleZoom(0.1)} aria-label="Zoom In">
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => setRotation(r => (r + 90) % 360)} aria-label="Rotate Page">
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Reader Area */}
                <div className="flex-1 overflow-auto bg-muted/10 p-4 flex justify-center">
                    <PDFPageRenderer
                        pdf={pdfProxy}
                        pageNumber={currentPage}
                        scale={scale}
                        rotate={rotation}
                        className="shadow-lg"
                    />
                </div>
            </div>
        )}
    </div>
  )
}
