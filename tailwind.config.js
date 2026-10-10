/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#18191b",
        muted: "#5c5e63",
        paper: "#ffffff",
        surface: "#f5f5f5",
        border: "#e4e4e4",
        "control-border": "#8a8c91",
        accent: {
          DEFAULT: "#ffc400",
          surface: "#fff4cc",
        },
        success: {
          DEFAULT: "#1e7a44",
          surface: "#e7f2eb",
        },
        warn: "#b45309",
        danger: {
          DEFAULT: "#c42b1c",
          surface: "#fbecea",
        },
        "on-ink": {
          DEFAULT: "#ffffff",
          muted: "#b8b9bd",
          subtle: "#86888d",
          border: "#3a3b3f",
          "control-border": "#75777c",
        },
      },
      fontFamily: {
        sans: ["Archivo_400Regular"],
        "sans-medium": ["Archivo_500Medium"],
        "sans-semibold": ["Archivo_600SemiBold"],
        "sans-bold": ["Archivo_700Bold"],
        "sans-extrabold": ["Archivo_800ExtraBold"],
        "sans-black": ["Archivo_900Black"],
        mono: ["IBMPlexMono_400Regular"],
        "mono-bold": ["IBMPlexMono_700Bold"],
      },
      fontSize: {
        caption: ["12px", { lineHeight: "16px" }],
        label: ["13px", { lineHeight: "16px" }],
        body: ["15px", { lineHeight: "22px" }],
        heading: ["18px", { lineHeight: "24px" }],
        title: ["24px", { lineHeight: "30px" }],
        "section-sm": ["28px", { lineHeight: "32px" }],
        "section-md": ["32px", { lineHeight: "38px" }],
        section: ["40px", { lineHeight: "46px" }],
        finale: ["52px", { lineHeight: "58px" }],
        "code-sm": ["44px", { lineHeight: "52px" }],
        code: ["56px", { lineHeight: "64px" }],
        "display-lg": ["64px", { lineHeight: "68px" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        full: "9999px",
      },
      letterSpacing: {
        tight: "-0.02em",
        normal: "0em",
        caps: "0.08em",
        code: "0.04em",
      },
    },
  },
  plugins: [],
};
