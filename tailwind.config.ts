import type { Config } from "tailwindcss";

const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stores/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFDF8",
        "cream-2": "#FFF7EC",
        "milk-purple": "#7C3AED",
        "milk-purple-light": "#A78BFA",
        "milk-purple-soft": "#F3E8FF",
        "bean-ink": "#1F1B3A",
        "bean-muted": "#7A7390",
        "bean-border": "#E9E1F7",
        "bean-success": "#46B96C",
        "bean-warning": "#F5A524",
        "bean-danger": "#EF5A6F"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(124, 58, 237, 0.12)",
        bead: "0 10px 28px rgba(124, 58, 237, 0.18)",
        insetSoft: "inset 0 1px 0 rgba(255, 255, 255, 0.78)"
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem"
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif"
        ]
      },
      backgroundImage: {
        "cream-radial":
          "radial-gradient(circle at 18% 10%, rgba(167,139,250,0.18), transparent 28rem), radial-gradient(circle at 85% 16%, rgba(251,113,133,0.10), transparent 22rem), linear-gradient(180deg, #FFFDF8 0%, #FFFAF1 46%, #F8F2FF 100%)",
        "purple-button": "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
