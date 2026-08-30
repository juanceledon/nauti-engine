# Nauti — Decision Log & Key Trade-offs

Every real trade-off we made while building Nauti, as we made it. Each entry records what we chose, what we gave up, and why.

---

## 1. Voice layer: Dapta Voice AI instead of Retell / LiveKit

**Decision.** Carrier calls are dispatched through Dapta's `call_other_agents` endpoint (one voice agent per carrier, in parallel), reusing a battle-tested telephony product.

**Alternative.** Building the voice runtime ourselves on Retell or LiveKit Agents (STT/TTS/turn-taking, SIP trunks, barge-in handling).

**Why.** Faster integration and stability: the voice leg worked on day one and the platform already handles turn detection, barge-in, and PSTN. The mandate variables (`origin`, `destination`, `mandate_max_price`, `mandate_currency`, `mandate_target_date`, cargo fields) are injected straight into the voice agent's prompt — the exact contract our Negotiation AI needs.

**Cost.** Less control over the in-call negotiation runtime and a vendor dependency; per-call behavior is tuned through prompts and variables rather than code.

## 2. Control: backend validation over prompt-only enforcement

**Decision.** The mandate is enforced by structure, not by trust in the model: key values (price, date, conditions) travel as **structured fields**, the operation is **registered in the Nauti backend** (`POST /operations`) before any call goes out, and business state (deals, quotes, calls, commitments) **persists outside the agent** and is validated by the backend.

**Alternative.** Prompt-only enforcement — telling the model the rules and hoping they hold.

**Why.** Reliable mandate enforcement. A prompt can drift; a stored operation with a numeric ceiling cannot. The agent decides *within* a mandate it can't modify, and every quote is auditable against the stored record.

**Cost.** More moving parts (engine ↔ backend contract to keep in sync) and the backend becomes a hard dependency of the dispatch path.

## 3. Scope: operational layer first

**Decision.** Ship the full operational loop — intake → mandate → parallel carrier calls → compare → confirm → evidence in the portal — on top of existing infrastructure.

**Alternative.** A fully custom voice stack end to end.

**Why.** Not possible within the hackathon window, and the differentiated value is the *operational brain* (mandate discipline, anti-ratchet negotiation, verified commitments), not re-implementing telephony.

**Cost.** The voice internals are a black box for now; deep call-level customization waits for a later phase.

## 4. Engine: native OpenCode primitives, not a platform clone

**Decision.** The AI engine is one OpenCode project: an agent as a markdown file (`.opencode/agents/nauti-assistant.md`), tools as single TypeScript files (`.opencode/tools/*.ts`), one JSON config. No database, no Python tool servers, no multi-tenancy.

**Alternative.** Cloning the existing enterprise engine architecture (vendored framework fork, ~20 MCP servers, Postgres with RLS, supervisord).

**Why.** Radical simplicity: the whole engine is ~200 lines of code plus markdown, deployable as a single container, understandable in one sitting.

**Cost.** No platform features (multi-tenant isolation, analytics, model routing). Acceptable: Nauti serves one product.

## 5. Prompt guardrails: deterministic composition, no LLM in the tool chain

**Decision.** The five inviolable rules (execute ≠ narrate, anti-ratchet, inviolable mandate, one question per turn, broad confirmation + barge-in) are authored once and spliced **verbatim** into every generated prompt by pure string composition. Role definition, boundaries, and escalation rules live in fixed blocks.

**Alternative.** Letting an LLM write or adapt the guardrail text per use case.

**Why.** These rules were born from real failed test calls; regenerating them with an LLM is documented (in the predecessor system) to cause quality drift — collapsed rules, softened constraints. Deterministic composition also makes them testable: our evals assert the exact strings are present.

**Cost.** Less adaptive wording per use case; new transport modes require hand-written blocks.

## 6. Evals: deterministic invariants over LLM-judged evals

**Decision.** `node --test` suites assert mandate-contract consistency (Principal's tool output fields ≡ Negotiator inputs ≡ Confirmation inputs), verbatim guardrail presence, no unresolved template markers, and correct carrier/lane selection. Live behavior (mandate compliance, info extraction, escalation) is exercised with scripted production conversations.

**Alternative.** LLM-as-judge eval harness.

**Why.** Fast, free, deterministic, and runs anywhere with Node. The highest-risk failures here are contract drift and guardrail loss — both string-checkable.

**Cost.** Doesn't score conversational quality automatically; that's still validated by humans in test chats.

## 7. Model & provider: GPT-5.2 through OpenCode's provider config

**Decision.** `openai/gpt-5.2` as the engine model, with the API key injected via environment (`{env:OPENAI_API_KEY}`) and a **project-dedicated key** — never credentials shared with other company systems.

**Why.** It's the provider the team has keys for; explicit provider config means the engine can never silently fall back to another account's credentials.

**Cost.** Single-provider dependency; switching models is a one-line config change away.

## 8. Hosting: Fly.io scale-to-zero

**Decision.** One 1GB machine on Fly.io with `auto_stop_machines` and `min_machines_running = 0`, plus a 1GB volume for generated artifacts and session storage.

**Alternative.** Always-on instance, or reusing existing company infrastructure.

**Why.** Cheapest possible production footprint (cents to ~$3/month) with public HTTPS out of the box, fully separate from any other infra.

**Cost.** ~20s cold start after idle (measured). Mitigation for demo day: set `min_machines_running = 1` (~$8/month) and revert after. Note: 512MB was OOM-killed on first LLM request; 1GB is the floor.

## 9. Frontend ↔ engine: same-origin proxy instead of CORS

**Decision.** The Angular app calls `/engine/*`; a dev proxy (`proxy.conf.json`) and a Vercel rewrite forward it to the engine on Fly. The dev proxy targets **production** by default so any teammate can run the app with zero local setup.

**Alternative.** Direct cross-origin calls with `--cors` allowlists on the engine.

**Why.** No CORS anywhere, the engine URL stays out of the browser, and "clone → ng serve → it works" for every teammate.

**Cost.** Local engine development requires temporarily repointing the proxy target.

## 10. UI state: hidden `[[STATE:{...}]]` marker in replies

**Decision.** The assistant ends every reply with a machine-readable state line (origin, destination, cargo, weight, target rate, currency, date). The frontend parses it, strips it from the visible text, and lights up the mandate chips.

**Alternative.** A structured-output side channel or a second "extract state" model call per turn.

**Why.** Works over the plain sessions API with zero extra latency or cost, and keeps the engine API surface untouched.

**Cost.** Depends on model compliance with the marker format; the parser fails soft (chips simply don't update) if a reply omits it.

## 11. Client identity: hidden per-message system note

**Decision.** The frontend injects `Client context: client_id=…` through the message `system` field; the agent passes it to `call_carriers`, which registers the operation so the deal appears in the client's portal. The engine itself stays auth-less.

**Alternative.** Full auth integration (verifying Firebase tokens inside the engine).

**Why.** Hackathon-speed: identity rides the existing authenticated frontend session, and the engine needs no user database.

**Cost.** The trust boundary is the frontend/proxy, not the engine. Before real-client exposure, a token check in front of the engine is required (open item). Admin users without a `client_id` can dispatch calls but don't get a deal record.

## 12. Language: prompts authored in English, spoken language configurable

**Decision.** All prompt content is written in English; the conversation language is an explicit parameter (assistant chat: English; carrier voice calls: Spanish for the LATAM market). Chat replies are plain text — markdown is forbidden by prompt and stripped defensively by the UI.

**Why.** English prompts are the team standard and travel better across models; language-as-parameter keeps one prompt per role instead of one per language.

**Cost.** Spoken-phrase examples inside prompts must be maintained in the conversation language.

## 13. Security: voice-API key moved server-side (partially)

**Decision.** The assistant's carrier dispatch uses the Dapta API key as a **server-side secret on Fly** — it never reaches the browser.

**Known debt.** The legacy scripted flow still ships the same key hardcoded in the frontend bundle. Rotation + removal is pending and tracked; the assistant path already proves the pattern.

---

*Repo:* [`nauti-engine`](https://github.com/juanceledon/nauti-engine) · *Frontend:* `nauti-frontend` (PR: Nauti Assistant) · *Last updated: 2026-08-30*
