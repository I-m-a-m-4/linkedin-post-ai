import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Github, Linkedin, Send, Loader2, Twitter } from "lucide-react"
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SiteFooterProps {
    reviewText: string;
    setReviewText: (text: string) => void;
    isSubmittingReview: boolean;
    userLoading: boolean;
    handleSubmitReview: () => void;
    trackAnalyticsEvent?: (eventName: string) => void;
}

export function SiteFooter({ 
    reviewText, 
    setReviewText, 
    isSubmittingReview, 
    userLoading, 
    handleSubmitReview,
    trackAnalyticsEvent
}: SiteFooterProps) {
    const hasReviewFunctionality = !!handleSubmitReview;


    return (
        <footer className="bg-background text-foreground border-t py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                             <Image src="/icon.png" alt="PostAI Logo" width={20} height={20} />
                        </div>
                        <h2 className="text-2xl font-bricolage font-semibold">PostAI</h2>
                    </div>
                    <p className="text-muted-foreground max-w-xs mb-8">
                       Clarity in every post. We build tools for the next generation of professional communication.
                    </p>
                    <div className="flex gap-2">
                         <a href="https://github.com/i-m-a-m-4" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Github size={18}/>
                        </a>
                         <a href="https://x.com/dev_bime" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Twitter size={18}/>
                        </a>
                         <a href="https://www.linkedin.com/in/imam-bello" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Linkedin size={18}/>
                        </a>
                    </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <h4 className="font-medium text-lg mb-2">PostAI</h4>
                    <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Editor</Link>
                    <Link href="/story" onClick={() => trackAnalyticsEvent?.('storyPageClick_footer')} className="text-muted-foreground hover:text-primary transition-colors">Our Story</Link>
                    <Link href="/pricing" onClick={() => trackAnalyticsEvent?.('pricingPageClick_footer')} className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
                </div>
                
                 <div className="flex flex-col gap-4">
                    <h4 className="font-medium text-lg mb-2">Connect & Legal</h4>
                    {hasReviewFunctionality && (
                        <div className="flex flex-col gap-4 items-start w-full">
                            <div className="flex w-full items-center space-x-2">
                                <Textarea
                                    placeholder="Leave a review..."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    className={cn("min-h-12 resize-none bg-background/80 border-muted text-foreground")}
                                    disabled={isSubmittingReview}
                                />
                                <Button 
                                    onClick={handleSubmitReview} 
                                    disabled={isSubmittingReview || userLoading}
                                    size="icon"
                                    className="h-12 w-12 border"
                                >
                                    {isSubmittingReview ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                    <span className="sr-only">Submit Review</span>
                                </Button>
                            </div>
                        </div>
                    )}
                     <a href="https://chat.whatsapp.com/Bk9AQC1xV039WzCPcD7tRg" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">WhatsApp</a>
                     <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                     <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} PostAI. Built by Imam Bello.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <p>All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
