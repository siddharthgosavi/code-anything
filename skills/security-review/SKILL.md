---
name: security-review
description: Comprehensive security auditing checklist: secret leakage, SQL/Command injection, authentication flaws, SSRF, authorization checks, and dependencies.
---

# Comprehensive Security Review Checklist

## 1. Secrets & Credentials
- [ ] No hardcoded API keys, tokens, passwords, private keys, or webhook secrets in source code.
- [ ] `.env` files and credentials added to `.gitignore`.
- [ ] Environment variables validated on application startup.

## 2. Injection Flaws
- [ ] SQL Queries: All queries use parameterized statements / prepared queries (zero string concatenation in queries).
- [ ] Command Execution: Avoid raw shell execution with unsanitized parameters (`exec`, `spawn` with shell: false).
- [ ] XSS: Outputs safely encoded/escaped in HTML, React, template engines.
- [ ] Path Traversal: Validate file paths against base directory (`path.resolve`, checking `startsWith`).

## 3. Authentication & Authorization
- [ ] Authentication required for all non-public routes.
- [ ] Object-level authorization (IDOR check): Verify user owns or has permission to access the requested resource ID.
- [ ] Rate limiting on authentication and sensitive endpoints.

## 4. Data Protection & Dependencies
- [ ] Sensitive data (PII, credentials) masked in log outputs.
- [ ] Dependencies audited for known vulnerabilities (`npm audit`, `cargo audit`).
