"use client"

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist"
import type { TextItem } from "pdfjs-dist/types/src/display/api"
import type { Paragraph } from "docx"

// Initialize worker
if (typeof window !== "undefined" && !GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`
}


export { getDocument }
export type { PDFDocumentProxy, PDFPageProxy }

export async function extractTextFromPDF(pdf: PDFDocumentProxy): Promise<string[]> {
  const textArray: string[] = []
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => (item as TextItem).str)
      .join(" ")
    textArray.push(pageText)
  }
  
  // Split into words, cleaning up extra spaces
  return textArray
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
}

export async function pdfToDocx(file: File): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx")
  const buffer = await file.arrayBuffer()
  const loadingTask = getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  
  const children: Paragraph[] = []
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    
    // Simple text extraction - preserving lines
    let lastY = -1
    let currentLineText = ""
    
    // Sort items by Y (descending) then X (ascending) - roughly
    const items = textContent.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      hasEOL: item.hasEOL
    })).sort((a, b) => {
      if (Math.abs(a.y - b.y) > 5) return b.y - a.y // Different lines
      return a.x - b.x // Same line
    })

    items.forEach((item) => {
        // If Y changed significantly, it's a new line
        if (lastY !== -1 && Math.abs(item.y - lastY) > 10) {
            if (currentLineText.trim()) {
                children.push(new Paragraph({
                    children: [new TextRun(currentLineText)]
                }))
            }
            currentLineText = ""
        }
        
        currentLineText += item.str + " " // Add space between words
        lastY = item.y
    })
    
    // Add last line
    if (currentLineText.trim()) {
        children.push(new Paragraph({
             children: [new TextRun(currentLineText)]
        }))
    }
    
    // Add page break if not last page
    if (i < pdf.numPages) {
         children.push(new Paragraph({
             children: [new TextRun({ break: 1 })] // Simple break, docx supports PageBreak but TextRun break is easier for now
         }))
    }
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  })
  
  return Packer.toBlob(doc)
}

export async function compressPDF(
  file: File, 
  quality = 0.7, 
  scale = 1
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib")
  const buffer = await file.arrayBuffer()
  const loadingTask = getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  
  const newPdf = await PDFDocument.create()
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    
    // Create canvas
    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext("2d")
    
    if (!context) throw new Error("Canvas context not available")
    
    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    } as any).promise
    
    // Convert to JPEG
    const imgDataUrl = canvas.toDataURL("image/jpeg", quality)
    const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer())
    
    // Embed in new PDF
    const jpgImage = await newPdf.embedJpg(imgBytes)
    const newPage = newPdf.addPage([viewport.width, viewport.height])
    newPage.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    })
  }
  
  return newPdf.save()
}

export async function pdfToImages(file: File, scale = 2): Promise<Blob[]> {
  const buffer = await file.arrayBuffer()
  const loadingTask = getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  const images: Blob[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext("2d")
    
    if (!context) continue
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    } as any).promise
    
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (blob) images.push(blob)
  }
  return images
}
