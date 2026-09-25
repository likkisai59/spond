"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

import { COUNTRY_CODES } from "@/constants/countries";

// ── Component Props ───────────────────────────────────────────────────────────

interface PhoneInputFieldProps {
  value?: string;           // full value like "+91 9876543210"
  onChange?: (fullValue: string) => void;
  error?: string;
  disabled?: boolean;
  id?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PhoneInputField({ value, onChange, error, disabled, id }: PhoneInputFieldProps) {
  // Parse stored value back into countryCode + number
  const parseValue = React.useCallback((v: string) => {
    if (!v) return { code: "+91", number: "" };
    // Sort descending by code length so longer codes (e.g. +880) match before (+8)
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sorted) {
      if (v.startsWith(c.code + " ")) {
        return {
          code: c.code,
          number: v.slice(c.code.length + 1).replace(/\D/g, "").slice(0, c.digits),
        };
      }
      if (v.startsWith(c.code)) {
        return {
          code: c.code,
          number: v.slice(c.code.length).replace(/\D/g, "").slice(0, c.digits),
        };
      }
    }
    return { code: "+91", number: v.replace(/^\+\d+\s*/, "").replace(/\D/g, "").slice(0, 10) };
  }, []);

  const initialParsed = React.useMemo(() => parseValue(value || ""), [value, parseValue]);
  const [selectedCode, setSelectedCode] = React.useState(initialParsed.code);
  const [localNumber, setLocalNumber] = React.useState(initialParsed.number);

  // Keep internal state synchronized with external prop updates (form resets, profile loads)
  React.useEffect(() => {
    const p = parseValue(value || "");
    setSelectedCode(p.code);
    setLocalNumber(p.number);
  }, [value, parseValue]);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === selectedCode) ?? COUNTRY_CODES[0];
  const maxDigits = selectedCountry.digits;

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCode(code);
    const targetCountry = COUNTRY_CODES.find((c) => c.code === code) ?? COUNTRY_CODES[0];
    // Retain existing digits up to new country's limit
    const trimmedNumber = localNumber.slice(0, targetCountry.digits);
    setLocalNumber(trimmedNumber);
    onChange?.(trimmedNumber ? `${code} ${trimmedNumber}` : `${code} `);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits, cap at country's maximum digits
    const cleanDigits = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
    setLocalNumber(cleanDigits);
    onChange?.(`${selectedCode} ${cleanDigits}`);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const cleanDigits = pastedText.replace(/\D/g, "").slice(0, maxDigits);
    setLocalNumber(cleanDigits);
    onChange?.(`${selectedCode} ${cleanDigits}`);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <select
          value={selectedCode}
          onChange={handleCodeChange}
          disabled={disabled}
          className="h-10 rounded-xl border border-border bg-card text-foreground text-xs px-2.5 focus:outline-none focus:ring-1 focus:ring-primary shrink-0 min-w-[140px] max-w-[200px]"
          aria-label="Country code"
        >
          {COUNTRY_CODES.map((country) => (
            <option key={`${country.name}-${country.code}`} value={country.code}>
              {country.flag} {country.code} ({country.name})
            </option>
          ))}
        </select>

        {/* Phone Number Input */}
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={`Enter ${maxDigits} digits`}
          value={localNumber}
          onChange={handleNumberChange}
          onPaste={handlePaste}
          disabled={disabled}
          maxLength={maxDigits}
          className="text-foreground text-xs bg-card border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary flex-1 h-10"
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {selectedCountry.flag} {selectedCountry.name}: <span className="font-semibold text-foreground">{selectedCountry.code}</span> followed by <span className="font-semibold text-foreground">{maxDigits} digits</span> only
      </p>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
}

