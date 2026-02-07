"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { extractFormFields } from "@/lib/pdf-utils"
import { FileInput, FileText, Trash2, Copy, Download, Code } from "lucide-react"
import { toast } from "sonner"

type FormField = {
  name: string
  type: "text" | "checkbox" | "radio" | "dropdown" | "optionlist" | "unknown"
  value?: string | boolean | string[]
  options?: string[]
}

export default function PdfToFormPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [fields, setFields] = React.useState<FormField[]>([])
  const [showCode, setShowCode] = React.useState(false)

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setFile(droppedFile)
    setFields([])
    setShowCode(false)
    
    try {
      setIsProcessing(true)
      const extractedFields = await extractFormFields(droppedFile)
      
      if (extractedFields.length === 0) {
        toast.warning("No form fields found in this PDF.")
      } else {
        setFields(extractedFields as FormField[])
        toast.success(`Found ${extractedFields.length} form fields!`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to extract form fields.")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateHTML = () => {
    let html = `<form>\n`
    
    fields.forEach(field => {
      html += `  <div class="form-group">\n`
      html += `    <label for="${field.name}">${field.name}</label>\n`
      
      if (field.type === "text") {
        html += `    <input type="text" id="${field.name}" name="${field.name}" value="${field.value || ''}" />\n`
      } else if (field.type === "checkbox") {
        html += `    <input type="checkbox" id="${field.name}" name="${field.name}" ${field.value ? 'checked' : ''} />\n`
      } else if (field.type === "radio" && field.options) {
        field.options.forEach(opt => {
          html += `    <div>\n`
          html += `      <input type="radio" id="${field.name}-${opt}" name="${field.name}" value="${opt}" ${field.value === opt ? 'checked' : ''} />\n`
          html += `      <label for="${field.name}-${opt}">${opt}</label>\n`
          html += `    </div>\n`
        })
      } else if (field.type === "dropdown" && field.options) {
        html += `    <select id="${field.name}" name="${field.name}">\n`
        field.options.forEach(opt => {
          html += `      <option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>\n`
        })
        html += `    </select>\n`
      }
      
      html += `  </div>\n`
    })
    
    html += `  <button type="submit">Submit</button>\n`
    html += `</form>`
    
    return html
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateHTML())
    toast.success("HTML copied to clipboard!")
  }

  const downloadJSON = () => {
    const json = JSON.stringify(fields, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${file?.name.replace('.pdf', '')}-form.json`
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
            PDF to Form
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Convert fillable PDFs to beautiful web forms.
          </p>
        </div>

        {!file ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Drop fillable PDF"
            description="Extract form fields and generate HTML. (Max 10MB)"
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
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {fields.length} fields found
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {isProcessing ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Analyzing PDF structure...</p>
              </div>
            ) : fields.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Form Preview</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
                        <Code className="mr-2 h-4 w-4" />
                        {showCode ? "Hide Code" : "Show HTML"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadJSON}>
                        <Download className="mr-2 h-4 w-4" />
                        JSON
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {fields.map((field, i) => (
                        <div key={`${field.name}-${i}`} className="space-y-2">
                          <Label htmlFor={field.name}>{field.name}</Label>
                          
                          {field.type === "text" && (
                            <Input 
                              id={field.name} 
                              defaultValue={field.value as string} 
                              placeholder={`Enter ${field.name}...`}
                            />
                          )}
                          
                          {field.type === "checkbox" && (
                            <div className="flex items-center space-x-2">
                              <Checkbox id={field.name} defaultChecked={field.value as boolean} />
                              <label
                                htmlFor={field.name}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {field.name}
                              </label>
                            </div>
                          )}
                          
                          {field.type === "radio" && field.options && (
                            <RadioGroup defaultValue={field.value as string}>
                              {field.options.map((opt) => (
                                <div key={opt} className="flex items-center space-x-2">
                                  <RadioGroupItem value={opt} id={`${field.name}-${opt}`} />
                                  <Label htmlFor={`${field.name}-${opt}`}>{opt}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}
                          
                          {field.type === "dropdown" && field.options && (
                             <Select defaultValue={field.value as string}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}
                      <Button className="w-full">Submit Form</Button>
                    </CardContent>
                  </Card>
                </div>

                {showCode && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Generated HTML</h3>
                      <Button variant="ghost" size="sm" onClick={copyCode}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <Textarea 
                      value={generateHTML()} 
                      readOnly 
                      className="h-[600px] font-mono text-xs bg-muted/50"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  No interactive form fields found in this PDF.
                  <br />
                  Try uploading a PDF with fillable forms.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
