import type { z } from "zod";

import type { setPickNoteSchema, setPickSchema } from "./set-pick.schema";

export type SetPickInput = z.input<typeof setPickSchema>;
export type SetPickNoteInput = z.input<typeof setPickNoteSchema>;
