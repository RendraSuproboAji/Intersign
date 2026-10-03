# Security policy

## Reporting a vulnerability

Please do not open a public issue, pull request, or discussion for a security problem.

Report it privately through:

- [GitHub private vulnerability reporting](https://github.com/RendraSuproboAji/Intersign/security/advisories/new) — preferred

Include what you have: affected package or route, version or commit, reproduction steps, and the impact you believe it has. A proof of concept helps a lot; a rough description is still worth sending.

We aim to acknowledge a report within three working days and to keep you updated while we work on a fix. We will credit you in the advisory unless you would rather stay anonymous.

## Supported versions

Fixes land on `main`. Only the latest `main` receives security fixes.

## Scope

In scope:

- The Intersign apps in `apps/editor` and `apps/ifc-converter`
- The scene save API, including anything that lets untrusted scene data reach a parser, a renderer, or a stored graph

Out of scope:

- Vulnerabilities in the `@pascal-app/*` engine packages themselves: report those to [Pascal Editor](https://github.com/pascalorg/editor/security)
- Findings that require a user to run untrusted code in their own browser console
- Denial of service through a deliberately enormous local scene file
- Automated scanner output with no demonstrated impact

The hosted service at editor.pascal.app is operated by Pascal, not Intersign; report issues there to Pascal Editor.
