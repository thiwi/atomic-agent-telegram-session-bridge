# Atomic Agent Telegram Session Bridge

Check progress, read an analysis, queue follow-up work, and stop a terminal
session from your phone through your own Telegram bot.

This is an unofficial extension for
[Atomic Agent](https://github.com/AtomicBot-ai/atomic-agent), distributed as a
reviewable patch against **v0.8.0**, commit
`6d1f14fcd4ae08e592a71fe52f0146c5aa7bab64`. It uses Atomic's existing session
store, per-session FIFO, Telegram pairing, approval controls, and outbound
message handling.

## Example

Start a task in the patched Atomic terminal:

> Analyse this project's code and propose a refactoring plan. Reply in English.

In your private Telegram chat with your bot:

```text
/desktop
How far along are you?
Show me the result of your analysis
/queue Implement the plan
/queue Run the tests and review the changes
/status
```

Progress queries remain available while the desktop task or a queued request
runs. Follow-ups execute in the same session with its latest context. A queued
request's final answer is delivered in Telegram.

## Requirements and compatibility

- Node.js **25.7 or newer**, including npm. Node 26 is used in CI.
- Git on PATH.
- An Atomic model/provider configuration that works on your system.
- A Telegram bot and an account paired as its owner.
- The terminal process stays running and has network access to Telegram.

The extension uses portable Node/TypeScript APIs. Source modules, functions, and
new session markers use desktop-neutral names. Existing sessions with the legacy
`macTelegramBridge` marker remain readable, and `/mac` remains a command alias. It has no Homebrew, shell,
Keychain, MLX, absolute home directory, or Apple hardware dependency.
CI installs the pinned upstream source and runs the checks on macOS, Linux,
and Windows. Atomic's own model, browser, and native package requirements also
apply. Choose a provider and model supported by your host.

## Install

Clone this repository and run these commands from its root:

```sh
node scripts/install.mjs
node scripts/verify.mjs
node scripts/run.mjs tui
```

The installer clones the pinned upstream tag into `runtime/`, verifies its exact
commit, checks and applies the patch, installs the upstream lockfile, then builds
Atomic. Its source checkout uses LF line endings on every platform so upstream
archive checksum validation also works on Windows. It creates an ignored `.runtime-path.json` only after a successful build.

To choose another **new** runtime directory:

```sh
node scripts/install.mjs --target "path with spaces/atomic-runtime"
```

If an install fails, choose a new directory for the retry. The installer leaves
its partial directory available for diagnosis. It preserves an existing target.

For a project's working directory, invoke the launcher using the path to this
repository:

```sh
node <bridge-repository>/scripts/run.mjs tui
```

The launcher preserves your current working directory. Its default state directory
is Atomic's usual one, so an existing configuration is reused. For a separate
installation, set `ATOMIC_AGENT_STATE_DIR` to a dedicated directory **before**
launching. Upstream's provider/model setup applies to that state directory.

The launcher also accepts Atomic CLI arguments, for example:

```sh
node scripts/run.mjs --help
node scripts/run.mjs --version
```

## Create and connect your Telegram bot

1. Open the official **@BotFather**, send `/newbot`, and follow its instructions.
   Use your own bot name and keep its token private.
2. Start the patched Atomic terminal. Enter `/telegram`, open the Telegram
   integration, and enter your bot token there. Enable the integration if needed.
   Atomic stores credentials in its local credential storage.
3. Enter `/telegram pair` in Atomic. In Telegram, open your bot and send
   `/start <PAIRING_CODE>` using the one-time code shown on your computer.
4. Start a task in the patched terminal, then send `/desktop` to the bot from
   your paired account. The terminal must have submitted a task using this build
   before the session is eligible.

Official references:

- [Telegram's bot setup tutorial and token instructions](https://core.telegram.org/bots/tutorial#obtain-your-bot-token)
- [Telegram Bot API reference](https://core.telegram.org/bots/api)
- [Telegram Bot FAQ](https://core.telegram.org/bots/faq)
- [Atomic Agent's upstream documentation](https://github.com/AtomicBot-ai/atomic-agent/tree/v0.8.0)

Tokens are entered locally. This repository contains no working token, bot
username, Telegram owner ID, session database, user configuration, or credentials.

## Commands

| Command or message | Behavior |
| --- | --- |
| `/desktop` | Connect to the only running eligible desktop session. If all are idle, select the most recently updated eligible session. |
| `/desktop <session-id>` | Connect to a specific session. When several are running, the bot lists IDs and project paths for selection. |
| `/mac` | Backward-compatible alias for `/desktop`, on every platform. |
| `/status` or “How far along are you?” | Read status, completed steps, current plan step, last stored result, and outstanding remote request count. |
| `/result` or “Show me the result of your analysis” | Read the final answer to the latest request, or a current plan snapshot while work continues. |
| `/queue <request>` | Add a follow-up to the linked session's execution queue. Several requests execute in arrival order. |
| `/queue` | Show the number of outstanding Telegram requests and command usage. |
| `/cancel` | Cancel outstanding requests submitted through Telegram. |
| `/stop` | Request cancellation of the currently running linked desktop task and cancel its outstanding Telegram requests. |
| `/desktop off` | Disconnect when outstanding remote work has settled. The next normal message starts a separate Telegram conversation. |

After linking, ordinary messages such as “Implement the plan” also enqueue a
follow-up. Use `/queue` when you want the intent to be explicit.

Control messages are English. Follow-up prompts request English answers.
Existing answers and plan steps are returned verbatim, so their language follows
the original task. German progress/result input phrases remain accepted for
compatibility.

## Execution and cancellation

The bridge runs **inside the same Atomic process** as the terminal session.
Running a second `serve` process against the same state directory does not
connect to another process's in-memory turn queue.

Status is a read-only snapshot of the last saved work step. A long model response
or tool call can leave the snapshot unchanged until the next checkpoint.
Reading status or results does not ask the model to produce an estimate.

Pending follow-ups are kept in process memory. Closing Atomic or restarting its
Telegram channel cancels outstanding remote requests. Already completed turns
remain in Atomic's session store.

Cancellation is cooperative. A tool may take time to finish stopping.
Completed edits and external effects remain in place. Review the resulting
project state before requesting new work. If a session belongs to another
process or has an interrupted active turn, continue it in the current terminal
before sending another remote task.

## Access and privacy

Atomic's paired-owner check runs before the bridge handles a message. Desktop
access is restricted to that owner's private DM. Groups, other users, other
channel sessions, and incognito sessions cannot attach through this feature.

Linking or reading a session preserves its current approval route. A queued
Telegram turn binds its approval handler only after it acquires execution
ownership; it releases that handler at completion. Atomic's normal tool
permissions and approval policy still apply.

Status, project paths, results, and requested output are sent to the owner's
Telegram chat. Set up the bot and select the project with that destination in
mind. The extension adds no public server or webhook.

## Tests and development

```sh
npm test
node scripts/privacy.mjs
node scripts/verify.mjs
```

The repository tests cover portable installer helpers and privacy checks.
The patch includes focused tests for owner checks, private-chat restriction,
incognito exclusion, session selection, English command handling, stale results,
queue ordering, status queries during work, cancellation, approval ownership,
and reloading the latest context between desktop and Telegram turns.

`verify.mjs` runs the upstream production typecheck, import checks, documentation
checks, Telegram tests, runtime turn ownership tests, and test-typecheck baseline.
The full upstream test typecheck uses a 4 GiB Node heap by default; an explicit
`NODE_OPTIONS` heap setting takes precedence.

Edit the patch against the pinned source revision, rebuild and retest it, then
commit the updated patch. Review `git diff` and run the privacy scanner before
publishing. The scanner is a supplementary check; it does not replace reviewing
the exact release files.

## Updating and uninstalling

This extension supports the pinned Atomic revision. A different upstream version
needs a reviewed and tested patch. Use this repository's launcher to run the
patched build after an upstream binary update.

To return to your regular Atomic installation, exit the patched terminal and
launch your original Atomic executable. The standalone installer does not replace
that executable. Remove the bridge checkout and its selected runtime directory
when you no longer need them. Keep your Atomic state directory if you want to
retain conversations, pairing, and configuration.

## License and attribution

MIT. This repository includes a patch to Atomic Agent and retains the upstream
MIT notice in `LICENSE`. Atomic Agent and Telegram remain their respective
projects. This extension is independently maintained.
