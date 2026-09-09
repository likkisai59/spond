"use client";

import { getPasswordStrength } from "@/utils/validations";

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color, checks } = getPasswordStrength(password);

  return (
    <div className="mt-1.5 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              n <= score ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      {/* Label */}
      <p className="text-[11px] text-muted-foreground">
        Strength:{" "}
        <span
          className={`font-bold ${
            score <= 1
              ? "text-red-500"
              : score === 2
              ? "text-orange-500"
              : score === 3
              ? "text-yellow-500"
              : score === 4
              ? "text-blue-500"
              : "text-emerald-500"
          }`}
        >
          {label}
        </span>
      </p>
      {/* Checklist */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {[
          { key: "minLength", text: "8+ characters" },
          { key: "uppercase", text: "Uppercase letter" },
          { key: "lowercase", text: "Lowercase letter" },
          { key: "number", text: "Number (0–9)" },
          { key: "special", text: "Special character" },
        ].map(({ key, text }) => (
          <li
            key={key}
            className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${
              checks[key as keyof typeof checks]
                ? "text-emerald-500"
                : "text-muted-foreground"
            }`}
          >
            <span>{checks[key as keyof typeof checks] ? "✓" : "○"}</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
