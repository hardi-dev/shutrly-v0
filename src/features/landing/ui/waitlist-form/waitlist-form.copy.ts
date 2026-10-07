// English by Owner decision for the landing page (plan.md › Owner decisions).
export const WAITLIST_FORM_COPY = {
  emailLabel: "Email address", // not in Pencil: visually hidden label
  emailPlaceholder: "Enter your email",
  submit: "Join the waitlist",
  submitShort: "Join waitlist",
  submitting: "Joining…", // not in Pencil
  promise: "Get notified when Shutrly launches. No spam.",
  // not in Pencil: privacy note (AC-LND-011); the removal contact is still open (plan.md)
  privacy:
    "We only use your email to tell you about the launch. It’s kept with our email provider, never shared, and removed whenever you ask.",
  botLabel: "Leave this field empty", // not in Pencil: bot field, hidden from people
  errors: {
    "email.required": "Enter your email address.", // not in Pencil
    "email.invalid": "Enter a valid email address, like name@example.com.", // not in Pencil
    "email.tooLong": "This email is too long. Use one with at most 254 characters.", // not in Pencil
  },
  failed: "That didn’t work. Please try again.", // not in Pencil
  rateLimited: "Too many attempts. Please try again in a moment.", // not in Pencil
  successTitle: "You’re on the list.", // not in Pencil
  successBody: "We’ll email you when Shutrly opens.", // not in Pencil
} as const;
