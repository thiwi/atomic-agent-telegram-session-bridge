# Security policy

This extension is experimental. Only the pinned upstream revision documented in
README.md is supported. Keep Atomic, Node.js and dependencies under review;
compatibility with another upstream version requires a new tested patch.

## Trust boundary

The paired Telegram owner can request tools in the linked local session under
Atomic's configured permissions. Treat access to that Telegram account and bot
credentials as access to those capabilities. Keep bot credentials in Atomic's
secret configuration and out of repositories, screenshots and issue reports.

The bridge allows desktop linking only in the paired owner's private chat.
Groups and incognito sessions cannot link. It does not add an HTTP listener.
Telegram receives status, project paths, answers and requested output.

## Reporting vulnerabilities

Use GitHub's private vulnerability reporting when it is available. Otherwise
contact the repository maintainer privately before disclosing sensitive details.
Do not post tokens, owner IDs, private project paths or full session logs in a
public issue. Revoke exposed bot credentials through BotFather.

## Known limitations

Queued requests live in memory and are cancelled by shutdown or channel restart.
Cancellation is cooperative and does not undo changes or external actions.
A second Atomic process cannot control the first process's execution queue.
The supplementary privacy scanner detects common patterns, not every secret.
