# Memo integration layer

External infrastructure is intentionally behind small adapters.

## Database
Replace `lib/db.ts` with Supabase queries after validation. Keep UI components unaware of the provider.

Suggested operations:
- getProfile
- saveProfile
- listMeals
- createMeal
- updateMeal
- listSavedMeals
- saveMealTemplate

## AI
Replace `lib/ai.ts` with a server-side multimodal model integration.

The UI currently uses a deterministic demo response so validation needs no API key.

## Analytics
Replace `lib/analytics.ts` with PostHog.

Events prepared:
signup_completed, onboarding_completed, meal_started, meal_text_submitted,
meal_photo_uploaded, ai_analysis_completed, ai_analysis_failed, meal_confirmed,
meal_edited, meal_saved, saved_meal_used, meal_deleted, day_completed,
week_completed, paywall_viewed, checkout_started, subscription_started.

Core metrics:
activation, D1/D7 retention, logging frequency, time-to-log, AI correction rate.

## Future environment variables

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY (server only)
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST

Never commit real secrets.
