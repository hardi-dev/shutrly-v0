import { z } from "zod";

export const appLocaleSchema = z.enum(["en", "id"]);
