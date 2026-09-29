"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/ui/primitives/button/button";

/** Connects a server-action form to the shared pending Button state. */
export function FormSubmitButton({ children }: Readonly<{ children: string }>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isPending={pending}>
      {children}
    </Button>
  );
}
