"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getDocument, type PDFDocumentProxy } from "@/lib/pdf-client"
import { watermarkPDF, downloadFile } from "@/lib/pdf-utils"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { WatermarkSettings } from "./watermark-settings"
import { WatermarkPreview } from "./watermark-preview"

export default function InsertWatermarkPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [watermarkType, setWatermarkType] = React.useState<"text" | "image">("text")
  const [text, setText] = React.useState("CONFIDENTIAL")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null)
  const [color, setColor] = React.useState("#ff0000")
  const [opacity, setOpacity] = React.useState(0.5)
  const [rotation, setRotation] = React.useState(45)
  const [size, setSize] = React.useState(50)
  const [applyToAll, setApplyToAll] = React.useState(true)
  
  const [pdfProxy, setPdfProxy] = React.useState<PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [dragPos, setDragPos] = React.useState({ x: 100, y: 100 })
  const containerRef = React.useRef<HTMLDivElement>(null)
  const draggableRef = React.useRef<HTMLDivElement>(null)

  // Cleanup object URL
  React.useEffect(() => {
      if (imageFile) {
          const url = URL.createObjectURL(imageFile)
          setImagePreviewUrl(url)
          return () => URL.revokeObjectURL(url)
      } else {
          setImagePreviewUrl(null)
      }
  }, [imageFile])

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setFile(droppedFile)
    
    try {
        const buffer = await droppedFile.arrayBuffer()
        const loadingTask = getDocument({ data: buffer })
        const pdf = await loadingTask.promise
        setPdfProxy(pdf)
        setCurrentPage(1)
        // Reset drag to center approx
        setDragPos({ x: 200, y: 300 }) 
    } catch (error) {
        console.error(error)
        toast.error("Failed to load PDF.")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setImageFile(e.target.files[0])
          // Reset size for image defaults (width in px/points)
          setSize(100)
      }
  }

  const handleSave = async () => {
    if (!file || !pdfProxy || !containerRef.current) return
    try {
      setIsProcessing(true)
      
      // Calculate coordinates relative to PDF
      const page = await pdfProxy.getPage(currentPage)
      const viewport = page.getViewport({ scale: 1.0 })
      
      const container = containerRef.current
      const canvas = container.querySelector('canvas')
      if (!canvas) throw new Error("Canvas not found")
      
      const displayedWidth = canvas.clientWidth
      const displayedHeight = canvas.clientHeight
      
      const ratioX = viewport.width / displayedWidth
      const ratioY = viewport.height / displayedHeight
      
      const pdfX = dragPos.x * ratioX
      
      // Calculate Height of object for Bottom-Left pivot
      let objectHeight = size 
      
      if (watermarkType === "image" && imageFile) {
          const el = draggableRef.current
          if (el) {
              const innerDiv = el.children[0] as HTMLElement // The inner div with rotation
              const imgEl = innerDiv?.querySelector('img') || el.querySelector('img')
              if (imgEl) {
                  objectHeight = imgEl.offsetHeight
              }
          }
      }
      
      const pivotHtmlY = dragPos.y + objectHeight
      const pdfY = viewport.height - (pivotHtmlY * ratioY)
      
      const content = watermarkType === "image" && imageFile ? imageFile : text
      
      const watermarkedBytes = await watermarkPDF(file, content, {
          type: watermarkType,
          color,
          size, 
          opacity,
          rotation,
          x: pdfX,
          y: pdfY,
          targetPages: applyToAll ? "all" : [currentPage - 1] 
      })
      downloadFile(watermarkedBytes, "watermarked.pdf")
      toast.success("Watermark applied successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to apply watermark.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Insert Watermark
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Add text or image watermarks to your PDF documents.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop PDF to watermark"
            description="Add custom text or image watermarks locally."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-6">
                 <WatermarkPreview 
                    pdfProxy={pdfProxy}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    containerRef={containerRef}
                    draggableRef={draggableRef}
                    dragPos={dragPos}
                    setDragPos={setDragPos}
                    watermarkType={watermarkType}
                    text={text}
                    imageFile={imageFile}
                    imagePreviewUrl={imagePreviewUrl}
                    color={color}
                    opacity={opacity}
                    rotation={rotation}
                    size={size}
                 />
            </div>

            <div className="space-y-6">
                 <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="truncate flex-1 font-medium text-sm pr-2">
                            {file.name}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardContent>
                 </Card>

                 <WatermarkSettings 
                    watermarkType={watermarkType}
                    setWatermarkType={setWatermarkType}
                    text={text}
                    setText={setText}
                    color={color}
                    setColor={setColor}
                    opacity={opacity}
                    setOpacity={setOpacity}
                    rotation={rotation}
                    setRotation={setRotation}
                    size={size}
                    setSize={setSize}
                    applyToAll={applyToAll}
                    setApplyToAll={setApplyToAll}
                    imageFile={imageFile}
                    handleImageUpload={handleImageUpload}
                    handleSave={handleSave}
                    isProcessing={isProcessing}
                 />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
