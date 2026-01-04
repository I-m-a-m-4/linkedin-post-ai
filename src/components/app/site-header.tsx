import { Button } from "@/components/ui/button"
import { Linkedin } from "lucide-react"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <div className="flex items-center gap-2 font-semibold">
                <a href="#" className="flex items-center gap-2">
                    <img src="https://i.ibb.co/tPC17k0F/free-linkedin-logo-3d-icon-png-download-12257269.webp" alt="FormatAI Logo" className="h-8 w-8" />
                    <h1 className="text-lg font-semibold sm:text-xl text-foreground">
                        FormatAI
                    </h1>
                </a>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <a href="https://www.linkedin.com/in/imam-bello" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                        <Linkedin className="h-5 w-5 " />
                    </a>
                </Button>
            </div>
        </header>
    )
}
