/** undefined: moved to DELIVERED; PROJECT_STATUS: not BOOKED, SHOOTING or POST_PROCESSING (BR-DEL-003). */
export type ProjectDeliveryResult =
  undefined | { readonly ok: false; readonly code: "PROJECT_STATUS" };
