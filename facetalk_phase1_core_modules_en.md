# 📘 FaceTalk Project – Phase 1: Core Functional Modules

## 🎯 Project Goal
Build a multi-functional AI video app named **FaceTalk** using Next.js (App Router) and Tailwind CSS. The app must integrate 3 core features based on Replicate models. All API calls must go through backend routes using `process.env.REPLICATE_API_TOKEN`. Never expose API keys in frontend code.

---

## 🧠 Feature 1: Live Portrait Animation
- Users upload a portrait image and a driving video.
- After clicking "Generate", call the Replicate model to create an animated face video.
- API Version: `zf-kbot/live-portrait:a6ea89def8d2125215e4d2f920d608b171866840f8b5bff3be46c4c1ce9b259b`
- Sample JSON input:
```json
{
  "image": "https://replicate.delivery/pbxt/LJdkFLcNdAemF6Re5Pmtmc8LxkFY93zF11wB7hNcajpfSjy1/mom_1.png",
  "video": "https://replicate.delivery/pbxt/LJdkF2MjQJWdcANNELbXWLP40Yzm9PpuSchnfmCnDRvRUtCs/d14_trim.mp4"
}
```
- Credit usage: **2 credits per use**

---

## 🎙️ Feature 2: Voice Cloning
- Users upload a voice sample to generate a custom voice identity.
- Output can be reused in talking portrait generation.
- API Version: `kjjk10/llasa-3b-long:0494f04972b675631af41c253a45c4341bf637f07eed9a39bad3b1fd66f73a2e`
- Sample JSON input:
```json
{
  "text": "...",
  "prompt_text": "...",
  "chunk_length": 250,
  "voice_sample": "https://replicate.delivery/pbxt/MNaFEZ61ud5qvzKXlS8trGHKnL1EQiKSj4GwBJYrtTHVo1c9/voice_sample.wav"
}
```
- Credit usage: **1 credit per use**

---

## 👄 Feature 3: Talking Portrait
- Users upload a portrait image and an audio clip or text.
- Combines image and audio to generate a speaking avatar video.
- API Version: `zsxkib/sonic:a2aad29ea95f19747a5ea22ab14fc6594654506e5815f7f5ba4293e888d3e20f`
- Sample JSON input:
```json
{
  "seed": 42,
  "audio": "https://raw.githubusercontent.com/jixiaozhong/Sonic/main/examples/wav/sing_female_10s.wav",
  "image": "https://raw.githubusercontent.com/jixiaozhong/Sonic/main/examples/image/hair.png",
  "dynamic_scale": 1,
  "min_resolution": 512,
  "inference_steps": 25,
  "keep_resolution": false
}
```
- Credit usage: **3 credits per use**

---

## 🧾 Technical Requirements
- Stack: Next.js App Router + Tailwind CSS + PNPM
- Use `.env.local` to store REPLICATE_API_TOKEN
- Run locally with `pnpm install && pnpm dev`
- Deployable to Vercel
- All model requests go through `/api/**` routes
- Features must include:
  - File previews
  - Loading indicators
  - Error handling
  - Result video playback and download buttons
  - English-only interface