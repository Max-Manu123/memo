export const ANALYTICS_EVENTS = [
  "signup_completed","onboarding_completed","meal_started","meal_photo_uploaded",
  "meal_text_submitted","ai_analysis_completed","ai_analysis_failed","meal_confirmed",
  "meal_edited","meal_saved","saved_meal_used","meal_deleted","day_completed",
  "week_completed","paywall_viewed","checkout_started","subscription_started",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[Memo analytics]", event, properties ?? {});
  }
}
