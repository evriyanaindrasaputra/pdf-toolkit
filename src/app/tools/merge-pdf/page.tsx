"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mergePDFs, downloadFile } from "@/lib/pdf-utils"
import { ArrowDown, ArrowUp, FileText, Trash2, X } from "lucide-react"
import { toast } from "sonner"

export default function MergePDFPage() {
  const [files, setFiles] = React.useState<File[]>([])
  const [isMerging, setIsMerging] = React.useState(false)

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

  const handleMerge = async () => {
    if (files.length === 0) return

    try {
      setIsMerging(true)
      const mergedPdfBytes = await mergePDFs(files)
      downloadFile(mergedPdfBytes, "merged.pdf")
      toast.success("PDFs merged successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to merge PDFs. Please try again.")
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Merge PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Combine multiple PDFs into one unified document.
          </p>
        </div>

        {files.length === 0 ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={10}
            title="Drop your PDFs here"
            description="Combine multiple PDFs into one. (Max 10MB each)"
          />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-md border p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2 shrink-0">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveFile(index, "up")}
                          disabled={index === 0}
                          title="Move Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveFile(index, "down")}
                          disabled={index === files.length - 1}
                          title="Move Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                disabled={isMerging}
                className="w-full sm:w-auto"
              >
                Clear All
              </Button>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleDrop(Array.from(e.target.files))
                      }
                    }}
                  />
                   <Button variant="secondary" className="w-full sm:w-auto">
                    Add more PDFs
                  </Button>
                </div>
                
                <Button
                  onClick={handleMerge}
                  disabled={isMerging}
                  className="w-full sm:w-auto"
                >
                  {isMerging ? "Merging..." : "Merge PDF"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
