
import { Button } from "@/components/ui/button"
import { Linkedin, Gem, Star, Loader2 } from "lucide-react"
import { User } from 'firebase/auth';
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = 'belloimam431@gmail.com';

export function SiteHeader({ user, credits, creditsLoading }: { user: User | null, credits: number | null, creditsLoading: boolean }) {
    const isAdmin = user?.email === ADMIN_EMAIL;

    const renderCredits = () => {
        if (creditsLoading || credits === null) {
            return <Skeleton className="h-5 w-16" />;
        }
        if (isAdmin) {
            return (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-500">
                    <Star className="h-4 w-4 fill-purple-500" />
                    Admin
                </div>
            )
        }
        return (
            <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Gem className="h-4 w-4 text-primary" />
                <span>{credits} Credits</span>
            </div>
        );
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <div className="flex items-center gap-2 font-semibold">
                <Link href="/" className="flex items-center gap-2">
                    <img src="https://i.ibb.co/tPC17k0F/free-linkedin-logo-3d-icon-png-download-12257269.webp" alt="PostAI Logo" className="h-8 w-8" />
                    <h1 className="text-lg font-semibold sm:text-xl text-foreground">
                        PostAI
                    </h1>
                </Link>
            </div>
            <div className="ml-auto flex items-center gap-4">
                <Link href="/pricing" className={cn(
                    "rounded-full bg-muted px-3 py-1.5 cursor-pointer transition-colors hover:bg-muted/80",
                    isAdmin && "pointer-events-none"
                )}>
                   {renderCredits()}
                </Link>
                <Button variant="ghost" size="icon" asChild>
                    <a href="https://www.linkedin.com/in/imam-bello" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                        <Linkedin className="h-5 w-5 " />
                    </a>
                </Button>
            </div>
        </header>
    )
}
