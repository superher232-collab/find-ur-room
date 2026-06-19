import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED", // Modern Purple
        primaryDark: "#6D28D9",
        primaryLight: "#EFF6FF", // Light purple badge bg
        secondary: "#0D0B14", // Dark Charcoal
        success: "#10B981", // Teal/Emerald
        successLight: "#F0FDED",
        error: "#EF4444", // Red
        errorDark: "#DC2626",
        errorLight: "#FEE2E2",
        warning: "#F59E0B", // Amber
        warningLight: "#FEF3C7",
        background: "#FFFFFF",
        surface: "#F9FAFB", // Light Gray
        border: "#E5E7EB", // Medium Gray
        muted: "#6B7280", // Dark Gray
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Menlo", "Monaco", "Courier New", "monospace"],
      },
      fontSize: {
        h1: ["28px", { lineHeight: "36px", letterSpacing: "-0.5px", fontWeight: "700" }],
        h2: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "22.4px", fontWeight: "600" }],
        body: ["14px", { lineHeight: "22px", fontWeight: "400" }],
        bodySmall: ["13px", { lineHeight: "19.5px", fontWeight: "400" }],
        label: ["12px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "600" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        large: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        base: "8px",
        card: "12px",
        pill: "20px",
      },
      keyframes: {
        "button-press": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
        "dropdown-slide": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "success-bounce": {
          "0%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "error-slide": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "button-press": "button-press 100ms ease-out",
        "dropdown-slide": "dropdown-slide 150ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "success-bounce": "success-bounce 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "error-slide": "error-slide 200ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
        pulse: "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
