# Memo

**Food tracking that gets easier over time.**

> Register once. Next time, Memo remembers.

## MVP

- Mobile-first onboarding and goal setup
- Responsive dashboard
- Daily calories and macros
- One-tap learned/usual meals
- Natural-language meal logging
- Honest calorie ranges
- Meal confirmation and learning moment
- History
- Progress
- Light/dark mode
- English/Portuguese UI
- Local demo persistence
- Prepared adapters for Supabase, multimodal AI and PostHog
- No payments yet: validate usage and retention first

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Validation loop

register → correct → remember → register faster

See `lib/README.md` for integration contracts.
