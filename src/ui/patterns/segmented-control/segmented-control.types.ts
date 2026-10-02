export interface SegmentedOption {
  id: string;
  label: string;
}

export interface SegmentedControlProps {
  label: string;
  options: readonly SegmentedOption[];
  selectedId: string;
  onChange: (id: string) => void;
  isFullWidth?: boolean;
  className?: string;
}
