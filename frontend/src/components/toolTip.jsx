// src/components/Tooltip.jsx
import React from "react";

const Tooltip = ({ children, text }) => {
    return (
        <div className="relative group">
            {children}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2
                      px-2 py-1 text-sm text-white bg-black rounded
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      z-50 whitespace-nowrap">
                {text}
            </div>
        </div>
    );
};

export default Tooltip;
