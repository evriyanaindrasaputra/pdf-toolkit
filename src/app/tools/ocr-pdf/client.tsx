"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { pdfToImages } from "@/lib/pdf-client"
import { FileText, RefreshCw, Trash2, Copy, Download, ScanText } from "lucide-react"
import { toast } from "sonner"
import Tesseract from "tesseract.js"

export default function OcrPdfPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [status, setStatus] = React.useState("")
  const [resultText, setResultText] = React.useState("")

  const handleDrop = (files: File[]) => {
    setFile(files[0])
    setResultText("")
    setProgress(0)
    setStatus("")
  }

  const handleOCR = async () => {
    if (!file) return
    try {
      setIsProcessing(true)
      setStatus("Converting PDF to images...")
      setProgress(5)
      
      const images = await pdfToImages(file, 2) // Scale 2 for better OCR
      
      let combinedText = ""
      const totalSteps = images.length
      
      for (let i = 0; i < images.length; i++) {
        setStatus(`Recognizing text on page ${i + 1} of ${totalSteps}...`)
        
        const { data: { text } } = await Tesseract.recognize(
          images[i],
          'eng',
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                // Approximate progress within page
                const stepProgress = m.progress * (100 / totalSteps)
                const baseProgress = (i / totalSteps) * 100
                // Don't update state too often
              }
            }
          }
        )
        
        combinedText += `--- Page ${i + 1} ---\n\n${text}\n\n`
        setProgress(((i + 1) / totalSteps) * 100)
      }
      
      setResultText(combinedText)
      toast.success("OCR completed!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to extract text.")
    } finally {
      setIsProcessing(false)
      setStatus("")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultText)
    toast.success("Copied to clipboard")
  }

  const downloadText = () => {
    const blob = new Blob([resultText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${file?.name.replace('.pdf', '')}-ocr.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Already cleaning up, good.
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            OCR PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Extract text from scanned documents using OCR.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop scanned PDF"
            description="Convert scanned images to editable text."
          />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {!resultText && (
                <div className="space-y-4">
                    {isProcessing && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{status}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    )}
                    
                    <Button 
                        size="lg" 
                        className="w-full" 
                        onClick={handleOCR}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Processing..." : (
                            <>
                                <ScanText className="mr-2 h-4 w-4" />
                                Start OCR
                            </>
                        )}
                    </Button>
                </div>
            )}

            {resultText && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Extracted Text</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                            </Button>
                            <Button variant="outline" size="sm" onClick={downloadText}>
                                <Download className="mr-2 h-4 w-4" />
                                Download .txt
                            </Button>
                        </div>
                    </div>
                    <Textarea 
                        value={resultText} 
                        readOnly 
                        className="min-h-[400px] font-mono text-sm"
                    />
                     <Button variant="ghost" onClick={() => {
                        setResultText("")
                        setProgress(0)
                     }}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Start Over
                    </Button>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
