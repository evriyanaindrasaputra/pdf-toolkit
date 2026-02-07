"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
  Search,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"

const tools = [
  { title: "Merge PDF", href: "/tools/merge-pdf", icon: FileStack },
  { title: "Split PDF", href: "/tools/split-pdf", icon: Split },
  { title: "Rotate PDF", href: "/tools/rotate-pdf", icon: RotateCw },
  { title: "PDF Reader", href: "/tools/pdf-reader", icon: BookOpen },
  { title: "Speed Reader", href: "/tools/rsvp-reader", icon: Eye },
  { title: "Compress PDF", href: "/tools/compress-pdf", icon: Minimize2 },
  { title: "PDF to Word", href: "/tools/pdf-to-word", icon: FileType },
  { title: "JPG to PDF", href: "/tools/jpg-to-pdf", icon: Image },
  { title: "PDF to Form", href: "/tools/pdf-to-form", icon: FileInput },
  { title: "Sign PDF", href: "/tools/sign-pdf", icon: PenTool },
  { title: "Insert Watermark", href: "/tools/insert-watermark", icon: Stamp },
  { title: "Remove Watermark", href: "/tools/remove-watermark", icon: Eraser },
  { title: "Protect PDF", href: "/tools/protect-pdf", icon: Lock },
  { title: "Unprotect PDF", href: "/tools/unprotect-pdf", icon: Unlock },
  { title: "OCR PDF", href: "/tools/ocr-pdf", icon: ScanText },
]

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search tools...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tools">
            {tools.map((tool) => (
              <CommandItem
                key={tool.href}
                value={tool.title}
                onSelect={() => {
                  runCommand(() => router.push(tool.href))
                }}
              >
                <tool.icon className="mr-2 h-4 w-4" />
                <span>{tool.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="General">
             <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                <Search className="mr-2 h-4 w-4" />
                Home
             </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
