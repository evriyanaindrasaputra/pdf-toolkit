"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { protectPDF, downloadFile } from "@/lib/pdf-utils"
import { FileText, Lock, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function ProtectPDFPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [password, setPassword] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleDrop = (files: File[]) => {
    setFile(files[0])
  }

  const handleProtect = async () => {
    if (!file || !password) return
    try {
      setIsProcessing(true)
      const protectedBytes = await protectPDF(file, password)
      downloadFile(protectedBytes, `protected-${file.name}`)
      toast.success("PDF protected successfully!")
      setFile(null)
      setPassword("")
    } catch (error) {
      console.error(error)
      toast.error("Failed to protect PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Protect PDF
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Encrypt your PDF with a password.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop PDF to protect"
            description="Add password security to your PDF."
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

                <div className="space-y-2">
                    <Label htmlFor="password">Set Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a strong password"
                    />
                </div>

                <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleProtect}
                    disabled={isProcessing || !password}
                >
                    {isProcessing ? "Protecting..." : (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            Protect PDF
                        </>
                    )}
                </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
