# Security Rules

- **Zero Hardcoded Secrets**: Never commit passwords, tokens, API keys, or private certificates. Always use environment variables or secret managers.
- **Sanitize All Inputs**: Never trust client inputs. Validate schemas at all boundaries.
- **Parameterized SQL**: Always use parameterized queries or type-safe query builders. Raw string interpolation in queries is strictly forbidden.
- **No Unsafe Execution**: Do not run unescaped shell commands with dynamic inputs.
- **Strict Authorization**: Every endpoint or function touching user resources must enforce ownership and tenant boundaries.
