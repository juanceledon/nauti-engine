import { tool } from "@opencode-ai/plugin"
import {
  buildDispatchPayload,
  createOperation,
  dispatchCalls,
  envFromProcess,
  fetchCarriers,
  pickCarriersForLane,
} from "../../src/carrier-calls"

export default tool({
  description:
    "Dispatch parallel voice calls to transport carriers to get real quotes for a confirmed mandate. " +
    "One voice agent calls each carrier on the lane and negotiates within the mandate. " +
    "ONLY call this after the client explicitly confirmed the mandate summary (max price + target date). " +
    "Returns the batch_id to poll with check_calls.",
  args: {
    origin: tool.schema.string().describe("Cargo origin (city or port)"),
    destination: tool.schema.string().describe("Cargo destination (city or port)"),
    mandate_max_price: tool.schema.number().describe("Client's confirmed price ceiling (number only)"),
    mandate_currency: tool.schema.string().describe("Currency code of the mandate, e.g. COP, MXN, USD"),
    mandate_target_date: tool.schema.string().describe("Target service date, YYYY-MM-DD"),
    cargo_category: tool.schema.string().optional().describe("Cargo category/type as described by the client"),
    weight_kg: tool.schema.number().optional().describe("Cargo weight in kilograms"),
    container_size: tool.schema.string().optional().describe("Container size if containerized, e.g. 20, 40"),
    container_type: tool.schema.string().optional().describe("Container type, e.g. dry, reefer"),
    hazmat: tool.schema.boolean().optional().describe("True if hazardous cargo"),
    pickup_window: tool.schema.string().optional().describe("Pickup time window if the client gave one"),
    last_free_day: tool.schema.string().optional().describe("Last free day if applicable, YYYY-MM-DD"),
    chassis_required: tool.schema.boolean().optional().describe("True if a chassis is required"),
    client_id: tool.schema.string().optional().describe("Client id if known from the session context"),
    operation_id: tool.schema.string().optional().describe("Operation id if one already exists"),
  },
  async execute(args) {
    const env = envFromProcess()
    const carriers = await fetchCarriers(env)
    const picked = pickCarriersForLane(carriers, args.origin, args.destination)
    if (!picked.length) {
      return "No carrier with a phone number is available for this lane. Tell the client the requirement was registered and the operations team will follow up."
    }

    // Register the operation first so the deal shows up in the UI; the calls
    // then carry its id. Dispatch still proceeds if registration fails.
    let operationNote = "No operation record created (missing client_id)."
    let operationId = args.operation_id
    if (!operationId && args.client_id?.trim()) {
      try {
        operationId = (await createOperation(env, args)).id
        operationNote = `Operation ${operationId} created — the deal is now visible in the client's panel.`
      } catch (error) {
        operationNote = `Operation record could not be created (${error instanceof Error ? error.message : error}); calls dispatched anyway.`
      }
    } else if (operationId) {
      operationNote = `Using existing operation ${operationId}.`
    }

    const payload = buildDispatchPayload(
      picked.map((c) => c.phone),
      { ...args, operation_id: operationId },
    )
    const started = await dispatchCalls(env, payload)
    const names = picked.map((c) => c.name).join(", ")
    return `Dispatched ${picked.length} carrier calls (batch_id: ${started.batch_id}). Carriers: ${names}. ${operationNote} Poll results with check_calls using this batch_id; calls typically take a few minutes.`
  },
})
