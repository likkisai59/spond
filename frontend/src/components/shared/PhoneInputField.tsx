"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

// ── Country Codes with phone digit lengths ────────────────────────────────────
export interface CountryCode {
  name: string;
  flag: string;
  code: string;   // e.g. "+91"
  digits: number; // exact number of local digits expected
}

export const COUNTRY_CODES: CountryCode[] = [
  // Primary / Frequently used
  { name: "India", flag: "🇮🇳", code: "+91", digits: 10 },
  { name: "United States", flag: "🇺🇸", code: "+1", digits: 10 },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44", digits: 10 },
  { name: "Canada", flag: "🇨🇦", code: "+1", digits: 10 },
  { name: "Australia", flag: "🇦🇺", code: "+61", digits: 9 },
  { name: "UAE", flag: "🇦🇪", code: "+971", digits: 9 },
  { name: "Saudi Arabia", flag: "🇸🇦", code: "+966", digits: 9 },
  { name: "Singapore", flag: "🇸🇬", code: "+65", digits: 8 },
  { name: "Malaysia", flag: "🇲🇾", code: "+60", digits: 9 },
  { name: "Germany", flag: "🇩🇪", code: "+49", digits: 10 },
  { name: "France", flag: "🇫🇷", code: "+33", digits: 9 },

  // Asia & Middle East
  { name: "Afghanistan", flag: "🇦🇫", code: "+93", digits: 9 },
  { name: "Bahrain", flag: "🇧🇭", code: "+973", digits: 8 },
  { name: "Bangladesh", flag: "🇧🇩", code: "+880", digits: 10 },
  { name: "Bhutan", flag: "🇧🇹", code: "+975", digits: 8 },
  { name: "China", flag: "🇨🇳", code: "+86", digits: 11 },
  { name: "Hong Kong", flag: "🇭🇰", code: "+852", digits: 8 },
  { name: "Indonesia", flag: "🇮🇩", code: "+62", digits: 10 },
  { name: "Iran", flag: "🇮🇷", code: "+98", digits: 10 },
  { name: "Iraq", flag: "🇮🇶", code: "+964", digits: 10 },
  { name: "Israel", flag: "🇮🇱", code: "+972", digits: 9 },
  { name: "Japan", flag: "🇯🇵", code: "+81", digits: 10 },
  { name: "Jordan", flag: "🇯🇴", code: "+962", digits: 9 },
  { name: "Kazakhstan", flag: "🇰🇿", code: "+7", digits: 10 },
  { name: "Kuwait", flag: "🇰🇼", code: "+965", digits: 8 },
  { name: "Lebanon", flag: "🇱🇧", code: "+961", digits: 8 },
  { name: "Maldives", flag: "🇲🇻", code: "+960", digits: 7 },
  { name: "Myanmar", flag: "🇲🇲", code: "+95", digits: 9 },
  { name: "Nepal", flag: "🇳🇵", code: "+977", digits: 10 },
  { name: "Oman", flag: "🇴🇲", code: "+968", digits: 8 },
  { name: "Pakistan", flag: "🇵🇰", code: "+92", digits: 10 },
  { name: "Philippines", flag: "🇵🇭", code: "+63", digits: 10 },
  { name: "Qatar", flag: "🇶🇦", code: "+974", digits: 8 },
  { name: "South Korea", flag: "🇰🇷", code: "+82", digits: 10 },
  { name: "Sri Lanka", flag: "🇱🇰", code: "+94", digits: 9 },
  { name: "Taiwan", flag: "🇹🇼", code: "+886", digits: 9 },
  { name: "Thailand", flag: "🇹🇭", code: "+66", digits: 9 },
  { name: "Turkey", flag: "🇹🇷", code: "+90", digits: 10 },
  { name: "Uzbekistan", flag: "🇺🇿", code: "+998", digits: 9 },
  { name: "Vietnam", flag: "🇻🇳", code: "+84", digits: 9 },
  { name: "Yemen", flag: "🇾🇪", code: "+967", digits: 9 },

  // Europe
  { name: "Austria", flag: "🇦🇹", code: "+43", digits: 10 },
  { name: "Belgium", flag: "🇧🇪", code: "+32", digits: 9 },
  { name: "Bulgaria", flag: "🇧🇬", code: "+359", digits: 9 },
  { name: "Croatia", flag: "🇭🇷", code: "+385", digits: 9 },
  { name: "Cyprus", flag: "🇨🇾", code: "+357", digits: 8 },
  { name: "Czech Republic", flag: "🇨🇿", code: "+420", digits: 9 },
  { name: "Denmark", flag: "🇩🇰", code: "+45", digits: 8 },
  { name: "Finland", flag: "🇫🇮", code: "+358", digits: 9 },
  { name: "Greece", flag: "🇬🇷", code: "+30", digits: 10 },
  { name: "Hungary", flag: "🇭🇺", code: "+36", digits: 9 },
  { name: "Iceland", flag: "🇮🇸", code: "+354", digits: 7 },
  { name: "Ireland", flag: "🇮🇪", code: "+353", digits: 9 },
  { name: "Italy", flag: "🇮🇹", code: "+39", digits: 10 },
  { name: "Luxembourg", flag: "🇱🇺", code: "+352", digits: 9 },
  { name: "Netherlands", flag: "🇳🇱", code: "+31", digits: 9 },
  { name: "Norway", flag: "🇳🇴", code: "+47", digits: 8 },
  { name: "Poland", flag: "🇵🇱", code: "+48", digits: 9 },
  { name: "Portugal", flag: "🇵🇹", code: "+351", digits: 9 },
  { name: "Romania", flag: "🇷🇴", code: "+40", digits: 9 },
  { name: "Russia", flag: "🇷🇺", code: "+7", digits: 10 },
  { name: "Serbia", flag: "🇷🇸", code: "+381", digits: 9 },
  { name: "Slovakia", flag: "🇸🇰", code: "+421", digits: 9 },
  { name: "Spain", flag: "🇪🇸", code: "+34", digits: 9 },
  { name: "Sweden", flag: "🇸🇪", code: "+46", digits: 9 },
  { name: "Switzerland", flag: "🇨🇭", code: "+41", digits: 9 },
  { name: "Ukraine", flag: "🇺🇦", code: "+380", digits: 9 },

  // Americas
  { name: "Argentina", flag: "🇦🇷", code: "+54", digits: 10 },
  { name: "Brazil", flag: "🇧🇷", code: "+55", digits: 11 },
  { name: "Chile", flag: "🇨🇱", code: "+56", digits: 9 },
  { name: "Colombia", flag: "🇨🇴", code: "+57", digits: 10 },
  { name: "Costa Rica", flag: "🇨🇷", code: "+506", digits: 8 },
  { name: "Ecuador", flag: "🇪🇨", code: "+593", digits: 9 },
  { name: "Mexico", flag: "🇲🇽", code: "+52", digits: 10 },
  { name: "Panama", flag: "🇵🇦", code: "+507", digits: 8 },
  { name: "Peru", flag: "🇵🇪", code: "+51", digits: 9 },
  { name: "Uruguay", flag: "🇺🇾", code: "+598", digits: 8 },
  { name: "Venezuela", flag: "🇻🇪", code: "+58", digits: 10 },

  // Africa & Oceania
  { name: "Algeria", flag: "🇩🇿", code: "+213", digits: 9 },
  { name: "Egypt", flag: "🇪🇬", code: "+20", digits: 10 },
  { name: "Ethiopia", flag: "🇪🇹", code: "+251", digits: 9 },
  { name: "Ghana", flag: "🇬🇭", code: "+233", digits: 9 },
  { name: "Kenya", flag: "🇰🇪", code: "+254", digits: 9 },
  { name: "Morocco", flag: "🇲🇦", code: "+212", digits: 9 },
  { name: "New Zealand", flag: "🇳🇿", code: "+64", digits: 9 },
  { name: "Nigeria", flag: "🇳🇬", code: "+234", digits: 10 },
  { name: "South Africa", flag: "🇿🇦", code: "+27", digits: 9 },
  { name: "Tanzania", flag: "🇹🇿", code: "+255", digits: 9 },
  { name: "Uganda", flag: "🇺🇬", code: "+256", digits: 9 },
  { name: "Zimbabwe", flag: "🇿🇼", code: "+263", digits: 9 },
];

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

