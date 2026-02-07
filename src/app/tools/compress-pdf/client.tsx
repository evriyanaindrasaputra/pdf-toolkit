"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { compressPDF } from "@/lib/pdf-client"
import { downloadFile } from "@/lib/pdf-utils"
import { FileText, ArrowRight, Download, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"

const COMPRESSION_LEVELS = {
  low: { label: "Light Compression", quality: 0.8, scale: 1.5, desc: "High quality, less reduction" },
  medium: { label: "Balanced", quality: 0.6, scale: 1.0, desc: "Good quality, good reduction" },
  high: { label: "Strong Compression", quality: 0.4, scale: 0.8, desc: "Low quality, max reduction" },
}

export default function CompressPDFPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [level, setLevel] = React.useState<keyof typeof COMPRESSION_LEVELS>("medium")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [result, setResult] = React.useState<{ blob: Uint8Array; size: number } | null>(null)

  const handleDrop = (files: File[]) => {
    setFile(files[0])
    setResult(null)
  }

  const handleCompress = async () => {
    if (!file) return
    try {
      setIsProcessing(true)
      const { quality, scale } = COMPRESSION_LEVELS[level]
      
      toast.info("Compressing PDF... This might take a moment.")
      // Small delay to allow toast to render before main thread blocks
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const compressedBytes = await compressPDF(file, quality, scale)
      setResult({
        blob: compressedBytes,
        size: compressedBytes.byteLength
      })
      toast.success("PDF compressed successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to compress PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB"
  }

  const getSavings = () => {
    if (!file || !result) return 0
    return Math.round(((file.size - result.size) / file.size) * 100)
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Compress PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Reduce file size while optimizing for quality.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop PDF to compress"
            description="Optimize your PDF file size locally. (Max 10MB)"
          />
        ) : !result ? (
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
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Label className="text-base">Compression Level</Label>
                <RadioGroup value={level} onValueChange={(v) => setLevel(v as any)} className="grid gap-4 md:grid-cols-3">
                  {Object.entries(COMPRESSION_LEVELS).map(([key, option]) => (
                    <div key={key}>
                      <RadioGroupItem value={key} id={key} className="peer sr-only" />
                      <Label
                        htmlFor={key}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer text-center h-full"
                      >
                        <span className="font-semibold">{option.label}</span>
                        <span className="text-xs font-normal text-muted-foreground mt-1">
                          {option.desc}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Button 
                size="lg" 
                className="w-full" 
                onClick={handleCompress}
                disabled={isProcessing}
            >
              {isProcessing ? "Compressing..." : "Compress PDF"}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
                Note: This uses a rasterization process which may convert text to images.
            </p>
          </div>
        ) : (
            <div className="space-y-6">
                 <Card className="bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="mx-auto rounded-full bg-green-100 p-3 w-fit dark:bg-green-900">
                             <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Compression Complete!</h2>
                        
                        <div className="flex items-center justify-center gap-4 text-sm">
                            <div className="text-muted-foreground">
                                <p>Original</p>
                                <p className="font-semibold">{formatSize(file.size)}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="text-foreground">
                                <p>Compressed</p>
                                <p className="font-bold text-green-600 dark:text-green-400">{formatSize(result.size)}</p>
                            </div>
                        </div>
                        
                        <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                            Saved {getSavings()}%
                        </div>
                        
                        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
                            <Button 
                                size="lg" 
                                onClick={() => downloadFile(result.blob, `compressed-${file.name}`)}
                            >
                                Download Compressed PDF
                            </Button>
                             <Button variant="outline" size="lg" onClick={() => setResult(null)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Compress Another
                            </Button>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        )}
      </div>
    </div>
  )
}
