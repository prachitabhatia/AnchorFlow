import React from 'react';

/**
 * Shared Button component with class name and props passthrough.
 */
export default function Button({ children, className = '', variant = 'primary', ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
