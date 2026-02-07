import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ToolCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export function ToolCard({ title, description, href, icon: Icon }: ToolCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <div className="relative h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:ring-1 hover:ring-primary/20">
        <div className="p-6">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold leading-none tracking-tight mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        {/* Decorative gradient on hover */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}
