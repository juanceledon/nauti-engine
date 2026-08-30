import { test } from "node:test"
import assert from "node:assert/strict"
import { buildDispatchPayload, pickCarriersForLane, MAX_DISPATCH_CARRIERS } from "../src/carrier-calls.ts"
import type { Carrier } from "../src/carrier-calls.ts"

const carrier = (id: string, phone: string, routes: string[] = []): Carrier => ({
  id,
  name: `Carrier ${id}`,
  phone,
  supported_routes: routes,
})

test("pickCarriersForLane prefers lane matches, ignores phoneless, dedupes by phone", () => {
  const carriers = [
    carrier("a", "+57 300 111 1111", ["Bogota-Cartagena"]),
    carrier("b", "+573001111111", ["Bogota-Cartagena"]), // same digits as a → deduped
    carrier("c", "+57 300 222 2222", ["CDMX-Veracruz"]),
    carrier("d", "", ["Bogota-Cartagena"]), // no phone → dropped
    carrier("e", "+57 300 333 3333", ["bogota - cartagena"]), // lane match despite spacing/case
  ]
  const picked = pickCarriersForLane(carriers, "Bogota", "Cartagena")
  assert.deepEqual(picked.map((c) => c.id), ["a", "e"])
})

test("pickCarriersForLane falls back to all reachable and caps at max", () => {
  const carriers = Array.from({ length: 9 }, (_, i) => carrier(String(i), `+57300000000${i}`, ["X-Y"]))
  const picked = pickCarriersForLane(carriers, "Bogota", "Cartagena")
  assert.equal(picked.length, MAX_DISPATCH_CARRIERS)
})

test("buildDispatchPayload matches the frontend variable contract exactly", () => {
  const payload = buildDispatchPayload(["+573014259125"], {
    origin: "Bogota",
    destination: "Cartagena",
    mandate_max_price: 2000000,
    mandate_currency: "COP",
    mandate_target_date: "2026-09-03",
    cargo_category: "palletized",
    weight_kg: 20000,
    hazmat: false,
    client_id: "cli_1",
  })
  assert.deepEqual(Object.keys(payload.variables), [
    "origin",
    "destination",
    "mandate_max_price",
    "mandate_currency",
    "mandate_target_date",
    "cargo_category",
    "weight_kg",
    "container_size",
    "container_type",
    "hazmat",
    "pickup_window",
    "last_free_day",
    "chassis_required",
  ])
  assert.equal(payload.variables.mandate_max_price, "2000000")
  assert.equal(payload.variables.weight_kg, "20000")
  assert.equal(payload.variables.hazmat, "false")
  assert.equal(payload.variables.container_size, "")
  assert.deepEqual(payload.extra_variables, { client_id: "cli_1" })
  assert.deepEqual(payload.numbers, ["+573014259125"])
})
