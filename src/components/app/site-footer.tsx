import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Send, Loader2 } from "lucide-react"

interface SiteFooterProps {
    reviewText: string;
    setReviewText: (text: string) => void;
    isSubmittingReview: boolean;
    userLoading: boolean;
    handleSubmitReview: () => void;
}

export function SiteFooter({ 
    reviewText, 
    setReviewText, 
    isSubmittingReview, 
    userLoading, 
    handleSubmitReview 
}: SiteFooterProps) {
    const hasReviewFunctionality = !!handleSubmitReview;

    return (
        <footer className="border-t bg-background/50 backdrop-blur-lg py-8 md:py-12">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:text-left text-center">
                        
                        {/* Left: Logo + Description */}
                        <div className="flex flex-col gap-4 items-center md:items-start">
                            <div className="flex items-center gap-2">
                                <img 
                                    src="https://i.ibb.co/tPC17k0F/free-linkedin-logo-3d-icon-png-download-12257269.webp" 
                                    alt="PostAI Logo" 
                                    className="h-9 w-9" 
                                />
                                <h3 className="text-xl font-bold">PostAI</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                AI-powered formatting to make your LinkedIn posts shine. 
                                Built with passion to help professionals communicate with impact.
                            </p>
                        </div>

                        {/* Center: Review Box (only if enabled) */}
                        {hasReviewFunctionality && (
                            <div className="flex flex-col gap-4 items-center w-full max-w-sm mx-auto md:mx-0">
                                <h3 className="font-bold text-lg">Leave a Review</h3>
                                <div className="flex w-full items-center space-x-2">
                                    <Textarea
                                        placeholder="Tell us what you think!"
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        className="min-h-12 resize-none bg-background/80 border-muted"
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

                        {/* Right: Quick Links */}
                        <div className="flex flex-col gap-2 items-center md:items-start">
                            <h3 className="font-bold text-lg">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#editor" className="text-muted-foreground hover:text-primary hover:underline transition">
                                        Editor
                                    </a>
                                </li>
                                <li>
                                    <a href="/story" className="text-muted-foreground hover:text-primary hover:underline transition">
                                        Our Story
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="https://github.com/bello-alternative/formatiq" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary hover:underline transition"
                                    >
                                        GitHub
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Centered separator and copyright */}
                    <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                        <p>
                            Built by{" "}
                            <a 
                                href="https://www.linkedin.com/in/imam-bello" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-semibold text-primary hover:underline"
                            >
                                Imam Bello
                            </a>
                            . © {new Date().getFullYear()} PostAI. All rights reserved. Not affiliated with LinkedIn.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
