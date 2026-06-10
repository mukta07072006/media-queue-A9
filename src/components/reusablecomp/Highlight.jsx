import React from 'react';


export const Highlight = ({ children, className = '' }) => {
  return (
    <span className={`relative z-10 mx-2 inline-block bg-[#d4e9d6] px-1 text-[#185536] ${className}`}>
      
      {/* Left Handle (Line + Top Circle) */}
      <span className="absolute -left-[2px] top-0 h-full w-[2px] bg-[#3a8b5a]">
        <span className="absolute -left-[4px] -top-[4px] h-2.5 w-2.5 rounded-full bg-[#3a8b5a]"></span>
      </span>

      {/* The dynamically passed text */}
      {children}

      {/* Right Handle (Line + Bottom Circle) */}
      <span className="absolute -right-[2px] top-0 h-full w-[2px] bg-[#3a8b5a]">
        <span className="absolute -bottom-[4px] -left-[4px] h-2.5 w-2.5 rounded-full bg-[#3a8b5a]"></span>
      </span>
      
    </span>
  );
};