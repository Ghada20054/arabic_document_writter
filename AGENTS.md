# AGENTS

## Purpose
This file helps AI coding agents quickly understand the project structure, runtime expectations, and where to make changes.

## Project Type
- Next.js 16 app router project
- React + TypeScript + Tailwind CSS
- AI chat interface using custom UI components in `components/ai-elements`
- Server API route at `app/api/chat/route.ts` that streams OpenAI-compatible responses via OpenRouter

## Build / Dev Commands
- `npm run dev` — start local development server
- `npm run build` — build for production
- `npm run start` — run production server
- `npm run lint` — run Next.js ESLint

## Key Files
- `app/page.tsx` — main chat UI and message submission logic
- `app/api/chat/route.ts` — backend chat endpoint; uses `OPENROUTER_API_KEY` and OpenRouter base URL
- `app/layout.tsx` — root layout and font setup
- `app/globals.css` — global Tailwind and layout styles
- `components/ai-elements/` — reusable chat input, attachments, model selector, and related UI building blocks
- `lib/utils.ts` — utility helpers used across the app

## Important Conventions
- Keep the app router convention and client component behavior in mind: `app/page.tsx` is client-side and can use hooks
- `app/api/chat/route.ts` returns a streaming `ReadableStream`; preserve stream handling when editing
- Chat request bodies are JSON arrays of `{ role, content }`
- The model list is configured in `app/page.tsx`; only `gpt-4o-mini` / `GPT-5 Nano` is currently exposed in the UI

## Environment
- The backend uses `process.env.OPENROUTER_API_KEY`
- OpenRouter `baseURL` is hard-coded to `https://openrouter.ai/api/v1`

## Notes for AI Agents
- Prefer updating existing UI components under `components/ai-elements` rather than adding new ad hoc markup
- Avoid duplicating UI patterns already implemented in the chat/controls components
- Use the existing `PromptInputProvider` and prompt input hooks for message composition
- This repository has no existing agent customization files, so add instructions or skills only when necessary
