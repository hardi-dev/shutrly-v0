export interface WorkspaceSwitcherItem {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface WorkspaceSwitcherProps {
  currentName: string;
  workspaces: readonly WorkspaceSwitcherItem[];
  onSwitch: (workspaceId: string) => Promise<void>;
  onCreate: (formData: FormData) => Promise<void>;
}
