# Password recovery, change, and logout

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Auth UI
    participant App as App action
    participant Policy as Auth policy
    participant BA as Better Auth adapter
    participant DB as Neon/Drizzle
    participant Email as AuthEmailSender

    Owner->>UI: Submit forgot-password email
    UI->>App: requestPasswordReset(email, requestContext)
    App->>Policy: Normalize + rate-limit
    App->>BA: Request reset for password-backed account
    BA->>DB: Create newest single-use reset token
    BA->>Email: Send reset URL when account supports password
    Email-->>BA: Delivered or retryable failure
    App-->>UI: Same generic confirmation for every email

    Owner->>UI: Submit new password from reset URL
    UI->>App: resetPassword(token, newPassword)
    App->>Policy: Validate password + token outcome
    App->>BA: Consume token and update password
    BA->>DB: Save credential and revoke all sessions
    App-->>UI: Reset complete; require login again

    Owner->>UI: Submit current + new password in Profile
    UI->>App: changePassword(current, newPassword)
    App->>BA: Verify current credential and update password
    BA->>DB: Save credential and revoke other sessions only
    App-->>UI: Current session remains signed in

    Owner->>UI: Press logout
    UI->>App: logoutOwner(currentSession)
    App->>BA: Revoke current session
    BA->>DB: Delete/revoke current session record
    App-->>UI: Redirect to Login
```

Password recovery is intentionally absent for Google-only accounts: the public response remains generic, but no reset email is sent.
