# ADR-017: Gallery passwords are stored encrypted and visible to the Owner

Status: Accepted (Owner, 2026-10-04, F-09 design review)
Date: 2026-10-04
Supersedes: the password-storage and re-entry parts of [ADR-004](ADR-004-client-access-token-and-gallery-password.md). The project token, `passwordVersion` and rotation parts stay.

## Context
ADR-004 stored only a hash of each gallery password. That meant the Owner had to re-enter the password on every share action (BR-MSG-003). During the F-09 design review the Owner pointed out that a photographer can't remember a separate password for every project.

The share message carries the link and the password together anyway. So the password mainly protects against a link that leaks on its own, and the client access token (≥128 bits) stays the primary secret.

## Decision
- **Generation:** when a gallery is created or its password is rotated, Shutrly proposes a generated, easy-to-type password. The Owner may keep it, regenerate it or type their own (6–64 characters, BR-GAL-002).
- **Storage:** the password is stored twice.
  - **Encrypted:** authenticated encryption (AES-256-GCM via WebCrypto on Workers) with a server-side key held as a Worker secret. Ciphertext, IV and key version are stored together.
  - **Hashed:** a slow hash (coding rules › Security), used to verify client password entries without decrypting.
- **Who sees it:** only the Owner of the workspace, on the gallery screen, behind the normal Owner session and workspace check (C-101). Decryption happens server-side only.
- **Sharing:** the share action fills `{{galleryPassword}}` from the decrypted value with no re-entry (BR-MSG-003).
- **Never exposed elsewhere:** plaintext and ciphertext never appear in logs, analytics, client responses, caches or URLs other than the WhatsApp link the Owner opens (C-103).
- **Rotation:** BR-GAL-003 is unchanged. It replaces both stored forms and increments `passwordVersion`.

## Alternatives considered
- **Keep hash-only and reset when forgotten.** Each reset logs the client out and forces a new password on them. Rejected for daily use.
- **Make the password optional and rely on the token alone.** This weakens protection when a link leaks, and it changes C-104, BR-ACC-001 and BR-GAL-004. Rejected.

## Consequences
### Positive
- The Owner never needs to remember or retype gallery passwords. Share messages are built in one step.
- Generated passwords are easy for clients to type.

### Negative / trade-offs
- A secret is at rest. A database leak together with the encryption key would reveal the passwords. Mitigation: the key lives only in Worker secrets, never in the database or the repo.
- **Key rotation:** the stored key version allows re-encrypting with a new key.
- **New secret:** the Owner provisions the encryption key for non-production and production.
- **F-03 copy:** the template preview note that says the password is entered when sharing (F-03 A-6) becomes outdated. Update it when F-15 builds the share action.

## Related
- Constitution C-103 (amended, v1.1)
- Business rules: BR-GAL-002, BR-GAL-003, BR-MSG-003
- Features: F-09 (gallery), F-10 (client access), F-15 (WhatsApp sharing)
