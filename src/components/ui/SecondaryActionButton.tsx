import React from "react";

export interface SecondaryActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  label?: string;
  onCancelOrBack?: () => void;
  className?: string;
}

/**
 * Standard WCAG AA Secondary Action Button
 * Compliant with 4.5:1 contrast on dark and light surfaces.
 */
export const SecondaryActionButton: React.FC<SecondaryActionButtonProps> = ({
  children = "Cancel / Back",
  label,
  onCancelOrBack,
  onClick,
  className = "",
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (onCancelOrBack) {
      onCancelOrBack();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-4 py-2 text-sm font-medium text-slate-100 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors ${className}`}
      {...props}
    >
      {label || children}
    </button>
  );
};

export default SecondaryActionButton;
