"use client";

import React from 'react';
import { Sparkle, FileSignature, Mic, Bot, Code, Palette } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const postImageUrl = 'https://i.ibb.co/G47L86Py/White-and-Black-Minimalist-Phone-Mockup-Instagram-Story-removebg-preview.png';

const GlassBox = ({ className, children, z = 20, rotateX = 0, rotateY = 0, onClick }: { className?: string, children: React.ReactNode, z?: number, rotateX?: number, rotateY?: number, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={cn(
            "absolute rounded-lg border border-black/10 bg-white/70 backdrop-blur-md p-2.5 text-black shadow-lg cursor-pointer transition-all duration-300 hover:scale-140 hover:shadow-2xl flex items-center gap-2 text-xs font-semibold whitespace-nowrap",
            className
        )}
        style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${z}px)`,
            transformStyle: 'preserve-3d',
        }}
    >
        {children}
    </div>
);

const MobileFeatureBox = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
    <div
        onClick={onClick}
        className={cn("rounded-lg border border-border bg-background/50 backdrop-blur-sm p-3 text-foreground shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105 hover:bg-accent flex items-center gap-3", className)}
    >
        {children}
    </div>
);

const features = [
    { key: 'AI Formatting', Icon: Sparkle, label: "AI Formatting", className: "text-yellow-500 fill-yellow-400" },
    { key: 'Readability Score', Icon: FileSignature, label: "Readability: 92/100", className: "text-green-600" },
    { key: 'Tone Analysis', Icon: Mic, label: "Tone Analysis", className: "text-blue-500" },
    { key: 'Smart Lists', Icon: Bot, label: "Smart Lists", className: "text-purple-500" },
    { key: 'Rich Text Copy', Icon: Code, label: "Rich Text Copy", className: "text-red-500" },
    { key: 'Text Styling', Icon: Palette, label: "Text Styling", className: "text-orange-500" },
];

export function RetroTv3d({ onBoxClick }: { onBoxClick: (feature: any) => void }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = React.useState({ x: -10, y: 15 });
  const [isHovering, setIsHovering] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = (currentTarget as HTMLElement).getBoundingClientRect();
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      const newRotationY = 15 - (x * 30); 
      const newRotationX = -15 + (y * 30);
      setRotation({ x: newRotationX, y: newRotationY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      setRotation({ x: -10, y: 15 });
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    container?.addEventListener('mouseenter', handleMouseEnter);
    container?.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('mouseenter', handleMouseEnter);
      container?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile]);

  const phoneRotation = isHovering ? { x: rotation.x / 10, y: rotation.y / 10 } : { x: 0, y: 0 };
  const boxRotation = isHovering ? { x: rotation.x, y: rotation.y } : { x: -10, y: 15 };

  if (isMobile) {
    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="relative w-full max-w-xs mt-12">
                <img src={postImageUrl} alt="LinkedIn Post Preview" className="h-auto w-full object-contain rounded-2xl shadow-2xl" />
            </div>
            <div className="w-full max-w-xs grid grid-cols-1 gap-3 mb-16">
                {features.map(({ key, Icon, label, className }) => (
                     <MobileFeatureBox key={key} onClick={() => onBoxClick(key)}>
                        <Icon className={cn("h-5 w-5", className)} />
                        <span className="font-medium text-sm">{label}</span>
                     </MobileFeatureBox>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-full w-full [perspective:1500px] flex items-center justify-center">
        {/* CARDS LAYER */}
        <div 
            className="absolute inset-0 h-full w-full [transform-style:preserve-3d] transition-transform duration-500 ease-out pointer-events-none"
            style={{ transform: `rotateX(${boxRotation.x}deg) rotateY(${boxRotation.y}deg)` }}
        >
            <div className="relative w-full h-full pointer-events-auto">
                {/* Top Left */}
                <GlassBox className="top-[12%] left-[15%]" z={180} onClick={() => onBoxClick('AI Formatting')}>
                    <Sparkle className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                    <span>AI Formatting</span>
                </GlassBox>

                {/* Center Left */}
                <GlassBox className="top-[48%] left-[5%]" z={220} onClick={() => onBoxClick('Readability Score')}>
                    <FileSignature className="h-4 w-4 text-green-600" />
                    <span>Readability: 92/100</span>
                </GlassBox>

                {/* Bottom Left */}
                <GlassBox className="bottom-[12%] left-[15%]" z={180} onClick={() => onBoxClick('Rich Text Copy')}>
                    <Code className="h-4 w-4 text-red-500" />
                    <span>Rich Text Copy</span>
                </GlassBox>

                {/* Top Right */}
                <GlassBox className="top-[12%] right-[15%]" z={180} onClick={() => onBoxClick('Tone Analysis')}>
                    <Mic className="h-4 w-4 text-blue-500" />
                    <span>Tone Analysis</span>
                </GlassBox>

                {/* Center Right */}
                <GlassBox className="top-[48%] right-[5%]" z={220} onClick={() => onBoxClick('Text Styling')}>
                    <Palette className="h-4 w-4 text-orange-500" />
                    <span>Text Styling</span>
                </GlassBox>

                {/* Bottom Right */}
                <GlassBox className="bottom-[12%] right-[15%]" z={180} onClick={() => onBoxClick('Smart Lists')}>
                    <Bot className="h-4 w-4 text-purple-500" />
                    <span>Smart Lists</span>
                </GlassBox>
            </div>
        </div>

        {/* PHONE LAYER */}
        <div 
            className="absolute inset-0 h-full w-full [transform-style:preserve-3d] transition-transform duration-700 ease-out pointer-events-none"
            style={{ transform: `rotateX(${phoneRotation.x}deg) rotateY(${phoneRotation.y}deg)` }}
        >
            <div className="absolute inset-0 flex items-center justify-center">
<div
  className="
    relative
    h-[180%]
    w-auto
    aspect-[9/19]
    max-w-[clamp(320px,40vw,1000px)]
  "
  style={{ transform: 'translateZ(240px)' }}
>
  <img
    src={postImageUrl}
    alt="LinkedIn Post Preview"
    className="h-full w-full object-contain drop-shadow-2xl"
  />
</div>


            </div>
        </div>
    </div>
  );
}