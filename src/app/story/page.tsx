
'use client';

import {
  Infinity as InfinityIcon,
  MessageCircle,
  Menu,
  Search,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  BrainCircuit,
  Workflow,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';

// Custom hook to trigger animations when an element is in view
const useAnimateOnScroll = (ref: React.RefObject<HTMLElement>) => {
  const isInView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });

  useEffect(() => {
    if (isInView) {
      ref.current?.classList.add('is-in-view');
    }
  }, [isInView, ref]);
};

const AnimateOnScroll = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  useAnimateOnScroll(ref);
  return (
    <div ref={ref} className={cn("animate-on-scroll", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
};

const heroImages = [
  "65963.jpg",
  "land.jpg",
  "star.jpg",
  "house.jpg",
];

const StoryPage = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, []);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])


  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(autoplay);
    }
  }, [emblaApi])

  return (
    <div className="bg-neutral-950 text-neutral-50 w-full overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* Vertical Lines */}
      <div className="fixed inset-0 w-full max-w-7xl mx-auto pointer-events-none z-10 hidden md:flex justify-between px-12 opacity-10">
        <div className="w-[1px] h-full bg-gradient-to-b from-white/50 to-transparent"></div>
        <div className="w-[1px] h-full bg-gradient-to-b from-white/50 to-transparent"></div>
        <div className="w-[1px] h-full bg-gradient-to-b from-white/50 to-transparent"></div>
      </div>
      
      {/* New Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 animate-slide-up [animation-delay:0.5s] opacity-0">
        <nav className="w-full max-w-4xl flex items-center justify-between px-2 py-2 pr-6 border border-white/10 bg-neutral-900/80 backdrop-blur-xl rounded-full shadow-2xl">
          <Link href="/" className="flex items-center gap-3 pl-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
              <img src="https://i.ibb.co/tPC17k0F/free-linkedin-logo-3d-icon-png-download-12257269.webp" alt="PostAI Logo" className="h-5 w-5" />
            </div>
            <span className="font-bricolage font-semibold text-lg tracking-tight">PostAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="text-white hover:text-white transition-colors">Features</a>
            <a href="#story" className="hover:text-white transition-colors">Story</a>
            <a href="#mission" className="hover:text-white transition-colors">Mission</a>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Search size={20} />
            </button>
            <button className="relative w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors group">
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </div>
      
      <main>
        {/* Hero Section */}
        <header className="relative w-full h-screen overflow-hidden flex flex-col justify-end pb-12 md:pb-24">
          <div className="absolute inset-0 z-0 bg-black overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {heroImages.map((src, index) => (
                <div className="flex-grow-0 flex-shrink-0 w-full h-full min-w-0" key={index}>
                   <img src={src} className="w-full h-full object-cover animate-cinematic opacity-0" alt="Abstract data visualization" data-ai-hint="data visualization" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80"></div>
          </div>
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroImages.map((_, index) => (
              <button key={index} onClick={() => scrollTo(index)} className={cn("w-2 h-2 rounded-full transition-colors", selectedIndex === index ? "bg-white" : "bg-white/20 hover:bg-white/50")}></button>
            ))}
          </div>

          <div className="relative z-10 w-full max-w-[90rem] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-7 relative">
              <div className="flex items-center gap-3 mb-6 animate-slide-up [animation-delay:1.2s] opacity-0">
                <span className="h-[1px] w-8 bg-white/60"></span>
                <span className="text-xs font-mono uppercase tracking-widest text-white/80">From Idea to Impact</span>
              </div>
              <h1 className="font-bricolage font-bold text-white leading-[0.85] tracking-tight">
                <span className="block text-[15vw] md:text-[9rem] lg:text-[11rem] animate-slide-up [animation-delay:1.4s] opacity-0 mix-blend-normal text-white drop-shadow-2xl">Clarity</span>
                <div className="flex items-baseline gap-4 md:gap-8 -mt-2 md:-mt-8 animate-slide-up [animation-delay:1.6s] opacity-0">
                  <span className="text-[15vw] md:text-[9rem] lg:text-[11rem] font-playfair italic font-thin text-white/60">&</span>
                  <span className="text-[15vw] md:text-[9rem] lg:text-[11rem] text-white drop-shadow-2xl">Code</span>
                </div>
              </h1>
            </div>

            <div className="md:col-span-4 md:col-start-9 flex flex-col justify-end pb-4 md:pb-8">
              <div className="relative overflow-hidden bg-neutral-950/60 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-slide-up [animation-delay:1.8s] opacity-0">
                <p className="text-lg md:text-xl text-white font-light leading-relaxed mb-8 antialiased">
                  PostAI started with a simple question: why is it so hard to communicate clearly online? We're building the tools to fix that.
                </p>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Users</span>
                      <span className="text-2xl font-bricolage text-white">10,000+</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Goal</span>
                      <span className="text-2xl font-bricolage text-white">Clarity</span>
                    </div>
                  </div>
                  <Link href="/#editor" className="group flex items-center justify-between w-full p-1 border-b border-white/30 hover:border-white transition-colors pb-2">
                    <span className="text-sm font-medium tracking-wide text-white">Try The Editor</span>
                    <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-slide-up [animation-delay:2.2s] opacity-0">
              <span className="text-[10px] uppercase tracking-widest text-white/40">Scroll</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
          </div>

        </header>

        {/* Story Section */}
        <section id="story" className="bg-[#fdfdfd] text-neutral-900 py-24 md:py-32 relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{"backgroundImage": "radial-gradient(#000 1px, transparent 1px)", "backgroundSize": "32px 32px"}}></div>
          <div className="w-full max-w-3xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
            <AnimateOnScroll>
              <p className="text-xl md:text-2xl text-neutral-800 max-w-2xl mx-auto text-balance text-center font-light">
                My name is <span className="font-medium text-black">Bime</span>. A software developer and tech enthusiast with a burning ambition: to build something that truly solves a problem.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.1}>
              <p className="text-xl md:text-2xl text-neutral-800 max-w-2xl mx-auto text-balance text-center font-light">
                The path to a great idea is rarely a straight line. The biggest challenge wasn't a lack of problems, but the difficulty in finding like-minded people to explore them with. The online world felt too noisy for the deep conversations that spark real innovation.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.2}>
              <p className="text-xl md:text-2xl text-neutral-800 max-w-2xl mx-auto text-balance text-center font-light">
                And so, PostAI was born. Not as a grand startup, but as a simple tool to fix a personal frustration: making professional thoughts clear and impactful on platforms like LinkedIn. It started as an experiment in a quiet WhatsApp group.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.3}>
              <p className="text-xl md:text-2xl text-neutral-800 max-w-2xl mx-auto text-balance text-center font-light">
                This platform isn't just a project; it's an invitation. It’s our starting line to build a community dedicated to better communication. To create something big, together.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Mission/Features Section */}
        <section id="features" className="bg-neutral-950 border-y border-white/5 py-24 px-6 relative">
          <div className="w-full max-w-7xl mx-auto relative z-10">
            <AnimateOnScroll className="flex flex-col items-center text-center mb-24">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-medium mb-4 block">Core Principles</span>
              <h2 className="text-4xl md:text-5xl font-bricolage font-light text-white mb-6">The Methodology</h2>
              <p className="text-neutral-500 text-lg max-w-xl font-light">From a raw idea to a polished post, our workflow is a disciplined reduction of chaos.</p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimateOnScroll delay={0.1} className="group bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white/5 text-white flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                  <Sparkles size={28} />
                </div>
                <span className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Phase I</span>
                <h3 className="text-xl font-bricolage font-medium mb-3">AI Formatting</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">Our AI intelligently structures your text, adding breaks and bolding for maximum impact.</p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={0.2} className="group bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white/5 text-white flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                  <ClipboardCheck size={28} />
                </div>
                <span className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Phase II</span>
                <h3 className="text-xl font-bricolage font-medium mb-3">Readability Score</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">Get instant, data-driven feedback on how clear and easy-to-read your content is.</p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={0.3} className="group bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white/5 text-white flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                  <BrainCircuit size={28} />
                </div>
                <span className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Phase III</span>
                <h3 className="text-xl font-bricolage font-medium mb-3">Tone Analysis</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">Ensure your message lands with the right tone, whether it's professional, casual, or inspirational.</p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={0.4} className="group bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white/5 text-white flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                  <Workflow size={28} />
                </div>
                <span className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Phase IV</span>
                <h3 className="text-xl font-bricolage font-medium mb-3">Community First</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">PostAI is built in public, for the community. Your feedback shapes our future.</p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Join Community Section */}
        <section id="mission" className="bg-[#f8f8f8] text-neutral-900 py-32 px-6 relative">
             <div className="w-full max-w-7xl mx-auto relative z-10 text-center">
                 <AnimateOnScroll>
                    <h2 className="text-3xl md:text-4xl font-black">Let's Build This Thing. Together.</h2>
                    <p className="mt-4 max-w-xl mx-auto text-neutral-500 text-lg">
                        Join the conversation. Share your insights. Be part of the foundation.
                    </p>
                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-neutral-900 text-white hover:bg-neutral-800">
                            <a href="https://chat.whatsapp.com/CbCQukJJUBIJv3hbx7Qin1" target="_blank" rel="noopener noreferrer">
                                Join the WhatsApp Community <MessageCircle className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background text-foreground border-t py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                         <img src="https://i.ibb.co/tPC17k0F/free-linkedin-logo-3d-icon-png-download-12257269.webp" alt="PostAI Logo" className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bricolage font-semibold">PostAI</h2>
                </div>
                <p className="text-muted-foreground max-w-xs mb-8">
                   Clarity in every post. We build tools for the next generation of professional communication.
                </p>
                <div className="flex gap-2">
                     <a href="https://github.com/bello-alternative/formatiq" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Github size={18}/>
                    </a>
                     <a href="https://x.com/dev_imam" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
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
                <Link href="#story" className="text-muted-foreground hover:text-primary transition-colors">Our Story</Link>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
            </div>
            
             <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg mb-2">Connect</h4>
                <a href="https://github.com/bello-alternative/formatiq" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">GitHub</a>
                <a href="https://www.linkedin.com/in/imam-bello" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">LinkedIn</a>
                 <a href="https://chat.whatsapp.com/CbCQukJJUBIJv3hbx7Qin1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">WhatsApp</a>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PostAI. Built by Imam Bello.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <p>All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default StoryPage;
