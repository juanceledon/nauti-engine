import { tool } from "@opencode-ai/plugin"
import { envFromProcess, pollBatch } from "../../src/carrier-calls"

export default tool({
  description:
    "Check the status and quotes of a carrier call batch started with call_carriers. " +
    "Returns the raw batch state: per-call status and any quotes gathered so far. " +
    "Report to the client ONLY prices that appear here — never invent or estimate quotes.",
  args: {
    batch_id: tool.schema.string().describe("The batch_id returned by call_carriers"),
  },
  async execute(args) {
    const env = envFromProcess()
    const batch = await pollBatch(env, args.batch_id)
    return JSON.stringify(batch, null, 1)
  },
})
