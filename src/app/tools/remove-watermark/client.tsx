"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { removeWatermark, downloadFile } from "@/lib/pdf-utils"
import { getDocument, type PDFDocumentProxy } from "@/lib/pdf-client"
import { PDFPageRenderer } from "@/components/shared/pdf-page-renderer"
import { Eraser, Trash2, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import Draggable from 'react-draggable'

export default function RemoveWatermarkPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [pdfProxy, setPdfProxy] = React.useState<PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isProcessing, setIsProcessing] = React.useState(false)
  
  // Selection state
  const [selection, setSelection] = React.useState<{x: number, y: number, width: number, height: number} | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  // Draggable state
  const [dragPos, setDragPos] = React.useState({ x: 100, y: 100 })
  const [boxSize, setBoxSize] = React.useState({ width: 200, height: 100 })
  const draggableRef = React.useRef(null)

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setFile(droppedFile)
    
    try {
      const buffer = await droppedFile.arrayBuffer()
      const loadingTask = getDocument({ data: buffer })
      const pdf = await loadingTask.promise
      setPdfProxy(pdf)
      setCurrentPage(1)
      setSelection(null)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load PDF.")
    }
  }

  const handleApply = async (applyToAll: boolean) => {
    if (!file || !selection) return
    
    try {
      setIsProcessing(true)
      toast.info("Removing watermark...")
      
      const regions = []
      
      if (applyToAll && pdfProxy) {
        for (let i = 0; i < pdfProxy.numPages; i++) {
          regions.push({ ...selection, pageIndex: i })
        }
      } else {
        regions.push({ ...selection, pageIndex: currentPage - 1 })
      }
      
      const modifiedPdfBytes = await removeWatermark(file, regions)
      downloadFile(modifiedPdfBytes, "clean.pdf")
      toast.success("Watermark removed successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to remove watermark.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate coordinates relative to the PDF page
  const updateSelection = () => {
    if (!containerRef.current || !pdfProxy) return
    
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    
    // Get the actual rendered size of the canvas/page
    const canvas = container.querySelector('canvas')
    if (!canvas) return
    
    const scaleX = canvas.width / canvas.clientWidth // Internal resolution vs displayed size
    const scaleY = canvas.height / canvas.clientHeight
    
    // We need to map the drag box (displayed pixels) to PDF coordinates (points)
    // This is tricky because PDFPageRenderer scales the PDF to fit width.
    // However, removeWatermark expects PDF points (default 72 DPI).
    // The PDFPageRenderer uses pdfjs which renders at a certain viewport scale.
    // We need to normalize.
    
    // Simplification: We assume the PDFPageRenderer renders the full page content.
    // We need the original PDF page size to map correctly.
    
    // Let's get page size from pdfProxy
    pdfProxy.getPage(currentPage).then(page => {
        const viewport = page.getViewport({ scale: 1.0 }) // Original size in points
        
        // displayed width/height of the PDF image
        const displayedWidth = canvas.clientWidth
        const displayedHeight = canvas.clientHeight
        
        // Ratio of Original PDF Points / Displayed Pixels
        const ratioX = viewport.width / displayedWidth
        const ratioY = viewport.height / displayedHeight
        
        // Calculate position relative to the container/image
        // The draggable is inside the container, so x/y are relative to container
        
        // Ensure bounds
        const x = Math.max(0, dragPos.x)
        const y = Math.max(0, dragPos.y)
        const w = boxSize.width
        const h = boxSize.height
        
        // Convert to PDF coordinates
        // PDF coordinates usually start from bottom-left (Cartesian), 
        // BUT pdf-lib drawRectangle uses x,y from bottom-left by default, 
        // HOWEVER, it depends on how we view it.
        // Actually pdf-lib default is bottom-left (0,0).
        // The web view is top-left (0,0).
        // So y needs to be flipped: pdfY = pageHeight - (webY + height)
        
        const pdfX = x * ratioX
        const webY = y // Top-left based
        const pdfY = viewport.height - (webY * ratioY) - (h * ratioY)
        const pdfW = w * ratioX
        const pdfH = h * ratioY
        
        setSelection({
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH
        })
    })
  }
  
  // Update selection whenever drag/resize happens (debounced or on end)
  React.useEffect(() => {
     const timer = setTimeout(updateSelection, 100)
     return () => clearTimeout(timer)
  }, [dragPos, boxSize, currentPage, pdfProxy])


  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Remove Watermark
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Cover and remove watermarks from PDF documents.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop PDF here"
            description="Select area to redact/remove watermark. (Max 10MB)"
          />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Eraser className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Page {currentPage}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setFile(null)}>
                        Cancel
                    </Button>
                     <Button 
                        onClick={() => handleApply(false)} 
                        disabled={isProcessing || !selection}
                    >
                        {isProcessing ? "Processing..." : "Clean Page"}
                    </Button>
                    <Button 
                        variant="default" 
                        onClick={() => handleApply(true)} 
                        disabled={isProcessing || !selection}
                    >
                        Clean All Pages
                    </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Editor Area */}
                <div className="relative rounded-xl border bg-muted/20 p-4 flex justify-center overflow-hidden min-h-[300px] md:min-h-[500px]">
                     {pdfProxy && (
                         <div className="relative inline-block shadow-lg" ref={containerRef}>
                             <PDFPageRenderer
                                pdf={pdfProxy}
                                pageNumber={currentPage}
                                scale={1.0} // Keep it manageable
                                className="pointer-events-none" // Let clicks pass through to draggable? No, draggable is on top
                             />
                             
                             {/* Overlay for Draggable Box */}
                             <div className="absolute inset-0 z-10">
                                 <Draggable
                                    bounds="parent"
                                    defaultPosition={{x: 100, y: 100}}
                                    position={dragPos}
                                    onDrag={(e, data) => setDragPos({x: data.x, y: data.y})}
                                    nodeRef={draggableRef}
                                 >
                                     <div 
                                        ref={draggableRef}
                                        className="cursor-move border-2 border-red-500 bg-red-500/20 absolute flex items-center justify-center group"
                                        style={{ width: boxSize.width, height: boxSize.height }}
                                     >
                                         <span className="text-xs font-bold text-red-600 bg-white/80 px-1 rounded">
                                             Watermark Area
                                         </span>
                                         
                                         {/* Simple Resize Handle (Bottom Right) */}
                                         <div 
                                            className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 cursor-nwse-resize"
                                            onMouseDown={(e) => {
                                                e.stopPropagation() // Prevent drag start
                                                const startX = e.clientX
                                                const startY = e.clientY
                                                const startW = boxSize.width
                                                const startH = boxSize.height
                                                
                                                const onMouseMove = (moveEvent: MouseEvent) => {
                                                    setBoxSize({
                                                        width: Math.max(20, startW + (moveEvent.clientX - startX)),
                                                        height: Math.max(20, startH + (moveEvent.clientY - startY))
                                                    })
                                                }
                                                
                                                const onMouseUp = () => {
                                                    document.removeEventListener('mousemove', onMouseMove)
                                                    document.removeEventListener('mouseup', onMouseUp)
                                                }
                                                
                                                document.addEventListener('mousemove', onMouseMove)
                                                document.addEventListener('mouseup', onMouseUp)
                                            }}
                                         />
                                     </div>
                                 </Draggable>
                             </div>
                         </div>
                     )}
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">Page {currentPage} of {pdfProxy?.numPages}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.min(pdfProxy?.numPages || 1, p + 1))}
                                    disabled={!pdfProxy || currentPage >= pdfProxy.numPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Adjust Box Size</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs">Width</Label>
                                        <Input 
                                            type="number" 
                                            value={boxSize.width} 
                                            onChange={(e) => setBoxSize(s => ({...s, width: parseInt(e.target.value) || 0}))} 
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Height</Label>
                                        <Input 
                                            type="number" 
                                            value={boxSize.height} 
                                            onChange={(e) => setBoxSize(s => ({...s, height: parseInt(e.target.value) || 0}))} 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                                Drag the red box to cover the watermark you want to remove.
                                Use "Clean All Pages" if the watermark is in the same position on every page.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
