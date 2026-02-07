"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { imagesToPDF, downloadFile } from "@/lib/pdf-utils"
import { ArrowDown, ArrowUp, Image as ImageIcon, Trash2, Settings } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function JpgToPdfPage() {
  const [files, setFiles] = React.useState<File[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [pageSize, setPageSize] = React.useState<"fit" | "a4">("fit")

  const handleDrop = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const moveFile = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === files.length - 1)
    ) {
      return
    }

    setFiles((prev) => {
      const newFiles = [...prev]
      const newIndex = direction === "up" ? index - 1 : index + 1
      ;[newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]]
      return newFiles
    })
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    try {
      setIsProcessing(true)
      const pdfBytes = await imagesToPDF(files, pageSize)
      downloadFile(pdfBytes, "images.pdf")
      toast.success("PDF created successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create PDF. Ensure images are valid JPG/PNG.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            JPG to PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Convert JPG and PNG images to PDF documents.
          </p>
        </div>

        {files.length === 0 ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
            maxFiles={20}
            title="Drop images here"
            description="Convert multiple images to a single PDF. (JPG, PNG)"
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                     <Card>
                        <CardContent className="p-4">
                            <ul className="space-y-3">
                            {files.map((file, index) => (
                                <li
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between rounded-md border p-3 shadow-sm bg-background"
                                >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="rounded bg-muted p-1">
                                       {/* Simple preview if possible, otherwise icon */}
                                       <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div className="truncate">
                                    <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => moveFile(index, "up")}
                                    disabled={index === 0}
                                    title="Move Up"
                                    className="h-8 w-8"
                                    >
                                    <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => moveFile(index, "down")}
                                    disabled={index === files.length - 1}
                                    title="Move Down"
                                    className="h-8 w-8"
                                    >
                                    <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFile(index)}
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    title="Remove"
                                    >
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                </li>
                            ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <div className="flex justify-between">
                         <Button
                            variant="outline"
                            onClick={() => setFiles([])}
                            disabled={isProcessing}
                        >
                            Clear All
                        </Button>
                         <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg, image/png"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                onChange={(e) => {
                                if (e.target.files) {
                                    handleDrop(Array.from(e.target.files))
                                }
                                }}
                            />
                            <Button variant="secondary">
                                Add more images
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 font-semibold">
                                <Settings className="h-4 w-4" />
                                Options
                            </div>
                            <div className="space-y-3">
                                <Label>Page Size</Label>
                                <RadioGroup value={pageSize} onValueChange={(v) => setPageSize(v as any)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="fit" id="fit" />
                                        <Label htmlFor="fit">Fit to Image (Original Size)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="a4" id="a4" />
                                        <Label htmlFor="a4">A4 (with margins)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            
                            <Button 
                                className="w-full" 
                                size="lg"
                                onClick={handleConvert}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Creating PDF..." : "Convert to PDF"}
                            </Button>
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
