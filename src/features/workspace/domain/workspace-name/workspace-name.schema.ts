import { z } from "zod";

export const workspaceNameSchema = z.string().trim().min(1).max(60).brand<"WorkspaceName">();
