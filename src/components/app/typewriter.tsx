"use client";

export function Typewriter({ text }: { text: string }) {
    return (
        <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-2 shadow-lg shadow-primary/10">
            <p className="text-primary font-medium text-sm md:text-base">
                {text}
            </p>
        </div>
    )
}