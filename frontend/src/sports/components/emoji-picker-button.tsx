"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMOJI_GROUPS = [
  {
    label: "Frequent",
    emojis: ["👍", "👎", "🙏", "🔥", "🎉", "✅", "❤️", "😂"],
  },
  {
    label: "Smileys",
    emojis: ["😄", "😃", "😁", "🙂", "😉", "😊", "😍", "🤩", "😎", "🤔", "😅", "😆", "😴", "🤗", "😇", "🙃"],
  },
  {
    label: "Sports & music",
    emojis: ["⚽", "🏏", "🏀", "🎾", "🏆", "🥇", "🎸", "🎤", "🥁", "🎵", "🎶", "🎼"],
  },
  {
    label: "More",
    emojis: ["👏", "💪", "🤝", "📅", "⏰", "📍", "💡", "🚀", "☕", "🍕", "💰", "✨"],
  },
] as const;

export interface EmojiPickerButtonProps {
  onPick: (emoji: string) => void;
}

export function EmojiPickerButton({ onPick }: EmojiPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const handlePick = (emoji: string) => {
    onPick(emoji);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen((current) => !current)}
        aria-label="Insert emoji"
        aria-expanded={open}
      >
        <Smile />
      </Button>

      {open ? (
        <div className="absolute bottom-full left-0 z-40 mb-2 w-72 animate-fade-in-up rounded-xl border border-border/70 bg-card p-3 shadow-elevated">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="mb-2 last:mb-0">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePick(emoji)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-base transition-transform hover:scale-125 hover:bg-muted"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
