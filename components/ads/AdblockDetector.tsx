"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";

export default function AdblockDetector() {
    const [isDetected, setIsDetected] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Detect after 2 seconds to allow ads to load
        const timer = setTimeout(() => {
            const adElement = document.createElement("div");
            adElement.className = "ad-unit ad-banner pub_300x250 pub_728x90 text-ad ads-box";
            adElement.setAttribute("style", "position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px;");
            document.body.appendChild(adElement);

            // If the element's height is 0 or it's hidden, adblock is likely active
            const isBlocked = window.getComputedStyle(adElement).display === "none" || adElement.offsetHeight === 0;
            setIsDetected(isBlocked);
            
            document.body.removeChild(adElement);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!isDetected || !isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-[#1A1A1E] border border-primary/20 p-5 rounded-2xl shadow-2xl shadow-black/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16" />
                
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex gap-4 items-start relative z-10">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/10">
                        <ShieldAlert className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">Adblock Detected</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Please disable your Adblocker to support us and keep this platform free. Thank you for your support!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
