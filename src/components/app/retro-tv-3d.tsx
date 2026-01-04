
"use client";

import React from 'react';
import { Sparkle, FileSignature, Mic, Bot, Code } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const postImageUrl = 'https://i.ibb.co/x9V4H82/20251208-0847-Linked-In-Post-Design-remix-01kbyesaq2emfrkznsprtzrcwf.png';

const GlassBox = ({ className, children, z = 20, rotateX = 0, rotateY = 0, onClick }: { className?: string, children: React.ReactNode, z?: number, rotateX?: number, rotateY?: number, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={cn(
            "absolute rounded-lg border border-black/10 bg-white/50 backdrop-blur-md p-2 text-black shadow-lg cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-2xl",
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
    { key: 'Readability Score', Icon: FileSignature, label: "Readability Score", className: "text-green-600" },
    { key: 'Tone Analysis', Icon: Mic, label: "Tone Analysis", className: "text-blue-500" },
    { key: 'Smart Lists', Icon: Bot, label: "Smart Lists", className: "text-purple-500" },
    { key: 'Rich Text Copy', Icon: Code, label: "Rich Text Copy", className: "text-red-500" },
];

export function RetroTv3d({ onBoxClick }: { onBoxClick: (feature: any) => void }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = React.useState({ x: -15, y: 20 });
  const [isHovering, setIsHovering] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = (currentTarget as HTMLElement).getBoundingClientRect();
      
      const x = (clientX - left) / width; // 0 to 1
      const y = (clientY - top) / height; // 0 to 1

      const newRotationY = 20 - (x * 40); // from 20 to -20
      const newRotationX = -20 + (y * 40); // from -20 to 20

      setRotation({ x: newRotationX, y: newRotationY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      setRotation({ x: -15, y: 20 });
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

  const phoneRotation = isHovering ? { x: rotation.x / 12, y: rotation.y / 12 } : { x: 0, y: 0 };
  const boxRotation = isHovering ? { x: rotation.x, y: rotation.y } : { x: -15, y: 20 };

  if (isMobile) {
    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="relative w-full max-w-xs">
                <img src={postImageUrl} alt="LinkedIn Post Preview" className="h-auto w-full object-contain rounded-2xl shadow-2xl" />
            </div>
            <div className="w-full max-w-xs grid grid-cols-1 gap-3">
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
    <div ref={containerRef} className="relative h-full w-full [perspective:1200px]">
        <div 
            className="absolute inset-0 h-full w-full [transform-style:preserve-3d] transition-transform duration-300 ease-out"
            style={{ transform: `rotateX(${boxRotation.x}deg) rotateY(${boxRotation.y}deg)` }}
        >
             <GlassBox className="top-[15%] -left-4 flex items-center gap-1.5 text-xs font-medium" z={80} onClick={() => onBoxClick('AI Formatting')}>
                <Sparkle className="h-3 w-3 text-yellow-500 fill-yellow-400" />
                <span>AI Formatting</span>
             </GlassBox>

             <GlassBox className="top-[45%] -left-12 flex flex-col items-center text-xs font-medium" z={60} onClick={() => onBoxClick('Readability Score')}>
                <FileSignature className="h-4 w-4 text-green-600" />
                <span className='mt-1'>Readability</span>
                <span className='font-bold text-sm'>92/100</span>
             </GlassBox>
             
             <GlassBox className="top-[20%] -right-4 flex items-center gap-1.5 text-xs font-medium" z={70} onClick={() => onBoxClick('Tone Analysis')}>
                <Mic className="h-3 w-3 text-blue-500" />
                <span>Tone Analysis</span>
             </GlassBox>

             <GlassBox className="bottom-[30%] -right-8 flex flex-col items-center text-xs font-medium" z={90} onClick={() => onBoxClick('Smart Lists')}>
                <Bot className="h-4 w-4 text-purple-500" />
                 <span className='mt-1'>Smart Lists</span>
             </GlassBox>

             <GlassBox className="bottom-8 -left-8 flex items-center gap-1.5 text-xs font-medium" z={90} onClick={() => onBoxClick('Rich Text Copy')}>
                <Code className="h-3 w-3 text-red-500" />
                <span>Rich Text</span>
             </GlassBox>
        </div>

        <div 
            className="absolute inset-0 h-full w-full [transform-style:preserve-3d] transition-transform duration-700 ease-out"
            style={{ transform: `rotateX(${phoneRotation.x}deg) rotateY(${phoneRotation.y}deg)` }}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative h-full w-full max-w-sm" style={{ transform: 'translateZ(20px)'}}>
                    <img src={postImageUrl} alt="LinkedIn Post Preview" className="h-auto w-full object-contain rounded-2xl shadow-2xl" />
                 </div>
            </div>
        </div>
    </div>
  );
}
