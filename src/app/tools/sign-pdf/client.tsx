"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { getDocument, type PDFDocumentProxy } from "@/lib/pdf-client"
import { PDFPageRenderer } from "@/components/shared/pdf-page-renderer"
import { signPDF, downloadFile } from "@/lib/pdf-utils"
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Trash2,
  PenTool,
  Save,
  X,
  Type
} from "lucide-react"
import { toast } from "sonner"
import SignatureCanvas from "react-signature-canvas"
import Draggable from "react-draggable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Signature {
  id: string
  pageIndex: number // 0-based
  x: number
  y: number
  width: number
  height: number
  dataUrl: string
}

const SignatureItem = ({ 
    sig, 
    scale, 
    updateSignaturePosition, 
    removeSignature 
}: { 
    sig: Signature, 
    scale: number, 
    updateSignaturePosition: (id: string, x: number, y: number) => void, 
    removeSignature: (id: string) => void 
}) => {
    const nodeRef = React.useRef(null)
    
    return (
        <Draggable
            key={`${sig.id}-${scale}`}
            defaultPosition={{x: sig.x * scale, y: sig.y * scale}}
            bounds="parent"
            nodeRef={nodeRef}
            onStop={(e, data) => updateSignaturePosition(sig.id, data.x, data.y)}
        >
            <div 
                ref={nodeRef}
                className="absolute cursor-move group border-2 border-transparent hover:border-primary border-dashed"
                style={{ width: sig.width * scale, height: sig.height * scale }}
            >
                <img 
                    src={sig.dataUrl} 
                    alt="signature" 
                    className="w-full h-full object-contain pointer-events-none" 
                />
                <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-3 -right-3 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSignature(sig.id)}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </Draggable>
    )
}

export default function SignPDFPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [pdfProxy, setPdfProxy] = React.useState<PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [scale, setScale] = React.useState(1.0)
  const [signatures, setSignatures] = React.useState<Signature[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = React.useState(false)
  const [viewport, setViewport] = React.useState<any>(null)
  
  const sigCanvas = React.useRef<SignatureCanvas>(null)

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setFile(droppedFile)
    
    try {
      const buffer = await droppedFile.arrayBuffer()
      const loadingTask = getDocument({ data: buffer })
      const pdf = await loadingTask.promise
      setPdfProxy(pdf)
      setCurrentPage(1)
      setSignatures([])
      setScale(1.0)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load PDF.")
    }
  }

  const changePage = (delta: number) => {
    if (!pdfProxy) return
    const newPage = currentPage + delta
    if (newPage >= 1 && newPage <= pdfProxy.numPages) {
      setCurrentPage(newPage)
    }
  }

  const handleCreateSignature = () => {
    if (sigCanvas.current) {
        if (sigCanvas.current.isEmpty()) {
            toast.warning("Please draw a signature first.")
            return
        }
        const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
        
        // Add to center of current page (approx)
        // We use PDF Points (72 DPI) as the internal coordinate system to be zoom-independent
        // Initial size: 200x100 points
        const width = 200
        const height = 100 
        
        const newSig: Signature = {
            id: Math.random().toString(36).substr(2, 9),
            pageIndex: currentPage - 1,
            x: 50, // Points (Top-Left relative)
            y: 50, // Points (Top-Left relative)
            width, 
            height, 
            dataUrl
        }
        
        setSignatures(prev => [...prev, newSig])
        setIsSignatureDialogOpen(false)
        sigCanvas.current.clear()
    }
  }
  
  const updateSignaturePosition = (id: string, x: number, y: number) => {
      // x, y come in Pixels (screen). Convert to Points.
      setSignatures(prev => prev.map(sig => 
          sig.id === id ? { ...sig, x: x / scale, y: y / scale } : sig
      ))
  }
  
  const removeSignature = (id: string) => {
      setSignatures(prev => prev.filter(sig => sig.id !== id))
  }

  const handleSave = async () => {
    if (!file || signatures.length === 0 || !pdfProxy) return
    
    try {
      setIsProcessing(true)
      
      // We need page height in Points to flip the Y coordinate
      // We can get it from the PDF proxy for each page
      
      const pdfSignatures = []
      
      for (const sig of signatures) {
          const page = await pdfProxy.getPage(sig.pageIndex + 1)
          const viewport = page.getViewport({ scale: 1.0 }) // Get unscaled viewport (Points)
          
          // Convert Top-Left Points to Bottom-Left Points (PDF standard)
          // pdfY = pageHeight - y - height
          const pdfY = viewport.height - sig.y - sig.height
          
          pdfSignatures.push({
             ...sig,
             x: sig.x,
             y: pdfY,
             // width/height are already in points
          })
      }
      
      const signedPdfBytes = await signPDF(file, pdfSignatures)
      downloadFile(signedPdfBytes, "signed.pdf")
      toast.success("Signed PDF saved!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to sign PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-3.5rem)] py-6 flex flex-col">
       <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Sign PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Add electronic signatures to your PDF documents.
          </p>
        </div>

        {!pdfProxy ? (
          <div className="mx-auto w-full max-w-3xl">
            <FileDropzone
              onDrop={handleDrop}
              accept={{ "application/pdf": [".pdf"] }}
              maxFiles={1}
              title="Open PDF to Sign"
              description="Securely sign your PDF locally."
            />
          </div>
        ) : (
            <div className="flex flex-col flex-1 gap-4 overflow-hidden rounded-xl border bg-muted/20">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background p-2 px-4 shadow-sm">
                    <div className="flex items-center gap-2">
                         <Button 
                            variant="default"
                            size="sm"
                            onClick={() => setIsSignatureDialogOpen(true)}
                        >
                            <PenTool className="mr-2 h-4 w-4" />
                            Add Signature
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => changePage(-1)}
                            disabled={currentPage <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm px-2">
                             {currentPage} / {pdfProxy.numPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => changePage(1)}
                            disabled={currentPage >= pdfProxy.numPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm w-12 text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.1))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSave} 
                            disabled={isProcessing || signatures.length === 0}
                            className="ml-2"
                        >
                             {isProcessing ? "Saving..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Download
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Reader Area */}
                <div className="flex-1 overflow-auto bg-muted/10 p-4 flex justify-center relative">
                    <PDFPageRenderer
                        pdf={pdfProxy}
                        pageNumber={currentPage}
                        scale={scale}
                        className="shadow-lg border bg-white"
                        onRenderSuccess={setViewport}
                    >
                        {signatures
                            .filter(s => s.pageIndex === currentPage - 1)
                            .map(sig => (
                                <SignatureItem 
                                    key={sig.id}
                                    sig={sig}
                                    scale={scale}
                                    updateSignaturePosition={updateSignaturePosition}
                                    removeSignature={removeSignature}
                                />
                            ))}
                    </PDFPageRenderer>
                </div>
            </div>
        )}
        
        <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Draw Signature</DialogTitle>
                </DialogHeader>
                <div className="border rounded-md bg-white h-[200px] w-full relative">
                     <SignatureCanvas 
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{className: "absolute inset-0 w-full h-full"}}
                     />
                     <div className="absolute top-2 right-2 text-xs text-muted-foreground pointer-events-none">
                        Sign here
                     </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => sigCanvas.current?.clear()}>
                        Clear
                    </Button>
                    <Button onClick={handleCreateSignature}>
                        Add Signature
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
