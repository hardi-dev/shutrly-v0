import type { Control } from "react-hook-form";

import type {
  ClientFields,
  ClientInput,
} from "@/features/booking/application/schemas/client-input/client-input.types";

export interface SocialLinksEditorProps {
  readonly control: Control<ClientInput, unknown, ClientFields>;
  readonly isPending: boolean;
  readonly isMobile: boolean;
}

export interface SocialLinkRowProps {
  readonly index: number;
  readonly control: SocialLinksEditorProps["control"];
  readonly isPending: boolean;
  readonly isMobile: boolean;
  readonly onRemove: (index: number) => void;
}
