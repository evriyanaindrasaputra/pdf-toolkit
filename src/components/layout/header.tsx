"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Zap } from "lucide-react"
import { CommandMenu } from "@/components/layout/command-menu"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const links = [
    { href: "/", label: "Home" },
    { href: "/tools/merge-pdf", label: "Merge" },
    { href: "/tools/compress-pdf", label: "Compress" },
    { href: "/tools/pdf-to-word", label: "Convert" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-2 transition-opacity hover:opacity-80">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <Zap className="h-5 w-5" />
            </div>
            <span className="hidden font-bold sm:inline-block tracking-tight text-lg">
              PDF Toolkit
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
            {links.map(({ href, label }) => (
                <Link
                key={href}
                href={href}
                className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === href ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
                >
                {label}
                </Link>
            ))}
          </nav>
        </div>
        
        {/* Mobile Menu */}
        <div className="flex md:hidden items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="flex items-center gap-2 mb-8"
              onClick={() => setIsOpen(false)}
            >
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                  <Zap className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">PDF Toolkit</span>
            </Link>
            <div className="flex flex-col space-y-4 pr-6">
                {links.map(({ href, label }) => (
                    <Link
                        key={href}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "text-muted-foreground hover:text-foreground transition-colors text-lg font-medium",
                            pathname === href && "text-foreground"
                        )}
                    >
                        {label}
                    </Link>
                ))}
            </div>
          </SheetContent>
        </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
