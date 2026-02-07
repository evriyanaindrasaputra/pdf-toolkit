"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { pdfToDocx } from "@/lib/pdf-client"
import { downloadFile } from "@/lib/pdf-utils"
import { FileText, ArrowRight, Download, RefreshCw, Trash2, FileType } from "lucide-react"
import { toast } from "sonner"

export default function PdfToWordPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [result, setResult] = React.useState<Blob | null>(null)

  const handleDrop = (files: File[]) => {
    setFile(files[0])
    setResult(null)
  }

  const handleConvert = async () => {
    if (!file) return
    try {
      setIsProcessing(true)
      toast.info("Converting PDF to Word...")
      
      const docxBlob = await pdfToDocx(file)
      setResult(docxBlob)
      toast.success("Conversion successful!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to convert PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            PDF to Word
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Convert PDF documents to editable Word files.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop PDF to convert"
            description="Convert your PDF to DOCX format. (Max 10MB)"
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
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Button 
                size="lg" 
                className="w-full" 
                onClick={handleConvert}
                disabled={isProcessing}
            >
              {isProcessing ? "Converting..." : "Convert to Word"}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
                Note: Formatting may vary. Best for text-heavy documents.
            </p>
          </div>
        ) : (
             <Card className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900">
                <CardContent className="p-8 text-center space-y-4">
                    <div className="mx-auto rounded-full bg-blue-100 p-3 w-fit dark:bg-blue-900">
                            <FileType className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Conversion Complete!</h2>
                    
                    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
                        <Button 
                            size="lg" 
                            onClick={() => downloadFile(result, `${file.name.replace('.pdf', '')}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                        >
                            Download Word Document
                        </Button>
                            <Button variant="outline" size="lg" onClick={() => setResult(null)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Convert Another
                        </Button>
                    </div>
                </CardContent>
                </Card>
        )}
      </div>
    </div>
  )
}
