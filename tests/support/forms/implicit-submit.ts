import { fireEvent } from "@testing-library/react";

/**
 * Presses Enter in a field of a dialog form, the way a browser does (F-24 D3). The primary button
 * sits outside the form and submits it through its `form` attribute, and user-event only looks for
 * buttons inside the form, so this checks the button's form owner and fires the form's submit.
 * @param field - the single-line field that has focus
 * @param primary - the dialog's primary button
 */
export function pressEnterInField(field: HTMLElement, primary: HTMLElement): void {
  const form = field.closest("form");
  if (!form || !(primary instanceof HTMLButtonElement) || primary.form !== form)
    throw new Error("the primary button does not submit this form");
  fireEvent.submit(form);
}
