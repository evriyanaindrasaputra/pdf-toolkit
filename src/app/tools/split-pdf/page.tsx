"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { splitAllPages, extractPages, downloadFile } from "@/lib/pdf-utils"
import { FileText, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PDFDocument } from "pdf-lib"

export default function SplitPDFPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [pageCount, setPageCount] = React.useState<number>(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [range, setRange] = React.useState("")

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setFile(droppedFile)
    
    // Get page count
    try {
      const buffer = await droppedFile.arrayBuffer()
      const pdf = await PDFDocument.load(buffer)
      setPageCount(pdf.getPageCount())
    } catch (error) {
      console.error(error)
      toast.error("Failed to load PDF info.")
    }
  }

  const parseRange = (rangeStr: string, max: number): number[] => {
    const pages = new Set<number>()
    const parts = rangeStr.split(",")
    
    for (const part of parts) {
      const trimPart = part.trim()
      if (trimPart.includes("-")) {
        const [start, end] = trimPart.split("-").map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= max) pages.add(i - 1)
          }
        }
      } else {
        const page = Number(trimPart)
        if (!isNaN(page) && page >= 1 && page <= max) {
          pages.add(page - 1)
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b)
  }

  const handleSplitAll = async () => {
    if (!file) return
    try {
      setIsProcessing(true)
      const zipBlob = await splitAllPages(file)
      downloadFile(zipBlob, "split-pages.zip", "application/zip")
      toast.success("PDF split successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to split PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExtract = async () => {
    if (!file) return
    try {
      setIsProcessing(true)
      const pageIndices = parseRange(range, pageCount)
      if (pageIndices.length === 0) {
        toast.error("Invalid page range.")
        return
      }
      
      const pdfBytes = await extractPages(file, pageIndices)
      downloadFile(pdfBytes, "extracted.pdf")
      toast.success("Pages extracted successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to extract pages.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Split PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Separate one PDF into individual pages or files.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop your PDF here"
            description="Split PDF into pages or extract specific pages. (Max 10MB)"
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
                      {pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null)
                    setPageCount(0)
                    setRange("")
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Tabs defaultValue="extract" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="extract">Extract Pages</TabsTrigger>
                <TabsTrigger value="split">Split All Pages</TabsTrigger>
              </TabsList>
              <TabsContent value="extract">
                <Card>
                  <CardHeader>
                    <CardTitle>Extract Specific Pages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="range">Page Range</Label>
                      <Input
                        id="range"
                        placeholder="e.g. 1, 3-5, 8"
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter page numbers or ranges separated by commas.
                      </p>
                    </div>
                    <Button 
                        className="w-full" 
                        onClick={handleExtract}
                        disabled={isProcessing || !range}
                    >
                      {isProcessing ? "Extracting..." : "Extract Pages"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="split">
                <Card>
                  <CardHeader>
                    <CardTitle>Split into Single Pages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This will create a ZIP file containing each page as a separate PDF file.
                    </p>
                    <Button 
                        className="w-full" 
                        onClick={handleSplitAll}
                        disabled={isProcessing}
                    >
                      {isProcessing ? "Splitting..." : "Split All Pages"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
