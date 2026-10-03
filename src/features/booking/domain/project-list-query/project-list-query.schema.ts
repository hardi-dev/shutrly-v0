import { z } from "zod";

import { PROJECT_SEARCH_MAX_LENGTH } from "../project-record/project-record";

/** A-4: a title or client-name search; blank or over-long text fails and the list is unfiltered. */
export const projectSearchSchema = z.string().trim().min(1).max(PROJECT_SEARCH_MAX_LENGTH);
