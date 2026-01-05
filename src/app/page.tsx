
'use client';

import { autoFormatAndAnalyzeText } from '@/ai/flows/auto-format-text';
import { FormattedTextRenderer } from '@/components/app/formatted-text-renderer';
import { RetroTv3d } from '@/components/app/retro-tv-3d';
import { SiteFooter } from '@/components/app/site-footer';
import { SiteHeader } from '@/components/app/site-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { Auth, signInAnonymously } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  ClipboardCopy,
  FileSignature,
  Globe,
  Italic,
  Laptop,
  List,
  ListOrdered,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Smartphone,
  Sparkle,
  Sparkles,
  Star,
  Strikethrough,
  ThumbsUp,
  Underline,
  User,
  Bot,
  Code,
  Mic,
  Palette,
  ArrowUp,
  CaseUpper,
  Type
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Confetti from 'react-confetti';
import { 
  UNICODE_MAPS,
  convertTextToUnicode,
  convertUnicodeToText,
} from '@/lib/unicode-text';


const featureDetails = {
  'AI Formatting': {
    Icon: Sparkles,
    title: 'Intelligent AI Formatting',
    description: 'Our AI analyzes your raw text and automatically applies optimal formatting for LinkedIn. It adds strategic line breaks for readability, highlights key points with bolding, and ensures your post is clean, professional, and engaging.',
  },
  'Readability Score': {
    Icon: FileSignature,
    title: 'Real-time Readability Score',
    description: 'Get instant feedback on how easy your content is to read. Our score (0-100) is based on linguistic factors like sentence length and word complexity, helping you simplify your message for a broader audience.',
  },
  'Tone Analysis': {
    Icon: Mic,
    title: 'Accurate Tone Analysis',
    description: 'Ensure your message lands with the right emotional impact. Our AI identifies the primary tone of your text—be it Professional, Inspirational, or Casual—so you can align your voice with your personal brand.',
  },
  'Smart Lists': {
    Icon: Bot,
    title: 'Automatic Smart Lists',
    description: "The AI is smart enough to detect when you're trying to make a list and will automatically format it with bullet points or numbers, saving you time and keeping your content organized.",
  },
  'Rich Text Copy': {
    Icon: Code,
    title: 'Rich Text Clipboard',
    description: 'Copy your formatted post with a single click, and all the formatting—bolding, line breaks, and lists—is preserved. Paste it directly into LinkedIn without losing your hard work.',
  },
};
type FeatureKey = keyof typeof featureDetails;

function EditorSkeleton() {
  return (
    <div className="space-y-4 p-4">
       <Skeleton className="h-10 w-4/5" />
       <Skeleton className="h-8 w-full" />
       <Skeleton className="h-8 w-3/5" />
       <Skeleton className="h-8 w-4/5" />
    </div>
  )
}

function PreviewSkeleton() {
  return (
    <div className="space-y-3">
       <Skeleton className="h-4 w-full" />
       <Skeleton className="h-4 w-[90%]" />
       <Skeleton className="h-4 w-4/5" />
       <Skeleton className="h-4 w-[95%]" />
       <Skeleton className="mt-4 w-full aspect-video" />
    </div>
  )
}


function FormattingProgress({ progress, step }: { progress: number, step: string }) {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-lg font-medium text-foreground">{`${step} ${Math.round(progress)}%`}</p>
            </div>
        </div>
    );
}

const EditorContent = React.forwardRef<
  HTMLDivElement,
  { onInput: (e: React.FormEvent<HTMLDivElement>) => void; initialContent: string; onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void; }
>(({ onInput, initialContent, onPaste }, ref) => {
  useEffect(() => {
    if (ref && 'current' in ref && ref.current && ref.current.innerHTML !== initialContent) {
      ref.current.innerHTML = initialContent;
    }
  }, [initialContent, ref]);

  return (
    <div
      ref={ref}
      onInput={onInput}
      onPaste={onPaste}
      contentEditable
      suppressContentEditableWarning={true}
      data-placeholder="Start writing your LinkedIn post here..."
      className={cn(
        'w-full rounded-md bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y overflow-auto animated-input-focus',
        'min-h-[300px]'
      )}
    />
  );
});
EditorContent.displayName = 'EditorContent';

interface HomeProps {
  auth: Auth | null;
  firestore: Firestore | null;
}

const professionalNames = [
  'Aria Montgomery',
  'Julian Hayes',
  'Sterling Archer',
  'Evelyn Reed',
  'Orion Blackwood',
  'Seraphina Jolie',
  'Kairos Thorne',
  'Isla Vanderbilt',
];

export default function Home({ auth, firestore }: HomeProps) {
  const [text, setText] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isFormatting, startFormatting] = useTransition();
  const [formattingStep, setFormattingStep] = useState('');
  const [formattingProgress, setFormattingProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  
  const [readabilityScore, setReadabilityScore] = useState < string | null > (null);
  const [tone, setTone] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey | null>(null);

  const { user, loading: userLoading } = useUser(auth);
  const [randomImageUrl, setRandomImageUrl] = useState('');
  const [randomName, setRandomName] = useState('');

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const postImages = PlaceHolderImages.filter(img => img.id.startsWith('postImage_'));
    if (postImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * postImages.length);
      setRandomImageUrl(postImages[randomIndex].imageUrl);
    }
    setRandomName(professionalNames[Math.floor(Math.random() * professionalNames.length)]);
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const editor = e.currentTarget;
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    
    // This is a naive implementation and can be slow on large content.
    // For production apps, consider a more robust library or approach.
    if (editor.innerText.match(linkRegex)) {
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editor.innerHTML;
        
        const walker = document.createTreeWalker(tempDiv, Node.TEXT_NODE);
        let node;
        const nodesToReplace: { parent: Node, oldNode: Node, newContent: DocumentFragment }[] = [];

        while(node = walker.nextNode()) {
            if (node.parentElement?.tagName === 'A') continue;

            const matches = node.textContent?.match(linkRegex);
            if(matches) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                matches.forEach(match => {
                    const urlIndex = node.textContent!.indexOf(match, lastIndex);
                    fragment.appendChild(document.createTextNode(node.textContent!.substring(lastIndex, urlIndex)));
                    const anchor = document.createElement('a');
                    anchor.href = match;
                    anchor.textContent = match;
                    anchor.target = "_blank";
                    fragment.appendChild(anchor);
                    lastIndex = urlIndex + match.length;
                });
                fragment.appendChild(document.createTextNode(node.textContent!.substring(lastIndex)));
                
                if (node.parentNode) {
                    nodesToReplace.push({ parent: node.parentNode, oldNode: node, newContent: fragment });
                }
            }
        }

        if (nodesToReplace.length > 0) {
            nodesToReplace.forEach(({parent, oldNode, newContent}) => {
                parent.replaceChild(newContent, oldNode);
            });
            editor.innerHTML = tempDiv.innerHTML;
            if (range && selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
    
    setText(editor.innerHTML);
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    let pastedContent = '';
    const pastedHtml = e.clipboardData.getData('text/html');
    
    if (pastedHtml) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pastedHtml;
        
        // Remove unwanted tags and attributes
        tempDiv.querySelectorAll('hr, style, script').forEach(el => el.remove());
        tempDiv.querySelectorAll('*').forEach(el => {
            el.removeAttribute('class');
            el.removeAttribute('style');
        });
        
        pastedContent = tempDiv.innerHTML;
    } else {
        // Fallback to plain text
        pastedContent = e.clipboardData.getData('text/plain');
    }
    
    // Final check for horizontal rule characters from plain text just in case
    pastedContent = pastedContent.replace(/---/g, '');

    document.execCommand('insertHTML', false, pastedContent);
  };


  const trackEvent = useCallback(async () => {
    if (!auth || !firestore) return;
    let currentUser = auth.currentUser;
    if (!currentUser) {
        try {
            const userCredential = await signInAnonymously(auth);
            currentUser = userCredential.user;
        } catch (error) {
            console.error("Anonymous sign-in failed:", error);
            return;
        }
    }
    
    try {
        const eventsCollection = collection(firestore, 'analyticsEvents');
        await addDoc(eventsCollection, {
            userId: currentUser.uid,
            eventType: 'autoFormatClick',
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error tracking event:", error);
    }
}, [auth, firestore]);

  const handleAutoFormat = useCallback(() => {
    const rawText = editorRef.current?.innerText || '';
    if (!rawText.trim()) {
        toast({
            title: 'Content is empty',
            description: 'Please write something before formatting.',
            variant: 'destructive',
        });
        return;
    }

    trackEvent();
    setReadabilityScore(null);
    setTone(null);
    
    startFormatting(async () => {
        try {
            setFormattingStep('Formatting & Analyzing...');
            setFormattingProgress(0);
            
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += 10;
                if (currentProgress > 100) {
                     clearInterval(interval);
                } else {
                    setFormattingProgress(currentProgress);
                }
            }, 150);

            const result = await autoFormatAndAnalyzeText({ rawText });
            let { formattedText, readabilityScore, tone } = result;

            
            clearInterval(interval);
            setFormattingProgress(100);

            // Process special styles first
            let processedHtml = formattedText
              .replace(/~~(.*?)~~/g, '<s>$1</s>') // Strikethrough
              .replace(/__(.*?)__/g, '<u>$1</u>') // Underline
              .replace(/\*\*(.*?)\*\*/g, (match, p1) => {
                  const styledText = convertTextToUnicode(p1, UNICODE_MAPS.SERIF_BOLD);
                  return `<span data-font-style="SERIF_BOLD">${styledText}</span>`;
              });


            // Handle lists and paragraphs
            processedHtml = processedHtml
              .split('\n')
              .map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('* ')) {
                  return `<div>• ${trimmedLine.substring(2)}</div>`;
                }
                 if (/^\d+\.\s/.test(trimmedLine)) {
                  // This is a numbered list item
                  return `<div>${trimmedLine}</div>`;
                }
                return line.trim() === '' ? '<br>' : `<p>${line}</p>`;
              })
              .join('');
            
            setText(processedHtml);
            setReadabilityScore(readabilityScore);
            setTone(tone);
            
            if (editorRef.current) {
                editorRef.current.innerHTML = processedHtml;
            }

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds

            setTimeout(() => {
                setFormattingStep('');
            }, 500);

        } catch (error: any) {
            console.error('Error during AI processing:', error);
            if (error.message && (error.message.includes('429') || error.message.includes('Quota'))) {
                toast({
                    title: "API Quota Reached",
                    description: "You've exceeded the request limit. Please try again later.",
                    duration: 9000,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: 'AI Error',
                    description: 'Could not process text. Please try again.',
                    variant: 'destructive',
                });
            }
        } finally {
            setIsExpanded(false);
             setTimeout(() => {
                setFormattingStep('');
                setFormattingProgress(0);
            }, 600);
        }
    });
  }, [trackEvent, toast]);

  
  const applyStyle = (command: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'insertUnorderedList' | 'insertOrderedList' | 'unicode' | 'uppercase', value?: any) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
  
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
  
    const selectedText = selection.toString();
    if (!selectedText) return;

    // First, always convert any special unicode back to normal text
    const plainText = convertUnicodeToText(selectedText);
    let newText = plainText;
    let newHtml = '';
  
    if (command === 'unicode' && value) {
      if (value !== 'NORMAL') {
        const map = UNICODE_MAPS[value as keyof typeof UNICODE_MAPS];
        newText = convertTextToUnicode(plainText, map || {});
      }
      newHtml = newText.replace(/\n/g, '<br>');
    } else if (command === 'uppercase') {
      newText = plainText.toUpperCase();
      newHtml = newText.replace(/\n/g, '<br>');
    } else {
      // For standard commands, let execCommand handle it directly.
      // This is better for undo/redo stack.
      document.execCommand(command, false, value);
      if (editorRef.current) {
        setText(editorRef.current.innerHTML);
      }
      return;
    }
    
    // For custom commands, use insertHTML to maintain undo history
    document.execCommand('insertHTML', false, newHtml);
      
    if (editorRef.current) {
      setText(editorRef.current.innerHTML);
    }
  };


  const handleCopyToClipboard = async () => {
    if (!editorRef.current) {
      toast({ title: 'Editor not available.', variant: 'destructive' });
      return;
    }
  
    try {
      const editorClone = editorRef.current.cloneNode(true) as HTMLElement;
      
      editorClone.querySelectorAll('hr').forEach(hr => hr.remove());
  
      // Handle spans with font styles by reverting them to normal text
      editorClone.querySelectorAll('span[data-font-style]').forEach(span => {
        const originalText = convertUnicodeToText(span.innerText);
        span.replaceWith(document.createTextNode(originalText));
      });
  
      // Convert standard formatting tags to their plain text equivalents
      editorClone.querySelectorAll('strong, b').forEach(el => {
        el.replaceWith(document.createTextNode(el.innerText));
      });
      editorClone.querySelectorAll('em, i').forEach(el => {
        el.replaceWith(document.createTextNode(el.innerText));
      });
       editorClone.querySelectorAll('u').forEach(el => {
        el.replaceWith(document.createTextNode(el.innerText));
      });
      editorClone.querySelectorAll('s, strike').forEach(el => {
        el.replaceWith(document.createTextNode(el.innerText));
      });
  
      let plainText = '';
      const childNodes = Array.from(editorClone.childNodes);
  
      for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        let nodeText = '';
  
        if (node.nodeName === 'P' || node.nodeName === 'DIV') {
            nodeText = (node as HTMLElement).innerText;
            if (nodeText.trim() !== '') {
                plainText += nodeText;
                // Add a single newline, but not for the last element
                if (i < childNodes.length - 1) {
                    plainText += '\n';
                }
            }
        } else if (node.nodeName === 'BR') {
            // Treat <br> as a significant line break
            plainText += '\n';
        } else {
            nodeText = node.textContent || '';
            plainText += nodeText;
        }
      }
  
      // Final cleanup: ensure no more than two consecutive newlines and trim whitespace
      let cleanedText = plainText.replace(/\n{3,}/g, '\n\n').trim();
  
      await navigator.clipboard.writeText(cleanedText);
  
      toast({
        title: 'Copied to clipboard!',
        description: 'Your formatted post is ready to be pasted.',
        variant: 'success',
      });
    } catch (err) {
      console.error('Could not copy text: ', err);
      toast({
        title: 'Copy failed',
        description: 'Could not copy the text.',
        variant: 'destructive',
      });
    }
  };


  const handlePreviewAction = (action: string) => {
    toast({
      title: `"${action}" clicked!`,
      description: "This is for demonstration purposes only.",
    });
  }

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
        toast({ title: "Please enter a review before submitting.", variant: "destructive" });
        return;
    }
    if (!auth || !firestore) {
        toast({ title: "Could not connect to the service. Please try again.", variant: "destructive" });
        return;
    }

    setIsSubmittingReview(true);
    try {
        let currentUser = auth.currentUser;
        // If no user, sign in anonymously
        if (!currentUser) {
            const userCredential = await signInAnonymously(auth);
            currentUser = userCredential.user;
        }

        if (!currentUser) {
            throw new Error("Could not authenticate user.");
        }

        const reviewsCollection = collection(firestore, 'reviews');
        await addDoc(reviewsCollection, {
            userId: currentUser.uid,
            review: reviewText,
            timestamp: serverTimestamp(),
        });
        toast({
            title: "Thank you for your feedback!",
            description: "Your review has been submitted successfully.",
            variant: "success",
        });
        setReviewText('');
    } catch (error) {
        console.error("Error submitting review:", error);
        toast({
            title: "Submission Failed",
            description: "Could not submit your review. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSubmittingReview(false);
    }
};


  const handleFeatureBoxClick = (feature: FeatureKey) => {
    setSelectedFeature(feature);
    setDialogOpen(true);
  };

  const avatar = PlaceHolderImages.find(img => img.id === 'avatar');
  const fallbackPostImage = PlaceHolderImages.find(img => img.id === 'fallbackPostImage');
  
  const charCount = editorRef.current?.innerText.length || 0;
  const LINKEDIN_CHAR_LIMIT = 3000;
  const isOverLimit = charCount > LINKEDIN_CHAR_LIMIT;
  
  const PREVIEW_LINE_LIMIT = 5;
  const PREVIEW_CHAR_LIMIT = 280;

  let collapsedHtml = text;
  let isCollapsible = false;

  if (isClient && text) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    const allText = tempDiv.innerText || '';
    const lineCount = allText.split('\n').length;
    
    if (allText.length > PREVIEW_CHAR_LIMIT || lineCount > PREVIEW_LINE_LIMIT) {
      isCollapsible = true;
      let truncatedHtml = '';
      let currentChars = 0;
      let currentLines = 0;

      const nodes = Array.from(tempDiv.childNodes);
      for (const node of nodes) {
        const nodeText = node.textContent || '';
        const nodeOuterHtml = node.nodeType === Node.TEXT_NODE ? nodeText : (node as HTMLElement).outerHTML;
        
        if (currentLines >= PREVIEW_LINE_LIMIT || currentChars + nodeText.length > PREVIEW_CHAR_LIMIT) {
          if (currentChars + nodeText.length > PREVIEW_CHAR_LIMIT) {
            const remainingChars = PREVIEW_CHAR_LIMIT - currentChars;
             if (node.nodeType === Node.TEXT_NODE) {
                truncatedHtml += nodeText.substring(0, remainingChars);
            } else {
                const element = node as HTMLElement;
                const clonedElement = element.cloneNode(true) as HTMLElement;
                clonedElement.innerText = element.innerText.substring(0, remainingChars) + '...';
                truncatedHtml += clonedElement.outerHTML;
            }
          }
          break;
        }

        truncatedHtml += nodeOuterHtml;
        currentChars += nodeText.length;
        if (['P', 'DIV', 'BR'].includes(node.nodeName)) {
            currentLines++;
        }
      }
      collapsedHtml = truncatedHtml;
    }
  }

  const getScoreColor = (score: string | null) => {
    if (!score) return 'text-muted-foreground';
    const scoreValue = parseInt(score.split('/')[0], 10);
    if (scoreValue >= 80) return 'text-green-600';
    if (scoreValue >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  const headlines = [
    {
      line1: 'Your All-in-One',
      line2: 'Formatting Hub',
      icon: true,
    },
    {
      line1: 'Write, Format, and',
      line2: 'Analyze Instantly',
      icon: false,
    },
    {
      line1: 'Craft the Perfect',
      line2: 'Post, Every Time',
      icon: false,
    },
  ];

  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prevIndex) => (prevIndex + 1) % headlines.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, [headlines.length]);
  
  const heroAvatars = [
    { src: 'https://framerusercontent.com/images/OU6tHYe85VEE5Z13XvUV6PlrvvE.png?width=80&height=80', alt: 'User 1' },
    { src: 'https://framerusercontent.com/images/wVxdO0qVrjvTmI3EF7i6HjWoG50.jpg?width=400&height=400', alt: 'User 2' },
    { src: 'https://framerusercontent.com/images/Kf1jtTW5GO8Ol1YR50xJOIB4Ks.webp?width=290&height=290', alt: 'User 3' },
    { src: 'https://framerusercontent.com/images/QiOTrocDqj2AQT9ljWfimegkCHM.jpg?width=400&height=400', alt: 'User 4' },
    { src: 'https://framerusercontent.com/images/u1wVuGWYuLuBgD2IQEVOR0ZsZ8.jpg?width=400&height=400', alt: 'User 5' },
  ];

  const linkedInIconUrl = 'https://i.ibb.co/tPC17k0F/free-linkedin-logo-3d-icon-png-download-12257269.webp';

  const CurrentFeatureIcon = selectedFeature ? featureDetails[selectedFeature].Icon : null;

  const fontStyleOptions = [
    { name: 'Normal', value: 'NORMAL', style: {} },
    { name: 'Sans-Serif (Bold, Italic)', value: 'BOLD_ITALIC', style: {fontFamily: 'sans-serif', fontWeight: 'bold', fontStyle: 'italic'} },
    { name: 'Serif (Bold)', value: 'SERIF_BOLD', style: {fontFamily: 'serif', fontWeight: 'bold'} },
    { name: 'Serif (Italic)', value: 'SERIF_ITALIC', style: {fontFamily: 'serif', fontStyle: 'italic'} },
    { name: 'Serif (Regular)', value: 'SERIF', style: {fontFamily: 'serif'} },
    { name: 'Sans-Serif', value: 'SANS', style: {fontFamily: 'sans-serif'} },
    { name: 'Monospace', value: 'MONOSPACE', style: {fontFamily: 'monospace'} },
    { name: 'Script', value: 'SCRIPT', style: {fontFamily: 'cursive'} },
    { name: 'Fraktur', value: 'FRAKTUR', style: {fontFamily: 'fantasy'} },
    { name: 'Circled', value: 'CIRCLED', style: {} },
    { name: 'Full-width', value: 'FULLWIDTH', style: {} },
    { name: 'Doublestruck', value: 'DOUBLESTRUCK', style: {} },
  ];

  return (
    <TooltipProvider>
       <div className={cn('flex min-h-dvh w-full flex-col font-inter')}>
        {showConfetti && (
            <Confetti
              recycle={false}
              numberOfPieces={200}
              gravity={0.1}
              colors={['#0A66C2', '#FFFFFF', '#000000', '#2867B2']}
              style={{ position: 'fixed', zIndex: 9999, bottom: 0, right: 0, width: '100%', height: '100%' }}
              origin={{ x: 0.5, y: 1 }}
            />
          )}
        <SiteHeader />

        <main className="flex-1">
           <section id="hero" className="container mx-auto grid grid-cols-1 items-center gap-y-16 gap-x-12 px-4 py-20 text-center lg:grid-cols-2 lg:gap-y-8 lg:py-32 lg:text-left">
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center gap-4 lg:items-start">
                         <div className="flex -space-x-2">
                          {heroAvatars.map((avatar, index) => (
                            <img key={index} className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src={avatar.src} alt={avatar.alt}/>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="text-sm text-muted-foreground">Used by 10,000+ professionals</p>
                    </div>
                    <div className="relative h-40 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.h1
                          key={headlineIndex}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                          className="text-4xl sm:text-5xl font-bold tracking-tighter text-balance !leading-tight text-foreground absolute w-full"
                        >
                          <span className="block text-4xl/[1.1] sm:text-5xl/[1.1] md:text-6xl/[1.1]">
                            {headlines[headlineIndex].line1}
                          </span>
                          {headlines[headlineIndex].icon ? (
                            <span className="flex items-center justify-center lg:justify-start flex-wrap text-4xl/[1.1] sm:text-5xl/[1.1] md:text-6xl/[1.1]">
                              <span className="text-primary">Linked</span>
                              <img src={linkedInIconUrl} alt="LinkedIn Icon" className="h-9 w-9 sm:h-12 sm:w-12 -mb-1"/>
                              <span className="ml-1 sm:ml-2">Formatting</span>
                              <span className="text-primary ml-1 sm:ml-2">Hub</span>
                            </span>
                          ) : (
                             <span className="text-primary block text-4xl/[1.1] sm:text-5xl/[1.1] md:text-6xl/[1.1]">
                                {headlines[headlineIndex].line2}
                            </span>
                          )}
                        </motion.h1>
                      </AnimatePresence>
                    </div>

                    <p className="max-w-2xl text-lg text-muted-foreground lg:max-w-none">
                        Manage tasks, organize posts, and boost productivity with intelligent formatting. Everything you need in one place.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 items-center justify-center lg:justify-start">
                        <a
                            className={cn(buttonVariants({ size: 'lg' }), "group relative w-full sm:w-auto overflow-hidden bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition duration-200 ease-out hover:-translate-y-0.5")}
                            href="#editor"
                        >
                          <span className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-primary/50 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                          <span className="relative z-10">Get Started</span>
                        </a>
                        <a
                            className={cn(buttonVariants({ variant: "outline", size: 'lg' }), "w-full sm:w-auto bg-background/50 backdrop-blur-sm border-border hover:bg-muted")}
                            href="/story"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
                 <div className="flex flex-col h-[600px] w-full justify-center lg:h-[400px]">
                    <RetroTv3d onBoxClick={handleFeatureBoxClick} />
                </div>
            </section>

            <div id="editor" className="flex flex-1 flex-col gap-6 p-4 md:flex-row md:p-6 lg:p-8">
                {/* Editor Panel */}
                <div className="flex w-full flex-col md:w-1/2">
                <Card className="flex flex-col h-full bg-card/80 backdrop-blur-sm shadow-2xl transition-all duration-300 hover:shadow-primary/10" style={{'--tw-shadow-color': 'hsl(var(--primary) / 0.1)', boxShadow: '0 0 0 1px hsl(var(--border)), 0 10px 30px -10px var(--tw-shadow-color)'}}>
                    <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                        <CardTitle>Content Editor</CardTitle>
                        <CardDescription>
                            Paste your raw text below. Use the AI tools to format it.
                        </CardDescription>
                        </div>
                        <div className={cn(
                        "text-sm font-medium",
                        isOverLimit ? "text-destructive" : "text-muted-foreground"
                        )}>
                        {charCount} / {LINKEDIN_CHAR_LIMIT}
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted p-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => applyStyle('bold')}>
                                <Bold className="h-4 w-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Bold</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => applyStyle('italic')}>
                                <Italic className="h-4 w-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Italic</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => applyStyle('underline')}>
                                <Underline className="h-4 w-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Underline</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => applyStyle('strikethrough')}>
                                <Strikethrough className="h-4 w-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Strikethrough</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => applyStyle('uppercase')}>
                                <CaseUpper className="h-4 w-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Uppercase</p></TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <Type className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Change Font Style</p></TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent>
                                {fontStyleOptions.map(option => (
                                    <DropdownMenuItem key={option.name} onClick={() => applyStyle('unicode', option.value as keyof typeof UNICODE_MAPS)}>
                                        <span style={option.style}>{convertTextToUnicode(option.name, UNICODE_MAPS[option.value as keyof typeof UNICODE_MAPS] || {})}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Separator orientation="vertical" className="h-6" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => applyStyle('insertUnorderedList')}>
                                <List className="h-4 w-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Bullet List</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => applyStyle('insertOrderedList')}>
                                <ListOrdered className="h-4 w-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Numbered List</p></TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="relative flex-1">
                            {isFormatting ? (
                                <div className='relative w-full h-full'>
                                    <EditorSkeleton />
                                    {formattingStep && <FormattingProgress progress={formattingProgress} step={formattingStep} />}
                                </div>
                            ) : (
                            <EditorContent
                                ref={editorRef}
                                onInput={handleInput}
                                onPaste={handlePaste}
                                initialContent={text}
                            />
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <div className="flex w-full flex-col sm:flex-row sm:flex-wrap justify-between items-center gap-4">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 text-sm cursor-pointer">
                                            <FileSignature className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Readability:</span>
                                            {isFormatting && formattingStep.startsWith('Formatting') ? <Skeleton className="h-4 w-12" /> :
                                            <span className={cn('font-semibold', getScoreColor(readabilityScore))}>
                                                {readabilityScore || 'N/A'}
                                            </span>
                                            }
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="max-w-xs space-y-1.5 p-1">
                                        <p className="font-bold text-base">Readability Score</p>
                                        <p className='text-sm'>This score (0-100) gauges how easily your text can be read. A higher score means better readability.</p>
                                        <p className='text-sm text-muted-foreground'>It's calculated based on factors like sentence length, word complexity, and the use of simple language.</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 text-sm cursor-pointer">
                                            <Sparkle className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Tone:</span>
                                            {isFormatting && formattingStep.startsWith('Formatting') ? <Skeleton className="h-4 w-20" /> :
                                            <span className="font-semibold text-primary">
                                                {tone || 'N/A'}
                                            </span>
                                            }
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                    <div className="max-w-xs space-y-1.5 p-1">
                                        <p className="font-bold text-base">Tone Analysis</p>
                                        <p className='text-sm'>Identifies the primary emotional voice of your post (e.g., Professional, Casual, Humorous).</p>
                                        <p className='text-sm text-muted-foreground'>This ensures your message aligns with your intended audience and professional style.</p>
                                    </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className='flex w-full sm:w-auto items-center gap-2 flex-col sm:flex-row'>
                            <Button variant="secondary" onClick={handleCopyToClipboard} className="w-full sm:w-auto">
                                <ClipboardCopy className="mr-2 h-4 w-4" />
                                Copy
                            </Button>
                            <Button
                                onClick={handleAutoFormat}
                                disabled={isFormatting}
                                className="w-full sm:w-auto"
                            >
                                {isFormatting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                {isFormatting ? (formattingStep || 'Processing...') : 'Auto Format'}
                            </Button>
                            </div>

                        </div>
                    </CardFooter>
                </Card>
                </div>

                {/* Preview Panel */}
                <div className="w-full md:w-1/2 flex flex-col">
                <Card className="flex flex-col h-full bg-card/80 backdrop-blur-sm shadow-2xl transition-all duration-300 hover:shadow-primary/10" style={{'--tw-shadow-color': 'hsl(var(--primary) / 0.1)', boxShadow: '0 0 0 1px hsl(var(--border)), 0 10px 30px -10px var(--tw-shadow-color)'}}>
                    <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle>Live Preview</CardTitle>
                            <CardDescription>
                            See how your post will look on LinkedIn.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                            <div className="flex items-center space-x-2">
                            <Switch id="show-image" checked={showImage} onCheckedChange={setShowImage} />
                            <Label htmlFor="show-image">Show Image</Label>
                            </div>
                            <Tabs value={previewMode} onValueChange={setPreviewMode}>
                            <TabsList>
                                <TabsTrigger value="desktop"><Laptop className="h-4 w-4" /></TabsTrigger>
                                <TabsTrigger value="mobile"><Smartphone className="h-4 w-4" /></TabsTrigger>
                            </TabsList>
                            </Tabs>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 items-start justify-center bg-muted/20 p-4 md:p-8">
                    <div
                        className={cn(
                        'w-full overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-300 ease-in-out',
                        previewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[550px]'
                        )}
                    >
                        <div className="p-4">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 cursor-pointer" onClick={() => handlePreviewAction('View Profile')}>
                            {avatar && <AvatarImage src={avatar.imageUrl} alt={avatar.imageHint} data-ai-hint={avatar.imageHint} />}
                            <AvatarFallback><User className="h-6 w-6"/></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm sm:text-base leading-tight cursor-pointer hover:underline" onClick={() => handlePreviewAction('View Profile')}>{randomName}</p>
                                <span className='text-xs text-muted-foreground'>• 1st</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight cursor-pointer hover:underline truncate" onClick={() => handlePreviewAction('View Profile')}>
                                AI Tinkerer & Overthinker. I build tools that help clarify big ideas.
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer" onClick={() => handlePreviewAction('Timestamp')}>
                                1w • Edited • <Globe className="h-3 w-3" />
                            </p>
                            </div>
                            <div className="flex items-center">
                            <Button variant="outline" size="sm" className="mr-2 text-primary border-primary hover:bg-primary/10 hidden sm:flex">
                                + Follow
                            </Button>
                            <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer" />
                            </div>
                        </div>
                        <div className="mt-3 text-sm leading-relaxed">
                            {isFormatting ? (
                                <PreviewSkeleton />
                            ) : (
                            <>
                                <FormattedTextRenderer text={isCollapsible && !isExpanded ? collapsedHtml : text} />
                                {isCollapsible && !isExpanded && (
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className="text-sm text-muted-foreground hover:text-foreground font-semibold mt-1"
                                >
                                    ...see more
                                </button>
                                )}
                                {isCollapsible && isExpanded && (
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="text-sm text-muted-foreground hover:text-foreground font-semibold mt-1"
                                >
                                    ...see less
                                </button>
                                )}
                            </>
                            )}
                        </div>
                        </div>
                        {showImage && (editorRef.current?.innerText.trim().length || 0) > 0 && !isFormatting && (
                        <div className="mt-2">
                            <img 
                            src={randomImageUrl} 
                            alt="Post image" 
                            className="w-full h-auto object-cover" 
                            onError={(e) => {
                                if (fallbackPostImage) {
                                e.currentTarget.src = fallbackPostImage.imageUrl;
                                e.currentTarget.onerror = null; 
                                }
                            }}
                            />
                        </div>
                        )}
                        {showImage && isFormatting && (
                        <Skeleton className="w-full aspect-video mt-2" />
                        )}

                        <div className="px-4 py-1 flex items-center justify-between text-xs text-muted-foreground">
                            <div className='flex items-center gap-1 cursor-pointer hover:text-primary hover:underline'>
                                <img src="https://static.licdn.com/aero-v1/sc/h/8ekq8gho1ruaf8i7f86vd1ftt" alt="like" className="w-4 h-4"/>
                                <span>{randomName} and 5 others</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='cursor-pointer hover:text-primary hover:underline'>1 comment</span>
                                <span>•</span>
                                <span className='cursor-pointer hover:text-primary hover:underline'>2 reposts</span>
                            </div>
                        </div>

                        <div className="border-t border-border mt-1 mx-4">
                        <div className="flex justify-around">
                            <Button variant="ghost" className="flex-1 rounded-none text-muted-foreground font-semibold text-xs sm:text-sm" onClick={() => handlePreviewAction('Like')}>
                            <ThumbsUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Like
                            </Button>
                            <Button variant="ghost" className="flex-1 rounded-none text-muted-foreground font-semibold text-xs sm:text-sm" onClick={() => handlePreviewAction('Comment')}>
                            <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Comment
                            </Button>
                            <Button variant="ghost" className="flex-1 rounded-none text-muted-foreground font-semibold text-xs sm:text-sm" onClick={() => handlePreviewAction('Repost')}>
                            <Repeat2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Repost
                            </Button>
                            <Button variant="ghost" className="flex-1 rounded-none text-muted-foreground font-semibold text-xs sm:text-sm" onClick={() => handlePreviewAction('Send')}>
                            <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Send
                            </Button>
                        </div>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                </div>
            </div>
        </main>
        
        <SiteFooter reviewText={reviewText} setReviewText={setReviewText} isSubmittingReview={isSubmittingReview} userLoading={userLoading} handleSubmitReview={handleSubmitReview} />

        {selectedFeature && (
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogContent className="bg-background/80 backdrop-blur-sm">
              <AlertDialogHeader>
                <div className="flex items-center gap-3">
                  {CurrentFeatureIcon && <CurrentFeatureIcon className="h-8 w-8 text-primary" />}
                  <AlertDialogTitle className="text-2xl">{featureDetails[selectedFeature!].title}</AlertDialogTitle>
                </div>
              </AlertDialogHeader>
              <AlertDialogDescription className="text-base">
                {featureDetails[selectedFeature!].description}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </TooltipProvider>
  );
}

    

    