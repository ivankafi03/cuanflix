import React from "react";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
}

export default function Logo({ className = "", size = "md", showText = true }: LogoProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-20 h-20"
    };

    const finalClassName = `${sizeClasses[size]} ${className}`;

    return (
        <div className="flex items-center gap-2.5">
            <img 
                src="/cuanflix_logo_hd.png" 
                alt="Cuanflix Logo" 
                className={`${finalClassName} object-contain`}
            />
            
            {showText && (
                <span className="text-white font-black italic tracking-tighter text-lg select-none">
                    CUAN<span className="text-sky-400">FLIX</span>
                </span>
            )}
        </div>
    );
}
