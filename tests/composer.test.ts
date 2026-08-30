import { test } from "node:test"
import assert from "node:assert/strict"
import * as path from "node:path"
import { composeAll, composeRole, MODE_LABELS, ROLES, TRANSPORT_MODES } from "../src/composer.ts"

const ROOT = path.resolve(import.meta.dirname, "..")

const contains = (text: string, needle: string, msg?: string) =>
  assert.ok(text.includes(needle), msg || `expected text to contain: ${needle}`)

test("no unresolved markers or placeholders in any role/mode", () => {
  for (const mode of TRANSPORT_MODES) {
    for (const role of ROLES) {
      const text = composeRole(ROOT, role, { transport_mode: mode })
      assert.ok(!text.includes("[[BLOCK:"), `${role}/${mode}: leftover [[BLOCK:`)
      assert.ok(!/\{\{[a-z_]+\}\}/.test(text), `${role}/${mode}: leftover {{var}}`)
      contains(text, MODE_LABELS[mode], `${role}/${mode}: missing mode label`)
    }
  }
})

test("inviolable invariants appear verbatim in every prompt", () => {
  for (const mode of TRANSPORT_MODES) {
    for (const [name, content] of Object.entries(composeAll(ROOT, { transport_mode: mode }))) {
      contains(content, "the price only goes DOWN", `${name}: anti-ratchet missing`)
      contains(content, "Execute ≠ narrate", `${name}: execute-vs-narrate missing`)
      contains(content, "Inviolable mandate", `${name}: mandate rule missing`)
    }
  }
})

test("mandate contract: principal stub matches negociador and confirmador variables", () => {
  const files = composeAll(ROOT, { transport_mode: "terrestre" })
  const principal = files["nauti-principal-terrestre.md"]
  const negociador = files["nauti-negociador-terrestre.md"]
  const confirmador = files["nauti-confirmador-terrestre.md"]

  for (const field of ["origin", "destination", "mandate_max_price", "mandate_currency", "mandate_target_date"]) {
    contains(principal, field, `principal stub input missing ${field}`)
    contains(negociador, `\`${field}\``, `negociador input missing ${field}`)
  }
  for (const field of ["quoted_price", "quoted_currency", "quoted_date", "status"]) {
    contains(principal, field, `principal stub output missing ${field}`)
    contains(negociador, `\`${field}\``, `negociador output missing ${field}`)
  }
  for (const field of ["quoted_price", "quoted_currency", "quoted_date", "agreed_price", "agreed_currency", "agreed_date", "confirmed"]) {
    contains(confirmador, `\`${field}\``, `confirmador variable missing ${field}`)
  }
})

test("role-defining rules land in the right prompt", () => {
  const files = composeAll(ROOT, { transport_mode: "maritimo" })
  contains(files["nauti-principal-maritimo.md"], "exactly ONCE")
  contains(files["nauti-negociador-maritimo.md"], "YOU CLOSE NOTHING")
  contains(files["nauti-confirmador-maritimo.md"], "NEGOTIATION IS FORBIDDEN")
})

test("vars are substituted", () => {
  const text = composeRole(ROOT, "principal", {
    transport_mode: "terrestre",
    currency: "USD",
    company_name: "Acme Logistics",
    use_case_notes: "Refrigerated cargo only.",
    language: "en",
  })
  contains(text, "Acme Logistics")
  contains(text, "USD")
  contains(text, "Refrigerated cargo only.")
  contains(text, "speak English")
  assert.ok(!text.includes("Nauta"), "default company name leaked")
})
