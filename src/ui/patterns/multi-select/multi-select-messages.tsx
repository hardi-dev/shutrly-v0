/** Renders the helper text under a multi-select trigger, or its error in place of the helper. @param props - the helper, the error and the element ID the trigger points to @returns the message, or nothing */
export function MultiSelectMessages({
  description,
  errorMessage,
  messageId,
}: Readonly<{ description?: string; errorMessage?: string; messageId: string }>) {
  const text = errorMessage ?? description;
  if (!text) return null;
  return (
    <p
      id={messageId}
      className={
        errorMessage
          ? "text-(length:--font-size-label) text-(--component-input-error-text)"
          : "text-(length:--font-size-label) text-(--component-input-helper)"
      }
    >
      {text}
    </p>
  );
}
