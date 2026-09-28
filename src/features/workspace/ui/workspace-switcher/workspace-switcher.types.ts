export interface WorkspaceSwitcherItem {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface WorkspaceSwitcherProps {
  currentName: string;
  workspaces: readonly WorkspaceSwitcherItem[];
  isCompact?: boolean;
  onSwitch: (workspaceId: string) => void | Promise<void>;
  onCreate: () => void;
}
