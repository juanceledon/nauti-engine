// Server-side port of the carrier-call dispatch the frontend does today:
// pick carriers for the lane from the Nauti backend directory, then POST the
// same payload to Dapta's call_other_agents endpoint (one voice call per number).

export interface Carrier {
  id: string
  name: string
  phone: string
  supported_routes?: string[]
  primary_route?: string
}

export interface Mandate {
  origin: string
  destination: string
  mandate_max_price: number
  mandate_currency: string
  mandate_target_date: string
  cargo_category?: string
  weight_kg?: number
  container_size?: string
  container_type?: string
  hazmat?: boolean
  pickup_window?: string
  last_free_day?: string
  chassis_required?: boolean
  client_id?: string
  operation_id?: string
}

export interface DispatchPayload {
  numbers: string[]
  variables: Record<string, string>
  extra_variables: Record<string, string>
}

export interface Env {
  backendBase: string
  daptaUrl: string
  daptaKey: string
}

export const MAX_DISPATCH_CARRIERS = 5

export function envFromProcess(): Env {
  const backendBase = process.env.NAUTI_BACKEND_BASE || ""
  const daptaUrl = process.env.DAPTA_CALL_AGENTS_URL || ""
  const daptaKey = process.env.DAPTA_CALL_AGENTS_KEY || ""
  const missing = [
    !backendBase && "NAUTI_BACKEND_BASE",
    !daptaUrl && "DAPTA_CALL_AGENTS_URL",
    !daptaKey && "DAPTA_CALL_AGENTS_KEY",
  ].filter(Boolean)
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`)
  return { backendBase, daptaUrl, daptaKey }
}

const phoneDigits = (value: string | null | undefined) => (value ?? "").replace(/\D/g, "")

function carrierRoutes(carrier: Carrier): string[] {
  if (carrier.supported_routes?.length) return carrier.supported_routes
  return carrier.primary_route ? [carrier.primary_route] : []
}

function laneCode(origin: string, destination: string): string {
  return `${origin}-${destination}`.trim().toUpperCase().replace(/\s+/g, "")
}

function uniqueByPhone(carriers: Carrier[]): Carrier[] {
  const seen = new Set<string>()
  return carriers.filter((c) => {
    const digits = phoneDigits(c.phone)
    if (!digits || seen.has(digits)) return false
    seen.add(digits)
    return true
  })
}

// Same behavior as the frontend: prefer carriers matching the lane, fall back
// to any reachable carrier, cap at MAX_DISPATCH_CARRIERS.
export function pickCarriersForLane(carriers: Carrier[], origin: string, destination: string): Carrier[] {
  const reachable = uniqueByPhone(carriers.filter((c) => phoneDigits(c.phone)))
  const lane = laneCode(origin, destination)
  const onLane = reachable.filter((c) =>
    carrierRoutes(c).some((route) => route.trim().toUpperCase().replace(/\s+/g, "") === lane),
  )
  return (onLane.length ? onLane : reachable).slice(0, MAX_DISPATCH_CARRIERS)
}

// Variable names must stay exactly in sync with the voice agent configured in
// Dapta (they are injected into its prompt) and with the frontend's payload.
export function buildDispatchPayload(numbers: string[], mandate: Mandate): DispatchPayload {
  const extra: Record<string, string> = {}
  if (mandate.client_id?.trim()) extra["client_id"] = mandate.client_id.trim()
  if (mandate.operation_id?.trim()) extra["operation_id"] = mandate.operation_id.trim()
  return {
    numbers,
    variables: {
      origin: mandate.origin,
      destination: mandate.destination,
      mandate_max_price: String(mandate.mandate_max_price),
      mandate_currency: mandate.mandate_currency,
      mandate_target_date: mandate.mandate_target_date,
      cargo_category: mandate.cargo_category || "",
      weight_kg: mandate.weight_kg != null ? String(mandate.weight_kg) : "",
      container_size: mandate.container_size || "",
      container_type: mandate.container_type || "",
      hazmat: mandate.hazmat ? "true" : "false",
      pickup_window: mandate.pickup_window || "",
      last_free_day: mandate.last_free_day || "",
      chassis_required: mandate.chassis_required ? "true" : "false",
    },
    extra_variables: extra,
  }
}

async function asJson(res: Response, label: string): Promise<any> {
  const text = await res.text()
  if (!res.ok) throw new Error(`${label} failed (HTTP ${res.status}): ${text.slice(0, 300)}`)
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`${label} returned non-JSON: ${text.slice(0, 300)}`)
  }
}

export async function fetchCarriers(env: Env): Promise<Carrier[]> {
  const res = await fetch(`${env.backendBase}/carriers?page_size=100`)
  const data = await asJson(res, "GET /carriers")
  return data.items ?? data ?? []
}

export async function dispatchCalls(env: Env, payload: DispatchPayload): Promise<{ batch_id: string; total_calls?: number | string }> {
  const url = `${env.daptaUrl}?x-api-key=${encodeURIComponent(env.daptaKey)}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return asJson(res, "Dapta call_other_agents")
}

export async function pollBatch(env: Env, batchId: string): Promise<any> {
  const res = await fetch(`${env.backendBase}/dapta/call-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batch_id: batchId }),
  })
  return asJson(res, "POST /dapta/call-batch")
}
