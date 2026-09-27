import { startGoogleAction } from "@/app/actions/auth/google";
import { loginAction } from "@/app/actions/auth/login";
import { redirectIfSignedIn } from "@/composition/auth/owner-guard/owner-guard";
import { googleErrorCode } from "@/features/auth/ui/google-error/google-error";
import { LoginScreen } from "@/features/auth/ui/login-screen/login-screen";

export default async function LoginPage({ searchParams }: Readonly<PageProps<"/login">>) {
  await redirectIfSignedIn();
  const { error } = await searchParams;
  const initialError = googleErrorCode(typeof error === "string" ? error : undefined);
  return (
    <LoginScreen
      action={loginAction}
      googleAction={startGoogleAction}
      initialError={initialError}
    />
  );
}
