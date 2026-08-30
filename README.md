# nauti-engine

Minimal OpenCode project for **Nauta** (logistics service). One agent, one tool, zero infrastructure:

- **Nauti Builder** (`.opencode/agents/nauti-builder.md`) — chat agent that interviews a Nauta client about their logistics use case (one short question per turn).
- **`generate_prompts`** (`.opencode/tools/generate_prompts.ts`) — native OpenCode tool that deterministically composes the system prompts for the 3 voice agents of the quoting system, per transport mode (`terrestre` | `maritimo`):
  - **Nauti Principal** — client-facing: captures the mandate (max price + date), fires `call_carriers` once, picks the best quote, reports the commitment.
  - **Nauti Negociador** — one per carrier: negotiates the price down (anti-ratchet), never closes.
  - **Nauti Confirmador** — confirms the winning quote exactly as quoted, never negotiates.

Prompts are authored in **English**, voice-vendor **agnostic**, and written to `generated/`. The spoken conversation language is a parameter (default Spanish). `call_carriers` is a documented stub in this MVP. All prompt content lives as editable markdown blocks in `blocks/` — no code changes needed to iterate wording.

## Run

```bash
echo "OPENAI_API_KEY=sk-..." > .env   # project-dedicated key (gitignored)
make run     # chat with Nauti Builder (TUI)
make serve   # HTTP server on :4096 (OpenCode sessions API)
make test    # composer tests (node --test, no deps)
```

Requires the `opencode` binary (>= 1.1.x) and Node 22+. Nothing else — no database, no Python, no package.json.

## How composition works

`blocks/roles/*.md` are skeletons containing `[[BLOCK:...]]` markers and `{{vars}}`. The tool splices:

- `[[BLOCK:NAUTA_CONTEXT | PRINCIPIOS | ESTILO_VOZ]]` ← `blocks/shared/`
- `[[BLOCK:MODE_VOCABULARIO | MODE_PREGUNTAS | MODE_NEGOCIACION]]` ← `blocks/modes/{transport_mode}/`
- `{{company_name}} {{currency}} {{language_label}} {{use_case_notes}} {{transport_mode_label}}` ← tool args

No LLM inside the tool: the 5 inviolable principles (execute ≠ narrate, anti-ratchet, inviolable mandate, one question per turn, broad confirmation + barge-in) were born from failed real test calls and must ship verbatim, every time. Composition fails loudly on any unresolved marker.

To add a transport mode (e.g. air): create `blocks/modes/aereo/` with the same 3 files and add `"aereo"` to `TRANSPORT_MODES` in `src/composer.ts`.

## Deploy (Fly.io, scale-to-zero)

```bash
fly launch --no-deploy          # first time; app name nauti-engine, region bog
fly volumes create nauti_data --size 1
fly secrets set OPENAI_API_KEY=sk-...
make deploy                     # = fly deploy
```

Costs cents to ~3 USD/month (machine auto-stops when idle). The OpenCode server has **no user auth** — put a token/basic-auth proxy in front before giving real clients access. Test locally first with `make docker-up`.
