import {
  FileStack,
  Split,
  RotateCw,
  BookOpen,
  Eye,
  Minimize2,
  FileType,
  Image,
  FileInput,
  PenTool,
  Stamp,
  Eraser,
  Lock,
  Unlock,
  ScanText,
  ShieldCheck,
  Zap,
  Layout,
  Pencil
} from "lucide-react"
import { ToolCard } from "@/components/shared/tool-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const categories = [
  {
    title: "Organize & Optimize",
    description: "Manage your PDF structure and file size.",
    icon: Layout,
    tools: [
      {
        title: "Merge PDF",
        description: "Combine multiple PDFs into one unified document.",
        href: "/tools/merge-pdf",
        icon: FileStack,
      },
      {
        title: "Split PDF",
        description: "Separate one PDF into individual pages or files.",
        href: "/tools/split-pdf",
        icon: Split,
      },
      {
        title: "Rotate PDF",
        description: "Rotate pages clockwise or counter-clockwise.",
        href: "/tools/rotate-pdf",
        icon: RotateCw,
      },
      {
        title: "Compress PDF",
        description: "Reduce file size while optimizing for quality.",
        href: "/tools/compress-pdf",
        icon: Minimize2,
      },
    ]
  },
  {
    title: "Convert",
    description: "Transform PDFs to other formats and vice versa.",
    icon: Zap,
    tools: [
      {
        title: "PDF to Word",
        description: "Convert PDF documents to editable Word files.",
        href: "/tools/pdf-to-word",
        icon: FileType,
      },
      {
        title: "JPG to PDF",
        description: "Convert JPG and PNG images to PDF documents.",
        href: "/tools/jpg-to-pdf",
        icon: Image,
      },
      {
        title: "PDF to Form",
        description: "Convert fillable PDFs to beautiful web forms.",
        href: "/tools/pdf-to-form",
        icon: FileInput,
      },
      {
        title: "OCR PDF",
        description: "Extract text from scanned documents using OCR.",
        href: "/tools/ocr-pdf",
        icon: ScanText,
      },
    ]
  },
  {
    title: "Edit & Sign",
    description: "Add content, signatures, or remove marks.",
    icon: Pencil,
    tools: [
      {
        title: "Sign PDF",
        description: "Add electronic signatures to your PDF documents.",
        href: "/tools/sign-pdf",
        icon: PenTool,
      },
      {
        title: "Insert Watermark",
        description: "Add text, image, or pattern watermarks.",
        href: "/tools/insert-watermark",
        icon: Stamp,
      },
      {
        title: "Remove Watermark",
        description: "Detect and remove watermarks from PDFs.",
        href: "/tools/remove-watermark",
        icon: Eraser,
      },
    ]
  },
  {
    title: "Security",
    description: "Protect and secure your sensitive documents.",
    icon: ShieldCheck,
    tools: [
      {
        title: "Protect PDF",
        description: "Encrypt your PDF with a password.",
        href: "/tools/protect-pdf",
        icon: Lock,
      },
      {
        title: "Unprotect PDF",
        description: "Remove password protection from your PDF.",
        href: "/tools/unprotect-pdf",
        icon: Unlock,
      },
    ]
  },
  {
    title: "View",
    description: "Read and analyze PDF content.",
    icon: BookOpen,
    tools: [
      {
        title: "PDF Reader",
        description: "Read and navigate PDF documents in your browser.",
        href: "/tools/pdf-reader",
        icon: BookOpen,
      },
      {
        title: "Speed Reader",
        description: "Speed read PDFs using RSVP technology.",
        href: "/tools/rsvp-reader",
        icon: Eye,
      },
    ]
  }
]

export default function Home() {
  return (
    <div className="relative min-h-screen">
       {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container px-4 mx-auto text-center">
          <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            100% Client-Side • Privacy First • Open Source
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
             Master Your PDFs <br className="hidden md:block" />
             <span className="text-primary">Without Uploading</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
            All the tools you need to manage your documents. 
            Merge, compress, convert, and sign directly in your browser. 
            Your files never leave your device.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105" asChild>
              <Link href="#tools">Explore Tools</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full backdrop-blur-sm hover:bg-muted/50" asChild>
              <Link href="https://github.com/evriyanaindrasaputra/pdf-toolkit" target="_blank">View on GitHub</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="container py-16 space-y-24 max-w-6xl mx-auto">
        {categories.map((category) => (
          <div key={category.title} className="space-y-8">
            <div className="flex flex-col items-center text-center gap-2 border-b border-border/50 pb-8">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2 ring-1 ring-primary/20">
                <category.icon className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">{category.title}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">{category.description}</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.tools.map((tool) => (
                <div key={tool.href} className="w-full">
                   <ToolCard {...tool} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      
      {/* Features/Trust Section */}
      <section className="py-24 bg-muted/30 border-t">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-12 text-center">
                  <div className="space-y-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                          <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold">Private & Secure</h3>
                      <p className="text-muted-foreground">Files are processed locally in your browser using WebAssembly. No data is ever sent to a server.</p>
                  </div>
                  <div className="space-y-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                          <Zap className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold">Blazing Fast</h3>
                      <p className="text-muted-foreground">Zero upload or download times. Instant processing leveraging your device's full power.</p>
                  </div>
                  <div className="space-y-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                          <Layout className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold">Modern Interface</h3>
                      <p className="text-muted-foreground">Clean, ad-free, and easy to use. Designed for productivity and accessibility.</p>
                  </div>
              </div>
          </div>
      </section>
    </div>
  )
}
