# French Number Master

Live demo: https://french-number-master.vercel.app/

A client-side web app for practicing French number dictation.

## Why No API?

French numbers follow fixed composition rules — for example, `quatre-vingt-dix-neuf` (99) literally means "four-twenties-nineteen." Every number from 0 to 999 trillion can be built recursively by algorithm, with no database or external API required. All conversion logic runs entirely in the user's browser.

## Features

- Random number prompts — type the French spelling to answer
- Customizable practice range (0 to 999,999,999,999,999)
- IPA phonetic transcription
- Look up the French spelling of any number on demand
- Text-to-speech playback

## Speech Technology

Speech uses the browser's built-in **Web Speech API** (`window.speechSynthesis`) — no external service or API key needed. The language is set to `fr-FR`, with preference given to French female voices or Google's network voices.

> **Chrome recommended**: Chrome provides additional Google network voices whose quality is close to Google Translate's TTS — noticeably more natural than the synthesized voices built into the operating system. These voices require no installation or API key and are accessed directly through the Web Speech API. Other browsers fall back to system voices, which sound more robotic and vary by device.

## Running Locally

**Requires:** Node.js

```bash
npm install
npm run dev
```

## UI Architecture and Maintenance

Shared inputs, buttons and cards live in `src/components/ui/`; practice views live in `src/components/practice/`. State and speech logic live in `src/hooks/`. Components and named functions use arrow functions.

Colors, radii, border widths and shadows are centralized in `src/index.css`. Extend component variants for reusable differences rather than copying style classes.

Run `npm run lint` for TypeScript checks and `npm run build` for the production build.

---

# French Number Master（中文）

練習法語數字聽寫的純前端網站。

## 為什麼不需要 API？

法語數字有固定的拼接邏輯，例如 `quatre-vingt-dix-neuf`（99）是由「四個二十」加「十九」組合而成。整個 0 到 999 兆的數字都可以用演算法遞迴拼出來，完全不需要資料庫或外部 API，所有轉換邏輯都跑在使用者的瀏覽器裡。

## 功能

- 隨機出題，輸入對應的法語單字來作答
- 自訂練習範圍（0 到 999,999,999,999,999）
- 顯示 IPA 國際音標
- 直接查詢任意數字的法語寫法
- 語音朗讀

## 語音技術

語音功能使用瀏覽器內建的 **Web Speech API**（`window.speechSynthesis`），不需要任何外部服務或 API key。語言設定為 `fr-FR`，並優先選取法語女聲或 Google 自然人聲。

> **建議使用 Chrome**：Chrome 提供額外的 Google 網路語音，音質接近 Google 翻譯的語音，比作業系統內建的合成語音自然許多。這些語音不需要安裝或 API key，透過 Web Speech API 即可直接使用。其他瀏覽器只能調用系統內建的合成語音，聽起來較機械，效果因裝置而異。

## 本地運行

**需求：** Node.js

```bash
npm install
npm run dev
```

## 元件架構與維護

共用 input、按鈕與卡片位於 `src/components/ui/`，功能介面位於 `src/components/practice/`；狀態與語音邏輯位於 `src/hooks/`。元件與具名函式統一使用 arrow function。

顏色、圓角、線條粗細與陰影集中於 `src/index.css`。可重複使用的樣式差異以元件 variant 擴充，避免複製 class。

使用 `npm run lint` 執行 TypeScript 檢查、`npm run build` 執行正式打包。
