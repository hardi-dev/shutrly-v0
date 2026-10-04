export type TeamTab = "ACTIVE" | "ARCHIVED" | "ROLES";

export interface TeamTabsBarProps {
  readonly workspaceId: string;
  readonly tab: TeamTab;
}
