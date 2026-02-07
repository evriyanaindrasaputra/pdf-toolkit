"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { unprotectPDF, downloadFile } from "@/lib/pdf-utils"
import { FileText, Unlock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PDFDocument } from "pdf-lib"

export default function UnprotectPDFPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [password, setPassword] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [needsPassword, setNeedsPassword] = React.useState(false)

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setFile(droppedFile)
    setNeedsPassword(false)
    setPassword("")
    
    // Check if encrypted
    try {
        const buffer = await droppedFile.arrayBuffer()
        await PDFDocument.load(buffer)
        // If successful, it's NOT encrypted (or has empty password)
        toast.info("This PDF is not password protected.")
        // Maybe allow removing owner password if user password is empty?
        // But usually unprotect means removing KNOWN password.
    } catch (error) {
        // Assume error means password needed (or invalid PDF)
        // pdf-lib error message for password is usually specific but let's assume worst case
        setNeedsPassword(true)
    }
  }

  const handleUnprotect = async () => {
    if (!file || !password) return
    try {
      setIsProcessing(true)
      const unprotectedBytes = await unprotectPDF(file, password)
      downloadFile(unprotectedBytes, `unlocked-${file.name}`)
      toast.success("PDF unlocked successfully!")
      setFile(null)
      setPassword("")
      setNeedsPassword(false)
    } catch (error) {
      console.error(error)
      toast.error("Incorrect password or failed to unlock.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Unprotect PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Remove password protection from your PDF.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop protected PDF"
            description="Remove security restrictions."
          />
        ) : (
          <Card>
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between rounded-md border p-3 shadow-sm bg-muted/20">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                        <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {needsPassword ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Enter Password to Unlock</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                        </div>

                        <Button 
                            className="w-full" 
                            size="lg"
                            onClick={handleUnprotect}
                            disabled={isProcessing || !password}
                        >
                            {isProcessing ? "Unlocking..." : (
                                <>
                                    <Unlock className="mr-2 h-4 w-4" />
                                    Unlock PDF
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        File is not password protected.
                        <Button 
                            variant="link" 
                            onClick={() => setFile(null)}
                            className="block mx-auto mt-2"
                        >
                            Try another file
                        </Button>
                    </div>
                )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
