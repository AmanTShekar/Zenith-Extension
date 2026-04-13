import React, { useState, useRef, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScrubInputProps {
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  onChange: (val: number) => void;
  onCommit?: (val: number) => void;
  className?: string;
  label?: string;
}

export function ScrubInput({
  value,
  unit = '',
  min = -Infinity,
  max = Infinity,
  step = 1,
  decimals = 0,
  onChange,
  onCommit,
  className,
  label,
}: ScrubInputProps) {
  const [editing, setEditing] = useState(false);
  const startX = useRef(0);
  const startVal = useRef(0);
  const dragging = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  const onMouseDown = (e: React.MouseEvent) => {
    if (editing) return;
    e.preventDefault();
    dragging.current = false;
    startX.current = e.clientX;
    startVal.current = value;

    const onMove = (me: MouseEvent) => {
      const delta = (me.clientX - startX.current) * step;
      if (Math.abs(delta) > 2) dragging.current = true;
      if (dragging.current) {
        onChange(clamp(startVal.current + delta));
      }
    };

    const onUp = (me: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (dragging.current) {
        const finalVal = clamp(startVal.current + (me.clientX - startX.current) * step);
        onCommit?.(finalVal);
      } else {
        setEditing(true);
      }
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'ew-resize';
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        {label && <span className="text-[9px] font-black text-white/20 uppercase mr-0.5">{label}</span>}
        <input
          ref={inputRef}
          className={cn(
            "font-mono text-[11px] text-white bg-base border border-accent/40 rounded-sm px-1.5 py-0.5 w-[64px] outline-none shadow-[0_0_20px_rgba(0,240,255,0.1)] text-right",
            className
          )}
          defaultValue={value.toFixed(decimals)}
          onBlur={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onCommit?.(clamp(val));
            setEditing(false);
          }}
          onKeyDown={(e) => {
            const val = parseFloat(e.currentTarget.value);
            if (e.key === 'Enter') {
              if (!isNaN(val)) onCommit?.(clamp(val));
              setEditing(false);
            }
            if (e.key === 'Escape') setEditing(false);
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              const next = clamp((isNaN(val) ? value : val) + step);
              e.currentTarget.value = next.toFixed(decimals);
              onChange(next);
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              const next = clamp((isNaN(val) ? value : val) - step);
              e.currentTarget.value = next.toFixed(decimals);
              onChange(next);
            }
          }}
        />
      </div>
    );
  }

  return (
    <span
      className={cn(
        "group/scrub flex items-center gap-1 font-mono text-[10px] text-white/90 bg-elevated border border-white/5 hover:border-accent/40 hover:bg-accent/5 rounded-sm pl-1.5 pr-1 py-0.5 min-w-[52px] text-right cursor-ew-resize select-none transition-all",
        className
      )}
      onMouseDown={onMouseDown}
    >
      {label && <span className="text-[9px] font-black text-white/10 group-hover/scrub:text-accent/60 transition-colors uppercase mr-0.5 pointer-events-none">{label}</span>}
      {value.toFixed(decimals)}
      <span className="text-white/20 ml-0.5 pointer-events-none text-[9px]">{unit}</span>
    </span>
  );
}
