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
        <div className="flex items-center gap-3">
            <svg 
                viewBox="0 0 200 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={finalClassName}
            >
                {/* Background Shape */}
                <rect width="200" height="200" rx="40" fill="url(#paint0_linear)" />
                
                {/* Stylized 'C' */}
                <path 
                    d="M130 50C100 50 60 70 60 100C60 130 100 150 130 150" 
                    stroke="white" 
                    strokeWidth="24" 
                    strokeLinecap="round"
                />
                
                {/* Play Button integrated */}
                <path 
                    d="M110 70L150 100L110 130V70Z" 
                    fill="white"
                />

                {/* Gradients */}
                <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0ea5e9" /> {/* Premium Sky Blue */}
                        <stop offset="1" stopColor="#2563eb" /> {/* Deep Royal Blue */}
                    </linearGradient>
                </defs>
            </svg>
            
            {showText && (
                <span className="text-white font-black italic tracking-tighter text-lg">
                    CUAN<span className="text-primary">FLIX</span>
                </span>
            )}
        </div>
    );
}
