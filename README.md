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

Pronunciation uses the browser's Web Speech API, with no API key required. Available French voices and playback quality depend on the browser and device; some voices require a network connection.

## Running Locally

**Requires:** Node.js

```bash
npm install
npm run dev
```

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, Motion, and the Web Speech API.

## Checks and Build

```bash
npm run lint   # TypeScript checks
npm run build  # Production build
```

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

發音使用瀏覽器的 Web Speech API，不需要 API key。可用法語聲音與播放品質依瀏覽器、裝置而異；部分聲音需要網路連線。

## 本地運行

**需求：** Node.js

```bash
npm install
npm run dev
```

## 技術

React、TypeScript、Vite、Tailwind CSS、Motion 與 Web Speech API。

## 檢查與打包

```bash
npm run lint   # TypeScript 檢查
npm run build  # 正式打包
```
