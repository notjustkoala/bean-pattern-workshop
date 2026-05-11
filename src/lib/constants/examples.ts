type ExampleTone = "dog" | "runner" | "sunset" | "portrait" | "cactus" | "bunny";

export type ExampleImage = {
  id: string;
  name: string;
  hint: string;
  tone: ExampleTone;
  dataUrl: string;
};

function svgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function exampleSvg(title: string, tone: ExampleTone) {
  const palettes: Record<ExampleTone, { bg: string; a: string; b: string; c: string }> = {
    dog: { bg: "#FFF2D9", a: "#B7791F", b: "#F8D79B", c: "#1F1B3A" },
    runner: { bg: "#F7F0FF", a: "#EF4444", b: "#2563EB", c: "#1F1B3A" },
    sunset: { bg: "#FFE8CE", a: "#FB7185", b: "#F59E0B", c: "#2563EB" },
    portrait: { bg: "#F3E8FF", a: "#1F1B3A", b: "#C4B5FD", c: "#FBCFE8" },
    cactus: { bg: "#ECFDF3", a: "#22C55E", b: "#92400E", c: "#EF4444" },
    bunny: { bg: "#EEF6FF", a: "#FFFFFF", b: "#FB7185", c: "#1F1B3A" }
  };
  const p = palettes[tone];

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
      <defs>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="2.4" fill="#d8c8ef" opacity=".55"/>
        </pattern>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#7c3aed" flood-opacity=".16"/>
        </filter>
      </defs>
      <rect width="360" height="240" rx="28" fill="${p.bg}"/>
      <rect width="360" height="240" rx="28" fill="url(#dots)" opacity=".7"/>
      <g filter="url(#soft)">
        <rect x="82" y="42" width="196" height="148" rx="24" fill="white" opacity=".78"/>
        <circle cx="145" cy="98" r="34" fill="${p.a}"/>
        <circle cx="214" cy="98" r="34" fill="${p.b}"/>
        <circle cx="180" cy="134" r="44" fill="${p.a}"/>
        <circle cx="162" cy="126" r="9" fill="${p.c}"/>
        <circle cx="198" cy="126" r="9" fill="${p.c}"/>
        <circle cx="180" cy="148" r="7" fill="#FB7185"/>
      </g>
      <text x="180" y="218" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#7A7390">${title}</text>
    </svg>
  `);
}

export const EXAMPLE_IMAGES: ExampleImage[] = [
  { id: "dog", name: "小柴犬", hint: "宠物头像", tone: "dog", dataUrl: exampleSvg("小柴犬", "dog") },
  { id: "runner", name: "像素角色", hint: "低像素图标", tone: "runner", dataUrl: exampleSvg("像素角色", "runner") },
  { id: "sunset", name: "海边日落", hint: "渐变风景", tone: "sunset", dataUrl: exampleSvg("海边日落", "sunset") },
  { id: "portrait", name: "头像插画", hint: "人物练习", tone: "portrait", dataUrl: exampleSvg("头像插画", "portrait") },
  { id: "cactus", name: "仙人掌", hint: "小物模板", tone: "cactus", dataUrl: exampleSvg("仙人掌", "cactus") },
  { id: "bunny", name: "兔兔", hint: "可爱主题", tone: "bunny", dataUrl: exampleSvg("兔兔", "bunny") }
];
