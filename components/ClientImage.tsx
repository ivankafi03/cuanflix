"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface ClientImageProps extends Omit<ImageProps, "onError"> {
    fallback?: string;
}

export default function ClientImage({ src, fallback = "/placeholder-poster.png", alt, ...props }: ClientImageProps) {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => setImgSrc(fallback)}
        />
    );
}
