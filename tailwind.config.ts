import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 「山と温泉のしおり」トーン
        ink: "#20262B",        // 深い墨色（本文）
        mist: "#EDF1EA",       // 山霧の背景（クリーム系トラップを避けた淡いモスグレー）
        paper: "#FFFFFF",
        line: "#D8DED2",       // 罫線・境界
        forest: {
          DEFAULT: "#2F6F4E",
          dark: "#22523A",
          light: "#E4EFE7",
        },
        ember: {
          DEFAULT: "#C1622D",  // 焚き火・紅葉のアクセント（CTA）
          dark: "#9B4E22",
          light: "#F3E3D6",
        },
        sunny: {
          DEFAULT: "#E3A72F",
          light: "#FBF0D9",
        },
        rainy: {
          DEFAULT: "#4C7A9E",
          light: "#E4EDF3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(32,38,43,0.08)",
        card: "0 4px 20px -4px rgba(32,38,43,0.12)",
      },
      backgroundImage: {
        "trail-dotted":
          "repeating-linear-gradient(to bottom, #B7C4AE 0, #B7C4AE 4px, transparent 4px, transparent 10px)",
      },
    },
  },
  plugins: [],
};

export default config;
