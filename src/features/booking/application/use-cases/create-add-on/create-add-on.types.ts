import type { z } from "zod";

import type { AddOnRepositoryPort } from "../../ports/add-on-repository/add-on-repository.port";
import type { AddOnTargetPort } from "../../ports/add-on-target/add-on-target.port";
import type { createAddOnSchema } from "./create-add-on.schema";

export type CreateAddOnInput = z.input<ReturnType<typeof createAddOnSchema>>;
export type CreateAddOnFields = z.output<ReturnType<typeof createAddOnSchema>>;

export interface CreateAddOnDeps {
  readonly addOns: AddOnRepositoryPort;
  readonly targets: AddOnTargetPort;
}
