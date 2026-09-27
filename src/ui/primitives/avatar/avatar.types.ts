export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
  className?: string;
}
