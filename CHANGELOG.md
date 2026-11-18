# Changelog

## Unreleased

- Use the explicit macOS Intel CI pool after GitHub failed to allocate Apple Silicon runners; retain an Apple Silicon option for manual runs.
- Add read-only `/review [diff]` with recorded check evidence and one-use plan approval/rejection buttons.
- Check session and Git freshness on approval and under the runtime lock before implementation.
- Pin current official CI actions, disable persisted checkout credentials, bound job runtime and cancel superseded runs.
- Rename bridge modules and new session markers to desktop-neutral names while reading legacy markers.
- Remove the platform-specific connection alias; use `/desktop` on every host.
- Serialize desktop attachments with text follow-ups instead of bypassing the queue.
- Revalidate queued sessions before dispatch so removed sessions are not restored.
- Limit outstanding remote requests to 20 per chat with an explicit rejection.
- Continue draining the queue if an error reporter fails.
- Release remote approval routing only when the remote turn acquired it.
- Add regression tests and document beta status and queue limitations.

## 0.1.0

- Link a paired private Telegram chat to a terminal session with /desktop.
- Read progress and the latest analysis while work continues.
- Queue several follow-up requests in the same session.
- Cancel remote requests or stop the running linked desktop task.
- Use English control messages and request English follow-up answers.
- Add a pinned, portable source installer and tests on macOS, Linux, and Windows.
