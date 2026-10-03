"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/ui/primitives/button/button";

/** Opens Proyek baru; a button because it acts like the shell's create action. */
export function NewProjectButton({
  workspaceId,
  label,
}: Readonly<{ workspaceId: string; label: string }>) {
  const router = useRouter();
  const handlePress = () => {
    router.push(`/w/${workspaceId}/projects/new`);
  };
  return (
    <Button iconLeading="plus" onPress={handlePress}>
      {label}
    </Button>
  );
}
