"use client"

import * as React from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { Upload, File, FileType } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps extends Omit<DropzoneOptions, "onDrop"> {
  onDrop: (files: File[]) => void
  className?: string
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  title?: string
  description?: string
}

export function FileDropzone({
  onDrop,
  className,
  accept = { "application/pdf": [".pdf"] },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 1,
  title = "Click to upload or drag and drop",
  description = "PDF (max 10MB)",
  ...props
}: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    ...props,
  })

  const isFileTooLarge = fileRejections.length > 0 && fileRejections[0].errors[0].code === "file-too-large"

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/5 px-6 py-10 text-center transition-all hover:bg-muted/10 hover:border-primary/50",
        isDragActive && "border-primary bg-primary/5",
        isFileTooLarge && "border-destructive bg-destructive/5",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={cn(
          "rounded-full bg-background p-4 shadow-sm ring-1 ring-border transition-transform group-hover:scale-110",
          isDragActive && "animate-bounce"
        )}>
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold tracking-tight text-foreground text-lg">
            {isDragActive ? "Drop files here" : title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
        </div>
        {!isDragActive && (
           <Button variant="secondary" size="lg" className="mt-4 shadow-sm">
             Select Files
           </Button>
        )}
      </div>
      {isFileTooLarge && (
        <p className="mt-4 text-sm font-medium text-destructive animate-pulse">
          File is too large. Max size is {Math.round(maxSize / 1024 / 1024)}MB.
        </p>
      )}
    </div>
  )
}
