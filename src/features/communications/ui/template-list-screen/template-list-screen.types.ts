import type {
  TemplateGroup,
  TemplateType,
} from "@/features/communications/domain/template-type/template-type.types";

export interface TemplateListScreenProps {
  workspaceId: string;
  types: readonly TemplateType[];
}

export interface TemplateGroupCardProps extends TemplateListScreenProps {
  group: TemplateGroup;
}

export interface TemplateListRowProps {
  type: TemplateType;
  href: string;
  isLast: boolean;
}
