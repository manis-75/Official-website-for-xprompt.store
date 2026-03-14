import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 800 500" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE08B" />
        <stop offset="30%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#AA7C11" />
        <stop offset="70%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#FDE08B" />
      </linearGradient>
    </defs>
    <g fill="url(#goldGradient)">
      {/* X */}
      <path d="M100 100 L250 100 L350 250 L450 100 L600 100 L425 300 L600 500 L450 500 L350 350 L250 500 L100 500 L275 300 Z" />
      {/* P */}
      <path d="M480 100 L650 100 C750 100 800 150 800 250 C800 350 750 400 650 400 L580 400 L580 500 L480 500 Z M580 200 L580 300 L650 300 C700 300 700 200 650 200 Z" />
      {/* Wave */}
      <path d="M50 280 Q 250 150 400 280 T 750 280 L 750 320 Q 600 450 400 320 T 50 320 Z" />
    </g>
  </svg>
);
