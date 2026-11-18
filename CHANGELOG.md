# Changelog

## Unreleased

- Rename session bridge modules, functions, and new session markers to desktop-neutral names.
- Preserve existing session markers and the /mac alias for compatibility.
- Add a regression test for sessions created before the naming migration.

## 0.1.0

- Link a paired private Telegram chat to a terminal session with /desktop.
- Read progress and the latest analysis while work continues.
- Queue several follow-up requests in the same session.
- Cancel remote requests or stop the running linked desktop task.
- Use English control messages and request English follow-up answers.
- Add a pinned, portable source installer and tests on macOS, Linux, and Windows.
