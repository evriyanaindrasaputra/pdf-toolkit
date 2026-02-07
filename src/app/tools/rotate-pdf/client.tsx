"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PDFPagePreview } from "@/components/shared/pdf-page-preview"
import { rotatePDF, downloadFile } from "@/lib/pdf-utils"
import { FileText, RotateCw, RotateCcw, Trash2, Save } from "lucide-react"
import { toast } from "sonner"
import { PDFDocument } from "pdf-lib"

export default function RotatePDFPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [pageCount, setPageCount] = React.useState<number>(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [rotations, setRotations] = React.useState<Record<number, number>>({})

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setFile(droppedFile)
    setRotations({})
    
    try {
      const buffer = await droppedFile.arrayBuffer()
      const pdf = await PDFDocument.load(buffer)
      setPageCount(pdf.getPageCount())
    } catch (error) {
      console.error(error)
      toast.error("Failed to load PDF info.")
    }
  }

  const rotatePage = (pageIndex: number, degrees: number) => {
    setRotations((prev) => ({
      ...prev,
      [pageIndex]: (prev[pageIndex] || 0) + degrees,
    }))
  }

  const rotateAll = (degrees: number) => {
    const newRotations = { ...rotations }
    for (let i = 0; i < pageCount; i++) {
      newRotations[i] = (newRotations[i] || 0) + degrees
    }
    setRotations(newRotations)
  }

  const handleSave = async () => {
    if (!file) return
    try {
      setIsProcessing(true)
      const rotatedPdfBytes = await rotatePDF(file, rotations)
      downloadFile(rotatedPdfBytes, "rotated.pdf")
      toast.success("PDF rotated successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to rotate PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Rotate PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Rotate pages clockwise or counter-clockwise.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop your PDF here"
            description="Rotate specific pages or the entire document. (Max 10MB)"
          />
        ) : (
          <div className="space-y-6">
             <Card>
              <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" onClick={() => rotateAll(-90)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Left All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => rotateAll(90)}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Right All
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFile(null)
                      setPageCount(0)
                      setRotations({})
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: pageCount }).map((_, index) => (
                    <div key={index} className="group relative">
                        <div className="overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:ring-2 hover:ring-primary">
                            <PDFPagePreview
                                file={file}
                                pageIndex={index}
                                rotation={rotations[index] || 0}
                                className="aspect-[1/1.4] w-full"
                            />
                        </div>
                         <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                             <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full"
                                onClick={() => rotatePage(index, -90)}
                             >
                                 <RotateCcw className="h-4 w-4" />
                             </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full"
                                onClick={() => rotatePage(index, 90)}
                             >
                                 <RotateCw className="h-4 w-4" />
                             </Button>
                         </div>
                         <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                             Page {index + 1}
                         </div>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-end sticky bottom-6">
                <Button size="lg" onClick={handleSave} disabled={isProcessing} className="shadow-lg">
                    {isProcessing ? "Saving..." : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Apply Changes
                        </>
                    )}
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
