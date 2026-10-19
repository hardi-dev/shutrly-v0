/**
 * Builds the WhatsApp deep link a message is opened through (BR-MSG-001, ADR-006). Shutrly never
 * sends the message; the Owner sends it from WhatsApp. The number is already normalised to digits
 * with the country code (BR-CLI-002), and the text is URL-encoded so that spaces, newlines, `&`
 * and the client link survive intact.
 * @param number - the normalised WhatsApp number, or null when the client has none
 * @param text - the message to prefill
 * @returns the wa.me URL, or null without a number
 */
export function whatsappLink(number: string | null, text: string): string | null {
  if (number === null) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
