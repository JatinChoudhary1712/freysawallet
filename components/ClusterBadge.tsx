"use client";

import Image from 'next/image';
import { useState } from 'react';

export function ClusterBadge() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="absolute top-6 left-6 animate-pulse [animation-duration:3s]">
      <div className="relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-purple-600/20 blur-md rounded-[22%]" />
        
        {/* Cleaner badge */}
        <div className="relative rounded-[22%] 
                      overflow-hidden
                      w-16 h-16">
          <Image 
            src="/cluster-logo.jpg"
            alt="Cluster Protocol"
            fill
            className="object-cover rounded-[22%]"
            priority
            unoptimized={true}
            onError={() => setImageError(true)}
            loading="eager"
          />

          {/* Smoother shine effect */}
          <div className="absolute inset-0 animate-diagonal-shine">
            <div className="absolute top-0 left-0 w-[150%] h-[150%] 
                          bg-gradient-to-r from-transparent via-white/15 to-transparent 
                          -rotate-45 transform-gpu transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
} 