
import { Button } from "@/components/ui/button"
import { Gem, LogOut, Loader2, User, FileText, Star } from "lucide-react"
import type { User as FirebaseUser } from 'firebase/auth';
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ADMIN_EMAIL = 'belloimam431@gmail.com';

const UserNav = ({ user, trackAnalyticsEvent }: { user: FirebaseUser, trackAnalyticsEvent: (eventName: string) => void }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback className="bg-background text-foreground dark:bg-background dark:text-foreground">
                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/story" onClick={() => trackAnalyticsEvent('storyPageClick_header')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Our Story</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/pricing" onClick={() => trackAnalyticsEvent('pricingPageClick_header')}>
                        <Star className="mr-2 h-4 w-4" />
                        <span>Pricing</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => auth.signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export function SiteHeader({ user, onLogin, credits, creditsLoading, userLoading, trackAnalyticsEvent }: { user: FirebaseUser | null, onLogin: () => void, credits: number | null, creditsLoading: boolean, userLoading: boolean, trackAnalyticsEvent?: (eventName: string) => void }) {
    const isAdmin = user?.email === ADMIN_EMAIL;
    const validUser = user && user.email; // A user is valid if they are not anonymous

    const handleTrackedClick = (eventName: string) => {
        if (validUser && trackAnalyticsEvent) {
            trackAnalyticsEvent(eventName);
        }
    };

    const renderCredits = () => {
        if (creditsLoading || (validUser && credits === null)) {
            return <Skeleton className="h-5 w-16" />;
        }
        if (isAdmin || !validUser) {
            return null;
        }
        return (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link href="/pricing" className="flex items-center gap-1.5 text-sm font-semibold" onClick={() => handleTrackedClick('pricingPageClick_header_credits')}>
                            <Gem className="h-4 w-4 text-primary" />
                            <span>{credits ?? 0} Credits</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>1 credit is used per "Auto Format" action. Click to buy more.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <div className="flex items-center gap-2 font-semibold">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/icon.png" alt="PostAI Logo" width={32} height={32} />
                    <h1 className="text-lg font-semibold sm:text-xl text-foreground">
                        PostAI
                    </h1>
                </Link>
            </div>
             <nav className="hidden md:flex items-center gap-6 ml-10 text-sm font-medium">
                <Link href="/story" className="text-muted-foreground transition-colors hover:text-foreground" onClick={() => handleTrackedClick('storyPageClick_header')}>
                    Our Story
                </Link>
                <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground" onClick={() => handleTrackedClick('pricingPageClick_header')}>
                    Pricing
                </Link>
            </nav>
            <div className="ml-auto flex items-center gap-4">
                {userLoading ? <Skeleton className="h-8 w-24 rounded-md" /> : (
                    <>
                        {validUser ? (
                            <>
                                {isAdmin && (
                                    <Button asChild variant="outline">
                                        <Link href="/admin">Admin Dashboard</Link>
                                    </Button>
                                )}
                                {!isAdmin && (
                                    <div className={cn(
                                        "rounded-full bg-muted px-3 py-1.5 cursor-pointer transition-colors hover:bg-muted/80"
                                    )}>
                                    {renderCredits()}
                                    </div>
                                )}
                                <UserNav user={user} trackAnalyticsEvent={handleTrackedClick}/>
                            </>
                        ) : (
                          <Button onClick={onLogin} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                            Login
                          </Button>
                        )}
                    </>
                )}
            </div>
        </header>
    )
}
