
'use client';

import { autoFormatText } from '@/ai/flows/auto-format-text';
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
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp, doc, runTransaction, setDoc, getDoc, getDocs, writeBatch, deleteDoc, where, query } from 'firebase/firestore';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, deleteUser as deleteFirebaseAuthUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  ClipboardCopy,
  FileSignature,
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
  User as UserIcon,
  Bot,
  Code,
  Mic,
  Palette,
  ArrowUp,
  CaseUpper,
  Type,
  Gem,
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Confetti from 'react-confetti';
import { 
  UNICODE_MAPS,
  convertTextToUnicode,
} from '@/lib/unicode-text';
import { useUserCredits } from '@/hooks/use-user-credits';
import { PurchaseCreditsDialog } from '@/components/app/purchase-credits-dialog';
import { z } from 'zod';
import Image from 'next/image';

const AutoFormatTextInputSchema = z.object({
  rawText: z.string().describe('The raw text to be formatted for a LinkedIn post.'),
});
export type AutoFormatTextInput = z.infer<typeof AutoFormatTextInputSchema>;

const AutoFormatTextOutputSchema = z.object({
  formattedText: z.string().describe('The AI-formatted text optimized for LinkedIn.'),
});
export type AutoFormatTextOutput = z.infer<typeof AutoFormatTextOutputSchema>;


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
  'Text Styling': {
    Icon: Palette,
    title: 'Advanced Text Styling',
    description: 'Go beyond bolding with a full suite of styling tools. Apply italics, underlines, strikethroughs, and even special font styles like monospace or script to make your posts truly stand out.',
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

const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="#0A66C2">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.54 1.54 0 0013 14.19a1.55 1.55 0 00.06 1.93V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.34 1.02 3.34 3.48z"></path>
    </svg>
)

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

const ADMIN_EMAIL = 'belloimam431@gmail.com';

type SaveStatus = 'unsaved' | 'saving' | 'saved';


export default function Home() {
  const [text, setText] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
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
  const [showImage, setShowImage] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  const validUser = user && user.email;
  const { credits, loading: creditsLoading, spendCredit } = useUserCredits(validUser ? user.uid : undefined);
  
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [randomName, setRandomName] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);

  // Load content from local storage on initial render
  useEffect(() => {
    setIsClient(true);
    try {
      const savedText = localStorage.getItem('editorContent');
      if (savedText) {
        setText(savedText);
      }
    } catch (error) {
      console.error("Could not load from local storage:", error);
    }
    
    const postImages = PlaceHolderImages.filter(img => img.id.startsWith('postImage_')).map(img => img.imageUrl);
    if (postImages.length >= 4) {
        const shuffled = postImages.sort(() => 0.5 - Math.random());
        setPreviewImages(shuffled.slice(0, 4));
    }
    setRandomName(professionalNames[Math.floor(Math.random() * professionalNames.length)]);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setUserLoading(false);
    });

    const handleOnline = () => {
      toast({
        title: 'Back Online',
        description: 'Your internet connection has been restored.',
        variant: 'success',
      });
    };

    const handleOffline = () => {
      toast({
        title: 'No Internet Connection',
        description: 'Please check your connection. Some features may be unavailable.',
        variant: 'destructive',
        duration: Infinity
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);


    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Save content to local storage whenever it changes
  useEffect(() => {
    if (text === undefined || !isClient) return;
    setSaveStatus('saving');
    const handler = setTimeout(() => {
      try {
        localStorage.setItem('editorContent', text);
        setSaveStatus('saved');
      } catch (error) {
        console.error("Could not save to local storage:", error);
        setSaveStatus('unsaved');
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [text, isClient]);


  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const editor = e.currentTarget;
    setText(editor.innerHTML);
    setSaveStatus('unsaved');
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    let pastedContent = '';
    const pastedHtml = e.clipboardData.getData('text/html');
    
    if (pastedHtml) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pastedHtml;
        
        tempDiv.querySelectorAll('hr, style, script').forEach(el => el.remove());
        tempDiv.querySelectorAll('*').forEach(el => {
            el.removeAttribute('class');
            el.removeAttribute('style');
        });
        
        pastedContent = tempDiv.innerHTML;
    } else {
        pastedContent = e.clipboardData.getData('text/plain');
    }
    
    pastedContent = pastedContent.replace(/---/g, '');

    document.execCommand('insertHTML', false, pastedContent);
  };


  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        });
      }

      setShowLoginDialog(false);
      toast({
        title: 'Login Successful',
        description: 'You are now logged in.',
        variant: 'success'
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: 'Login Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive'
      });
    }
  };


  const trackAnalyticsEvent = async (eventType: string) => {
     if (!db || !user) return;
     try {
       await addDoc(collection(db, 'analyticsEvents'), {
         userId: user?.uid || 'anonymous',
         eventType: eventType,
         timestamp: serverTimestamp(),
       });
     } catch (error) {
       console.error("Error tracking analytics event:", error);
     }
   };

  const handleAutoFormat = useCallback(async () => {
    if (!validUser) {
      setShowLoginDialog(true);
      return;
    }

    const rawText = editorRef.current?.innerText || '';
    if (!rawText.trim()) {
        toast({
            title: 'Content is empty',
            description: 'Please write something before formatting.',
            variant: 'warning',
        });
        return;
    }
    
    const isAdmin = user?.email === ADMIN_EMAIL;
    if (!isAdmin && credits !== null && credits <= 0) {
      setShowPurchaseDialog(true);
      return;
    }

    try {
      if (!isAdmin) {
        await spendCredit();
      }
    } catch (error) {
        console.error("Credit spending failed:", error);
        toast({
            title: 'Action Failed',
            description: (error as Error).message || "Could not complete the action.",
            variant: 'destructive',
        });
        if ((error as Error).message.includes("Insufficient credits")) {
            setShowPurchaseDialog(true);
        }
        return;
    }
    
    startFormatting(async () => {
        try {
            setFormattingStep('Formatting...');
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

            const result = await autoFormatText({ rawText });
            let { formattedText } = result;
            
            clearInterval(interval);
            setFormattingProgress(100);

            setText(formattedText);
            
            if (editorRef.current) {
                editorRef.current.innerHTML = formattedText;
            }

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); 

            setTimeout(() => {
                setFormattingStep('');
            }, 500);

        } catch (error: any) {
            console.error('Error during AI processing:', error);
            if (error.message && (error.message.includes('429') || error.message.includes('Quota'))) {
                toast({
                    title: "We're experiencing high traffic",
                    description: "Please try again in a few moments. We're working on it!",
                    duration: 9000,
                    variant: "default",
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
  }, [spendCredit, toast, user, validUser, credits]);

  
  const applyStyle = (command: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'insertUnorderedList' | 'insertOrderedList' | 'unicode' | 'uppercase', value?: any) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
  
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
       document.execCommand(command, false, value);
       if (editorRef.current) setText(editorRef.current.innerHTML);
      return;
    }
  
    if (selection.isCollapsed && command !== 'insertUnorderedList' && command !== 'insertOrderedList') {
        document.execCommand(command, false, value);
        if (editorRef.current) setText(editorRef.current.innerHTML);
        return;
    }

    const selectedText = selection.toString();
    
    let newHtml = '';
  
    if (command === 'unicode' && value) {
      if (value !== 'NORMAL') {
        const map = UNICODE_MAPS[value as keyof typeof UNICODE_MAPS];
        const newText = convertTextToUnicode(selectedText, map || {});
        newHtml = newText.replace(/\n/g, '<br>');
      } else {
         const range = selection.getRangeAt(0);
         const normalText = selectedText.split('').map(char => {
             for (const style of Object.values(UNICODE_MAPS)) {
                 const originalChar = Object.keys(style).find(key => style[key] === char);
                 if (originalChar) return originalChar;
             }
             return char;
         }).join('');
         newHtml = normalText;
      }
      document.execCommand('insertHTML', false, newHtml);
    } else if (command === 'uppercase') {
      newHtml = selectedText.toUpperCase().replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, newHtml);
    } else {
      document.execCommand(command, false, value);
    }
      
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
  
      // Function to recursively process nodes and build a plain text string
      const processNode = (node: ChildNode): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || '';
        }
  
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          let content = '';
          let prefix = '';
          let suffix = '\n';
  
          switch (element.tagName) {
            case 'STRONG':
            case 'B':
              return convertTextToUnicode(element.innerText, UNICODE_MAPS.BOLD);
            case 'EM':
            case 'I':
              return convertTextToUnicode(element.innerText, UNICODE_MAPS.ITALIC);
            case 'UL':
              // Process list items within the UL
              content = Array.from(element.childNodes).map(processNode).join('');
              break;
            case 'OL':
              // Process list items within the OL with numbering
              let counter = 1;
              content = Array.from(element.childNodes).map(childNode => {
                 if (childNode.nodeName === 'LI') {
                   return `${counter++}. ${Array.from(childNode.childNodes).map(processNode).join('')}`;
                 }
                 return processNode(childNode);
              }).join('');
              break;
            case 'LI':
              // Handled by UL/OL, but as a fallback:
              return `• ${Array.from(element.childNodes).map(processNode).join('')}\n`;
            case 'P':
            case 'DIV':
              suffix = '\n\n'; // Double newline for paragraphs/divs
              content = Array.from(element.childNodes).map(processNode).join('');
              break;
            case 'BR':
              return '\n';
            default:
              content = Array.from(element.childNodes).map(processNode).join('');
              suffix = '';
              break;
          }
          
          // For ULs specifically, prefix each LI text with a bullet
          if (element.tagName === 'UL') {
              let liContent = '';
              element.querySelectorAll('li').forEach(li => {
                  liContent += `• ${li.innerText}\n`;
              });
              content = liContent;
          }

          return prefix + content + suffix;
        }
  
        return '';
      };
      
      let plainText = Array.from(editorClone.childNodes).map(processNode).join('');
  
      // Final cleanup of excessive newlines
      let cleanedText = plainText.replace(/\n{3,}/g, '\n\n').trim();
  
      await navigator.clipboard.writeText(cleanedText);
  
      toast({
        title: 'Copied to clipboard!',
        description: 'Your formatted post is ready to be pasted on LinkedIn.',
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
    if (action === 'follow') {
      setIsFollowing(true);
      toast({
        title: `Now Following ${randomName}`,
        description: "This is for demonstration purposes only.",
      });
    } else {
      toast({
        title: `"${action}" clicked!`,
        description: "This is for demonstration purposes only.",
      });
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
        toast({ title: 'Please enter a review before submitting.', variant: 'destructive' });
        return;
    }
    if (!db) {
        toast({ title: "Could not connect to the service. Please try again.", variant: 'destructive' });
        return;
    }

    setIsSubmittingReview(true);
    
    if (!validUser) {
        setShowLoginDialog(true);
        setIsSubmittingReview(false);
        return;
    }

    try {
        const reviewsCollection = collection(db, 'reviews');
        await addDoc(reviewsCollection, {
            userId: user.uid,
            review: reviewText,
            timestamp: serverTimestamp(),
        });

        toast({
            title: 'Thank you for your feedback!',
            description: 'Your review has been submitted successfully.',
            variant: 'success',
        });
        setReviewText('');
    } catch (error: any) {
        console.error('Error submitting review:', error);
        toast({
            title: 'Submission Failed',
            description: error.message || 'Could not submit your review. Please try again.',
            variant: 'destructive',
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
    }, 4000); 
    return () => clearInterval(interval);
  }, [headlines.length]);
  
  const heroAvatars = [
    { src: 'https://framerusercontent.com/images/OU6tHYe85VEE5Z13XvUV6PlrvvE.png?width=80&height=80', alt: 'User 1' },
    { src: 'https://framerusercontent.com/images/wVxdO0qVrjvTmI3EF7i6HjWoG50.jpg?width=400&height=400', alt: 'User 2' },
    { src: 'https://framerusercontent.com/images/Kf1jtTW5GO8Ol1YR50xJOIB4Ks.webp?width=290&height=290', alt: 'User 3' },
    { src: 'https://framerusercontent.com/images/QiOTrocDqj2AQT9ljWfimegkCHM.jpg?width=400&height=400', alt: 'User 4' },
    { src: 'https://framerusercontent.com/images/u1wVuGWYuLuBgD2IQEVOR0ZsZ8.jpg?width=400&height=400', alt: 'User 5' },
  ];

  const CurrentFeatureIcon = selectedFeature ? featureDetails[selectedFeature!].Icon : null;

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

  const renderImageGrid = () => {
    if (previewImages.length < 3) return null;
  
    return (
      <div className="mt-2 grid grid-cols-2 grid-rows-2 gap-1 aspect-[4/3]">
        <div className="col-span-2 row-span-1 relative cursor-pointer" onClick={() => setLightboxImage(previewImages[0])}>
            <Image src={previewImages[0]} alt="Post image 1" layout="fill" className="object-cover" />
        </div>
        <div className="relative cursor-pointer" onClick={() => setLightboxImage(previewImages[1])}>
            <Image src={previewImages[1]} alt="Post image 2" layout="fill" className="object-cover"/>
        </div>
        <div className="relative cursor-pointer" onClick={() => setLightboxImage(previewImages[2])}>
            <Image src={previewImages[2]} alt="Post image 3" layout="fill" className="object-cover"/>
        </div>
      </div>
    )
  }
  
    const renderSaveStatus = () => {
        switch (saveStatus) {
            case 'saving':
                return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /><span>Saving...</span></div>;
            case 'saved':
                return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3 w-3 text-green-500" /><span>Saved locally</span></div>;
            default:
                return <div className="h-5"></div>;
        }
    };


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
        <SiteHeader user={user} onLogin={() => setShowLoginDialog(true)} credits={credits} creditsLoading={creditsLoading || userLoading} userLoading={userLoading} trackAnalyticsEvent={trackAnalyticsEvent} />

        <main className="flex-1">
           <section id="hero" className="container mx-auto grid grid-cols-1 items-center gap-y-16 gap-x-12 px-4 py-20 text-center lg:grid-cols-2 lg:py-32 mb-16">
                <div className="space-y-6 lg:order-first">
                    <div className="flex flex-col items-center justify-center gap-4 lg:items-start">
                         <div className="flex -space-x-2">
                          {heroAvatars.map((avatar, index) => (
                            <img key={index} className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src={avatar.src} alt={avatar.alt}/>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="text-sm text-muted-foreground">Join a growing community of creators.</p>
                    </div>
                    <div className="relative h-36 md:h-48 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.h1
                          key={headlineIndex}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                          className="text-4xl sm:text-5xl font-bold tracking-tighter text-balance !leading-tight text-foreground absolute w-full"
                        >
                          <span className="block text-4xl/[1.1] sm:text-5xl/[1.1] md:text-5xl/[1.1] lg:text-5xl/[1.1] xl:text-6xl/[1.1]">
                            {headlines[headlineIndex].line1}
                          </span>
                          {headlines[headlineIndex].icon ? (
                            <span className="flex items-center justify-center lg:justify-start flex-wrap text-4xl/[1.1] sm:text-5xl/[1.1] md:text-5xl/[1.1] lg:text-5xl/[1.1] xl:text-6xl/[1.1]">
                              <span className="text-primary">Linked</span>
                              <Image src="/icon.png" alt="LinkedIn Icon" width={36} height={36} className="h-9 w-9 sm:h-12 sm:w-12 -mb-1"/>
                              <span className="ml-1 sm:ml-2">Formatting</span>
                              <span className="text-primary ml-1 sm:ml-2">Hub</span>
                            </span>
                          ) : (
                             <span className="text-primary block text-4xl/[1.1] sm:text-5xl/[1.1] md:text-5xl/[1.1] lg:text-5xl/[1.1] xl:text-6xl/[1.1]">
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
                            onClick={() => trackAnalyticsEvent('storyPageClick_hero')}
                        >
                            Learn More
                        </a>
                    </div>
                </div>
                 <div className="flex flex-col h-[600px] w-full justify-center lg:h-[400px] mt-12 lg:mt-0">
                    <RetroTv3d onBoxClick={handleFeatureBoxClick} />
                </div>
            </section>

            <div id="editor" className="flex flex-1 flex-col gap-6 p-4 md:flex-row md:p-6 lg:p-8">
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
                        <div className="flex w-full flex-col sm:flex-row sm:flex-wrap justify-end items-center gap-4">
                             <div className="flex-1 min-w-0">
                                {renderSaveStatus()}
                            </div>
                            <div className='flex w-full sm:w-auto items-center gap-2 flex-col sm:flex-row'>
                            <Button variant="secondary" onClick={handleCopyToClipboard} className="w-full sm:w-auto">
                                <ClipboardCopy className="mr-2 h-4 w-4" />
                                Copy for LinkedIn
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
                                <AvatarFallback><UserIcon className="h-6 w-6"/></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="font-semibold text-sm sm:text-base leading-tight cursor-pointer hover:underline" onClick={() => handlePreviewAction('View Profile')}>{randomName}</p>
                                    <Image src="https://i.ibb.co/XZJMNSfY/images-3-removebg-preview.png" alt="LinkedIn Premium" width={16} height={16} />
                                    <span className="text-xs text-muted-foreground">• {isFollowing ? 'Following' : 'Follow'}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-tight cursor-pointer hover:underline truncate" onClick={() => handlePreviewAction('View Profile')}>
                                    AI-powered formatting for impactful posts.
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer" onClick={() => handlePreviewAction('Timestamp')}>
                                    1w • <Image src="https://i.ibb.co/TqHMFhRS/globe.png" alt="Globe" width={12} height={12} />
                                </p>
                            </div>
                            <div className="flex items-center flex-shrink-0 ml-auto gap-3">
                              <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer" />
                              <X className="h-5 w-5 text-muted-foreground cursor-pointer" />
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
                            renderImageGrid()
                        )}
                        {showImage && isFormatting && (
                            <div className="mt-2 grid grid-cols-2 gap-1">
                                <Skeleton className="w-full aspect-square"/>
                                <Skeleton className="w-full aspect-square"/>
                                <Skeleton className="w-full aspect-square"/>
                                <Skeleton className="w-full aspect-square"/>
                            </div>
                        )}

                        <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                            <div className='flex items-center gap-2 cursor-pointer hover:text-primary'>
                                <div className="flex items-center">
                                    <img src="https://static.licdn.com/aero-v1/sc/h/8ekq8gho1ruaf8i7f86vd1ftt" alt="like" className="w-4 h-4 z-20"/>
                                </div>
                                <span>86</span>
                            </div>
                            <span className='cursor-pointer hover:text-primary hover:underline'>6 comments</span>
                        </div>

                        <div className="border-t border-border">
                            <div className="flex justify-around items-center py-1">
                                <Avatar className="h-6 w-6">
                                     {avatar && <AvatarImage src={avatar.imageUrl} alt={avatar.imageHint} data-ai-hint={avatar.imageHint} />}
                                    <AvatarFallback><UserIcon className="h-4 w-4"/></AvatarFallback>
                                </Avatar>
                                 <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                <Separator orientation="vertical" className="h-8 mx-2" />
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
        
        <SiteFooter reviewText={reviewText} setReviewText={setReviewText} isSubmittingReview={isSubmittingReview} userLoading={userLoading} handleSubmitReview={handleSubmitReview} trackAnalyticsEvent={trackAnalyticsEvent} />

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
        
        {lightboxImage && (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setLightboxImage(null)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                        <img src={lightboxImage} alt="Enlarged view" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                    </motion.div>
                     <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:text-white" onClick={() => setLightboxImage(null)}>
                        <X className="h-6 w-6" />
                    </Button>
                </motion.div>
            </AnimatePresence>
        )}

        <PurchaseCreditsDialog
          open={showPurchaseDialog}
          onOpenChange={setShowPurchaseDialog}
        />

        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Please Log In</AlertDialogTitle>
              <AlertDialogDescription>
                To use this feature and save your work, please sign in with your Google account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleGoogleSignIn}>
                <Image src="/google.png" alt="Google" width={16} height={16} className="mr-2" />
                Continue with Google
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </TooltipProvider>
  );
}
