import { ImageResponse } from 'next/og';
 
// Route segment config
export const runtime = 'edge';
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
        <svg 
            viewBox="0 0 200 200" 
            width="100%"
            height="100%"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
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
                    <stop stopColor="#f472b6" />
                    <stop offset="1" stopColor="#e81cff" />
                </linearGradient>
            </defs>
        </svg>
    ),
    {
      ...size,
    }
  );
}
