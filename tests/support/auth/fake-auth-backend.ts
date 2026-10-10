import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import type {
  AuthLink,
  AuthLinkKind,
} from "@/features/auth/application/ports/auth-email/auth-email.port";
import type {
  IdentityPort,
  SessionCookies,
} from "@/features/auth/application/ports/identity/identity.port";
import { asAuthUserId } from "@/features/auth/domain/account/account";
import type {
  AccountRecord,
  AccountStatus,
  AuthUserId,
} from "@/features/auth/domain/account/account.types";
import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";
import type { AppLocale } from "@/shared/locale/locale.types";

const COOKIE = "fake.session_token";
const BASE_URL = "http://localhost:3000";
const LINK_PATH: Record<AuthLinkKind, string> = {
  VERIFY_EMAIL: "/verify/confirm",
  RESET_PASSWORD: "/reset-password",
};

interface FakeUser {
  id: AuthUserId;
  name: string;
  email: NormalisedEmail;
  password: string | null;
  locale: AppLocale;
  status: AccountStatus;
  emailVerified: boolean;
}

/**
 * In-memory stand-in for Better Auth plus the account directory, for use-case unit tests.
 * It keeps A-3 semantics (latest link only, single use); the real adapter is covered by
 * tests/integration/auth.
 */
export class FakeAuthBackend {
  readonly users = new Map<AuthUserId, FakeUser>();
  readonly sessions = new Map<string, AuthUserId>();
  private readonly latest = new Map<string, string>();

  constructor(private readonly onLink: (link: AuthLink) => void) {}

  readonly accounts: AccountDirectoryPort = {
    findByEmail: (email) => Promise.resolve(this.record(this.byEmail(email))),
    getById: (id) => Promise.resolve(this.record(this.users.get(id))),
    setStatusAndRevokeSessions: (id, status) => {
      this.mustGet(id).status = status;
      this.revoke(id);
      return Promise.resolve();
    },
    revokeAllSessions: (id) => {
      this.revoke(id);
      return Promise.resolve();
    },
    setLocale: (id, locale) => {
      this.mustGet(id).locale = locale;
      return Promise.resolve();
    },
    applyGoogleTakeoverGuard: (id) => {
      const user = this.mustGet(id);
      Object.assign(user, { emailVerified: true, password: null });
      this.revoke(id);
      return Promise.resolve();
    },
  };

  readonly identity: IdentityPort = {
    getSessionUserId: (headers) => Promise.resolve(this.sessionUser(headers)),
    createPasswordUser: ({ name, email, password }) => {
      if (this.byEmail(email)) return Promise.resolve({ created: false });
      const id = asAuthUserId(crypto.randomUUID());
      const user = {
        id,
        name,
        email,
        password,
        status: "ACTIVE",
        emailVerified: false,
        locale: "en",
      } as const;
      this.users.set(id, { ...user });
      return Promise.resolve({ created: true });
    },
    sendVerificationLink: (email) => {
      const user = this.byEmail(email);
      if (user && !user.emailVerified) this.issue(user, "VERIFY_EMAIL");
      return Promise.resolve();
    },
    verifyEmail: (token) => {
      const user = this.consume("VERIFY_EMAIL", token);
      if (!user) return Promise.resolve({ ok: false });
      user.emailVerified = true;
      return Promise.resolve({ ok: true, userId: user.id, ...this.startSession(user.id) });
    },
    signInWithPassword: ({ email, password }) => {
      const user = this.byEmail(email);
      if (!user?.password || user.password !== password) return Promise.resolve({ ok: false });
      return Promise.resolve({ ok: true, userId: user.id, ...this.startSession(user.id) });
    },
    signOut: (headers) => {
      const token = this.token(headers);
      if (token) this.sessions.delete(token);
      return Promise.resolve({ setCookies: [`${COOKIE}=; Max-Age=0; Path=/`] });
    },
    sendResetLink: (email) => {
      const user = this.byEmail(email);
      if (user) this.issue(user, "RESET_PASSWORD");
      return Promise.resolve();
    },
    isResetLinkUsable: (token) => Promise.resolve(this.findLink("RESET_PASSWORD", token) !== null),
    resetPassword: ({ token, newPassword }) => {
      const user = this.consume("RESET_PASSWORD", token);
      if (!user) return Promise.resolve(false);
      user.password = newPassword;
      this.revoke(user.id);
      return Promise.resolve(true);
    },
    changePassword: ({ currentPassword, newPassword }, headers) => {
      const user = this.users.get(this.sessionUser(headers) ?? asAuthUserId("none"));
      if (user?.password !== currentPassword) return Promise.resolve({ ok: false });
      user.password = newPassword;
      const current = this.token(headers);
      for (const [token, id] of this.sessions) {
        if (id === user.id && token !== current) this.sessions.delete(token);
      }
      return Promise.resolve({ ok: true, setCookies: [] });
    },
    updateName: (name, headers) => {
      const user = this.users.get(this.sessionUser(headers) ?? asAuthUserId("none"));
      if (user) user.name = name;
      return Promise.resolve();
    },
    googleSignInUrl: ({ callbackURL }) =>
      Promise.resolve({
        url: `https://accounts.google.com/o/oauth2/v2/auth?redirect=${callbackURL}`,
        setCookies: ["fake.state=s; Path=/"],
      }),
  };

  seedUser(user: Omit<FakeUser, "id" | "locale"> & { locale?: AppLocale }): AuthUserId {
    const id = asAuthUserId(crypto.randomUUID());
    this.users.set(id, { locale: "en", ...user, id });
    return id;
  }

  signIn(id: AuthUserId): Headers {
    return FakeAuthBackend.headersFrom(this.startSession(id));
  }

  static headersFrom(cookies: SessionCookies): Headers {
    return new Headers({ cookie: cookies.setCookies.map((c) => c.split(";")[0]).join("; ") });
  }

  private startSession(id: AuthUserId): SessionCookies {
    const token = crypto.randomUUID();
    this.sessions.set(token, id);
    return { setCookies: [`${COOKIE}=${token}; Path=/; HttpOnly`] };
  }

  private issue(user: FakeUser, kind: AuthLinkKind): void {
    const token = crypto.randomUUID();
    this.latest.set(`${kind}:${user.id}`, token);
    const url = `${BASE_URL}${LINK_PATH[kind]}?token=${token}`;
    this.onLink({ kind, to: user.email, name: user.name, url });
  }

  private findLink(kind: AuthLinkKind, token: string): FakeUser | null {
    for (const user of this.users.values()) {
      if (this.latest.get(`${kind}:${user.id}`) === token) return user;
    }
    return null;
  }

  private consume(kind: AuthLinkKind, token: string): FakeUser | null {
    const user = this.findLink(kind, token);
    if (user) this.latest.delete(`${kind}:${user.id}`);
    return user;
  }

  private token(headers: Headers): string | undefined {
    const cookie = headers.get("cookie") ?? "";
    return cookie
      .split("; ")
      .find((part) => part.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1);
  }

  private sessionUser(headers: Headers): AuthUserId | null {
    const token = this.token(headers);
    return token === undefined ? null : (this.sessions.get(token) ?? null);
  }

  private revoke(id: AuthUserId): void {
    for (const [token, userId] of this.sessions) if (userId === id) this.sessions.delete(token);
  }

  private byEmail(email: NormalisedEmail): FakeUser | undefined {
    return [...this.users.values()].find((user) => user.email === email);
  }

  private mustGet(id: AuthUserId): FakeUser {
    const user = this.users.get(id);
    if (!user) throw new Error("fake: unknown user");
    return user;
  }

  private record(user: FakeUser | undefined): AccountRecord | null {
    if (!user) return null;
    const { password, ...rest } = user;
    return { ...rest, hasPassword: password !== null };
  }
}
