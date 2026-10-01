import type { z } from "zod";

import type { messageTemplateContentSchema } from "./message-template-content.schema";

export type MessageTemplateContentInput = z.input<ReturnType<typeof messageTemplateContentSchema>>;
