# F-01 Auth — Activity Flow

```mermaid
flowchart TD
    Start([Visitor opens auth entry]) --> SignedIn{Already signed in?}
    SignedIn -->|Yes| Destination[Resolve F-02 workspace destination]
    SignedIn -->|No| Choose{Choose action}

    Choose --> Register[Register]
    Register --> ValidateReg{Server validation + rate limit pass?}
    ValidateReg -->|No| RegError[Show field errors or generic rate-limit error]
    RegError --> Register
    ValidateReg -->|Yes| Existing{Email already exists?}
    Existing -->|Verified| PendingGeneric[Show same verification-pending outcome; send nothing]
    Existing -->|Unverified| ResendNew[Invalidate old link and send newest verification link]
    Existing -->|No| Create[Create one ACTIVE unverified Better Auth user]
    Create --> SendVerify[Send verification email]
    SendVerify --> Pending[Verification pending]
    ResendNew --> Pending
    Pending --> VerifyLink[Open verification link]
    VerifyLink --> ValidVerify{Valid, unused, unexpired, latest link?}
    ValidVerify -->|No| InvalidLink[Show invalid/expired state with resend]
    InvalidLink --> Pending
    ValidVerify -->|Yes| Verify[Mark email verified and sign in]
    Verify --> Destination

    Choose --> Login[Login]
    Login --> ValidateLogin{Rate limit pass?}
    ValidateLogin -->|No| RateError[Show generic rate-limit error]
    ValidateLogin -->|Yes| Credentials{Credentials valid?}
    Credentials -->|No| CredentialError[Show generic incorrect-credentials error]
    CredentialError --> Login
    Credentials -->|Yes| Status{ACTIVE?}
    Status -->|No| Unavailable[Account unavailable; render no owner data]
    Status -->|Yes| Verified{Email verified?}
    Verified -->|No| Restricted[Create restricted session; allow verify/resend/logout only]
    Verified -->|Yes| LoginSuccess[Create owner session]
    LoginSuccess --> Destination

    Choose --> Google[Continue with Google]
    Google --> Callback{Valid callback + Google email verified?}
    Callback -->|No| GoogleError[Return to Login with generic provider error]
    Callback -->|Yes| Match{Matching account exists?}
    Match -->|No| CreateGoogle[Create ACTIVE verified Google-only user]
    Match -->|Verified| LinkGoogle[Link Google to same user; preserve password]
    Match -->|Unverified| TakeoverGuard[Verify; remove password; revoke old sessions; link Google]
    CreateGoogle --> GoogleStatus{ACTIVE?}
    LinkGoogle --> GoogleStatus
    TakeoverGuard --> GoogleStatus
    GoogleStatus -->|No| Unavailable
    GoogleStatus -->|Yes| Destination

    Choose --> Recovery[Forgot password]
    Recovery --> RecoveryResponse[Always show generic confirmation]
    RecoveryResponse --> ResetLink{Password-backed account and send succeeds?}
    ResetLink -->|No| RecoveryDone[Wait / retry without account disclosure]
    ResetLink -->|Yes| Reset[Open reset link]
    Reset --> ValidReset{Valid, unused, unexpired, latest link?}
    ValidReset -->|No| InvalidReset[Show invalid/expired state with new request]
    InvalidReset --> Recovery
    ValidReset -->|Yes| SaveReset[Save new password and revoke all sessions]
    SaveReset --> Login

    Choose --> Profile[Profile]
    Profile --> ProfileAccess{Verified ACTIVE session?}
    ProfileAccess -->|No| Gate[Apply verification/status gate]
    ProfileAccess -->|Yes| EditProfile[Update display name; email remains read-only]
    EditProfile --> PasswordChoice{Password account?}
    PasswordChoice -->|Yes| ChangePassword[Require current password; revoke other sessions]
    PasswordChoice -->|No| ProfileDone[No change-password section]
```

Key gates are server-authoritative: status is checked on every Owner request, verification is required before workspace access, and enumeration-sensitive branches return indistinguishable public outcomes.
