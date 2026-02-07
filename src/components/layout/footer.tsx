import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container max-w-6xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
                <Link href="/" className="font-bold text-lg mb-4 block">PDF Toolkit</Link>
                <p className="text-sm text-muted-foreground leading-loose">
                    Local-first PDF tools for everyone. 
                    Privacy focused, no uploads, 100% free.
                </p>
            </div>
            
            <div>
                <h4 className="font-semibold mb-4">Popular Tools</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><Link href="/tools/merge-pdf" className="hover:text-foreground transition-colors">Merge PDF</Link></li>
                    <li><Link href="/tools/compress-pdf" className="hover:text-foreground transition-colors">Compress PDF</Link></li>
                    <li><Link href="/tools/pdf-to-word" className="hover:text-foreground transition-colors">PDF to Word</Link></li>
                </ul>
            </div>
            
            <div>
                <h4 className="font-semibold mb-4">Edit & Secure</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><Link href="/tools/sign-pdf" className="hover:text-foreground transition-colors">Sign PDF</Link></li>
                    <li><Link href="/tools/protect-pdf" className="hover:text-foreground transition-colors">Protect PDF</Link></li>
                    <li><Link href="/tools/remove-watermark" className="hover:text-foreground transition-colors">Remove Watermark</Link></li>
                </ul>
            </div>
            
            <div>
                <h4 className="font-semibold mb-4">Project</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><a href="https://github.com/evriyanaindrasaputra/pdf-toolkit" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                    <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                </ul>
            </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PDF Toolkit. Open Source.</p>
            <div className="flex gap-4">
                <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            </div>
        </div>
      </div>
    </footer>
  )
}
