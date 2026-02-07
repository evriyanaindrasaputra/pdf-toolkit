import type { PDFDocument as PDFDocumentType } from "pdf-lib"

export type FormField = {
  name: string
  type: "text" | "checkbox" | "radio" | "dropdown" | "optionlist" | "unknown"
  value?: string | boolean | string[]
  options?: string[]
}

export async function extractFormFields(file: File): Promise<FormField[]> {
  const { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } = await import("pdf-lib")
  
  const fileBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })
  const form = pdfDoc.getForm()
  const fields = form.getFields()
  
  return fields.map(field => {
    let type: FormField["type"] = "unknown"
    let value: FormField["value"] = undefined
    let options: string[] | undefined = undefined

    if (field instanceof PDFTextField) {
      type = "text"
      value = field.getText()
    } else if (field instanceof PDFCheckBox) {
      type = "checkbox"
      value = field.isChecked()
    } else if (field instanceof PDFRadioGroup) {
      type = "radio"
      value = field.getSelected()
      options = field.getOptions()
    } else if (field instanceof PDFDropdown) {
      type = "dropdown"
      value = field.getSelected()
      options = field.getOptions()
    } else if (field instanceof PDFOptionList) {
      type = "optionlist"
      value = field.getSelected()
      options = field.getOptions()
    }

    return {
      name: field.getName(),
      type,
      value,
      options
    }
  })
}

export async function removeWatermark(
  file: File, 
  regions: { pageIndex: number, x: number, y: number, width: number, height: number }[]
): Promise<Uint8Array> {
  const { PDFDocument, rgb } = await import("pdf-lib")
  const fileBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(fileBuffer)
  const pages = pdfDoc.getPages()
  
  for (const region of regions) {
    if (region.pageIndex >= 0 && region.pageIndex < pages.length) {
      const page = pages[region.pageIndex]
      
      // Draw a white rectangle over the watermark
      page.drawRectangle({
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        color: rgb(1, 1, 1), // White
        borderColor: rgb(1, 1, 1),
        borderWidth: 0,
      })
    }
  }
  
  return pdfDoc.save()
}

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib")
  const mergedPdf = await PDFDocument.create()

  for (const file of files) {
    const fileBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(fileBuffer)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  return mergedPdf.save()
}

export async function splitAllPages(file: File): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib")
  const JSZip = (await import("jszip")).default
  
  const fileBuffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(fileBuffer)
  const zip = new JSZip()
  const pageCount = pdf.getPageCount()

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create()
    const [copiedPage] = await newPdf.copyPages(pdf, [i])
    newPdf.addPage(copiedPage)
    const pdfBytes = await newPdf.save()
    zip.file(`page-${i + 1}.pdf`, pdfBytes)
  }

  return zip.generateAsync({ type: "blob" })
}

export async function extractPages(file: File, pageIndices: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib")
  const fileBuffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(fileBuffer)
  const newPdf = await PDFDocument.create()
  
  const copiedPages = await newPdf.copyPages(pdf, pageIndices)
  copiedPages.forEach((page) => newPdf.addPage(page))
  
  return newPdf.save()
}

export async function rotatePDF(file: File, rotations: Record<number, number>): Promise<Uint8Array> {
  const { PDFDocument, degrees } = await import("pdf-lib")
  const fileBuffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(fileBuffer)
  const pages = pdf.getPages()
  
  Object.entries(rotations).forEach(([pageIndexStr, rotation]) => {
    const pageIndex = parseInt(pageIndexStr)
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const page = pages[pageIndex]
      const currentRotation = page.getRotation().angle
      page.setRotation(degrees(currentRotation + rotation))
    }
  })
  
  return pdf.save()
}

export async function watermarkPDF(
  file: File, 
  content: string | File, 
  options: {
    type?: "text" | "image",
    color?: string, // hex
    size?: number, // font size for text, width for image (height auto-scaled)
    opacity?: number,
    rotation?: number,
    position?: "center" | "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | "left-center" | "right-center",
    x?: number,
    y?: number,
    targetPages?: "all" | number[]
  } = {}
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib")
  const fileBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  const { 
    type = "text",
    color = "#cccccc", 
    size = 50, 
    opacity = 0.5, 
    rotation = 0,
    position = "center",
    targetPages = "all"
  } = options

  let embeddedImage: any = null
  let imageDims = { width: 0, height: 0 }
  let font: any = null

  if (type === "image" && content instanceof File) {
    const imageBuffer = await content.arrayBuffer()
    if (content.type === "image/png") {
        embeddedImage = await pdfDoc.embedPng(imageBuffer)
    } else {
        embeddedImage = await pdfDoc.embedJpg(imageBuffer)
    }
    const dims = embeddedImage.scale(1)
    const scaleFactor = size / dims.width
    imageDims = { width: size, height: dims.height * scaleFactor }
  } else {
    font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  }

  // Convert hex to rgb (for text)
  const r = parseInt(color.slice(1, 3), 16) / 255
  const g = parseInt(color.slice(3, 5), 16) / 255
  const b = parseInt(color.slice(5, 7), 16) / 255
  const pdfColor = rgb(r, g, b)

  const pages = pdfDoc.getPages()
  
  pages.forEach((page, index) => {
    if (targetPages !== "all" && !targetPages.includes(index)) {
        return
    }

    const { width, height } = page.getSize()
    
    let objectWidth = 0
    let objectHeight = 0

    if (type === "image" && embeddedImage) {
        objectWidth = imageDims.width
        objectHeight = imageDims.height
    } else if (font) {
        objectWidth = font.widthOfTextAtSize(content as string, size)
        objectHeight = font.heightAtSize(size)
    }
    
    let x = (width - objectWidth) / 2
    let y = (height - objectHeight) / 2
    const margin = 20

    if (options.x !== undefined && options.y !== undefined) {
      x = options.x
      y = options.y
    } else {
        switch (position) {
        case "top-left":
            x = margin
            y = height - objectHeight - margin
            break
        case "top-center":
            x = (width - objectWidth) / 2
            y = height - objectHeight - margin
            break
        case "top-right":
            x = width - objectWidth - margin
            y = height - objectHeight - margin
            break
        case "left-center":
            x = margin
            y = (height - objectHeight) / 2
            break
        case "right-center":
            x = width - objectWidth - margin
            y = (height - objectHeight) / 2
            break
        case "bottom-left":
            x = margin
            y = margin
            break
        case "bottom-center":
            x = (width - objectWidth) / 2
            y = margin
            break
        case "bottom-right":
            x = width - objectWidth - margin
            y = margin
            break
        case "center":
        default:
            x = (width - objectWidth) / 2
            y = (height - objectHeight) / 2
            break
        }
    }

    if (type === "image" && embeddedImage) {
        page.drawImage(embeddedImage, {
            x,
            y,
            width: objectWidth,
            height: objectHeight,
            opacity,
            rotate: degrees(rotation),
        })
    } else {
        page.drawText(content as string, {
            x,
            y,
            size,
            font,
            color: pdfColor,
            opacity,
            rotate: degrees(rotation),
        })
    }
  })
  
  return pdfDoc.save()
}

export async function protectPDF(file: File, password: string): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib")
  const fileBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  // Encrypt
  // @ts-ignore - pdf-lib definition mismatch
  pdfDoc.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
    },
  })
  
  return pdfDoc.save()
}

export async function unprotectPDF(file: File, password: string): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib")
  const fileBuffer = await file.arrayBuffer()
  // @ts-ignore - pdf-lib definition mismatch for load options
  const pdfDoc = await PDFDocument.load(fileBuffer, { password })
  return pdfDoc.save()
}

export async function imagesToPDF(files: File[], pageSize: "fit" | "a4" = "fit"): Promise<Uint8Array> {
  const { PDFDocument, PageSizes } = await import("pdf-lib")
  const pdfDoc = await PDFDocument.create()
  
  for (const file of files) {
    const buffer = await file.arrayBuffer()
    let image
    
    // Embed image based on type
    if (file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) {
      image = await pdfDoc.embedJpg(buffer)
    } else if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
      image = await pdfDoc.embedPng(buffer)
    } else {
      continue // Skip unsupported
    }
    
    const { width, height } = image.scale(1)
    
    if (pageSize === "fit") {
      const page = pdfDoc.addPage([width, height])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      })
    } else {
      // A4
      const page = pdfDoc.addPage(PageSizes.A4)
      const { width: pageWidth, height: pageHeight } = page.getSize()
      
      const margin = 20
      const scaleFactor = Math.min((pageWidth - margin * 2) / width, (pageHeight - margin * 2) / height)
      
      const scaledWidth = width * scaleFactor
      const scaledHeight = height * scaleFactor
      
      page.drawImage(image, {
        x: (pageWidth - scaledWidth) / 2,
        y: (pageHeight - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
      })
    }
  }
  
  return pdfDoc.save()
}

export async function signPDF(
  file: File,
  signatures: {
    pageIndex: number
    x: number
    y: number
    width: number
    height: number
    dataUrl: string
  }[]
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib")
  const fileBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(fileBuffer)
  
  for (const sig of signatures) {
    const page = pdfDoc.getPage(sig.pageIndex)
    const image = await pdfDoc.embedPng(sig.dataUrl)
    
    page.drawImage(image, {
      x: sig.x,
      y: sig.y,
      width: sig.width,
      height: sig.height,
    })
  }
  
  return pdfDoc.save()
}

export function downloadFile(data: Uint8Array | Blob, filename: string, type = "application/pdf") {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
