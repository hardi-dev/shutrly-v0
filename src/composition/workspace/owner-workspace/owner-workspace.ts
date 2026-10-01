import "server-only";

import { notFound, redirect } from "next/navigation";

import { seedDefaultTemplates } from "@/features/communications/application/use-cases/seed-default-templates/seed-default-templates";
import { seedDefaultSource } from "@/features/gallery/application/use-cases/seed-default-source/seed-default-source";
import { createFirstWorkspace } from "@/features/workspace/application/use-cases/create-first-workspace/create-first-workspace";
import type { CreateFirstWorkspaceInput } from "@/features/workspace/application/use-cases/create-first-workspace/create-first-workspace.types";
import { createWorkspace } from "@/features/workspace/application/use-cases/create-workspace/create-workspace";
import type { CreateWorkspaceInput } from "@/features/workspace/application/use-cases/create-workspace/create-workspace.types";
import { findLastOpened } from "@/features/workspace/application/use-cases/find-last-opened/find-last-opened";
import { resolveOwnerDestination } from "@/features/workspace/application/use-cases/resolve-owner-destination/resolve-owner-destination";
import { touchLastOpened } from "@/features/workspace/application/use-cases/touch-last-opened/touch-last-opened";
import { verifyWorkspace } from "@/features/workspace/application/use-cases/verify-workspace/verify-workspace";
import type { VerifiedWorkspace } from "@/features/workspace/application/use-cases/verify-workspace/verify-workspace.types";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { withWorkspaceCreationScope } from "../workspace-creation-scope/workspace-creation-scope";
import { withWorkspaceScope } from "./../workspace-scope/workspace-scope";

/** Resolves the owner's home destination in the mandated gate, zero-workspace, last-opened order. @returns the last-opened workspace or redirects to onboarding */
export async function resolveOwnerHome() {
  const account = await requireOwnerOrRedirect();
  const owner = asOwnerUserId(account.id);
  return withWorkspaceScope(async ({ repository }) => {
    if ((await resolveOwnerDestination(repository, owner)) === "ONBOARDING")
      redirect("/onboarding/workspace");
    const workspace = await findLastOpened(repository, owner);
    if (!workspace) redirect("/onboarding/workspace");
    return workspace;
  });
}

/** Loads the signed-in account only when the owner still has no workspace for onboarding. @returns the authenticated account */
export async function loadOnboardingAccount() {
  const account = await requireOwnerOrRedirect();
  const owner = asOwnerUserId(account.id);
  await withWorkspaceScope(async ({ repository }) => {
    if ((await resolveOwnerDestination(repository, owner)) === "WORKSPACE") {
      const last = await findLastOpened(repository, owner);
      if (last) redirect(`/w/${last.id}`);
    }
  });
  return account;
}

/** Verifies a workspace for an owner without writing last-opened state. @param rawId - untrusted route or action ID @returns the verified workspace @throws Next notFound for an unowned or malformed ID */
export async function verifyOwnerWorkspace(rawId: string): Promise<VerifiedWorkspace> {
  const account = await requireOwnerOrRedirect();
  const owner = asOwnerUserId(account.id);
  return withWorkspaceScope(async ({ repository }) => {
    if ((await resolveOwnerDestination(repository, owner)) === "ONBOARDING")
      redirect("/onboarding/workspace");
    try {
      return await verifyWorkspace(repository, owner, rawId);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "WORKSPACE_NOT_FOUND")
        notFound();
      throw error;
    }
  });
}

/** Verifies a workspace and conditionally records it as opened for a normal workspace page. @param rawId - untrusted route ID @returns the verified workspace context and summary */
export async function enterWorkspace(rawId: string): Promise<VerifiedWorkspace> {
  const verified = await verifyOwnerWorkspace(rawId);
  const account = await requireOwnerOrRedirect();
  const owner = asOwnerUserId(account.id);
  await withWorkspaceScope(({ repository }) =>
    touchLastOpened(repository, owner, verified.context).then(() => undefined),
  );
  return verified;
}

/** Creates an owner's first workspace with its default templates in one transaction (ADR-016). @param input - onboarding input @returns the created workspace ID */
export async function createOwnerFirstWorkspace(input: CreateFirstWorkspaceInput) {
  const account = await requireOwnerOrRedirect();
  return withWorkspaceCreationScope(async ({ repository, templates, sources }) => {
    const created = await createFirstWorkspace(repository, asOwnerUserId(account.id), input);
    await seedDefaultTemplates(templates, { workspaceId: created.id });
    await seedDefaultSource(sources, { workspaceId: created.id });
    return created;
  });
}

/** Creates an additional owner workspace with its default templates in one transaction (ADR-016). @param input - create input @returns the created workspace ID */
export async function createOwnerWorkspace(input: CreateWorkspaceInput) {
  const account = await requireOwnerOrRedirect();
  return withWorkspaceCreationScope(async ({ repository, templates, sources }) => {
    const created = await createWorkspace(repository, asOwnerUserId(account.id), input);
    await seedDefaultTemplates(templates, { workspaceId: created.id });
    await seedDefaultSource(sources, { workspaceId: created.id });
    return created;
  });
}
