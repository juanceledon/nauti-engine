import { tool } from "@opencode-ai/plugin"
import * as fs from "node:fs"
import * as path from "node:path"
import { composeAll, TRANSPORT_MODES } from "../../src/composer"

export default tool({
  description:
    "Generate the 3 Nauti voice-agent system prompts (Principal, Negociador, Confirmador) for a transport mode. " +
    "Deterministic composition from the markdown blocks in blocks/ — call it once per use case, after the interview.",
  args: {
    transport_mode: tool.schema.enum(TRANSPORT_MODES).describe("Transport mode: terrestre (trucking) or maritimo (ocean freight)"),
    use_case_notes: tool.schema
      .string()
      .optional()
      .describe("Use-case specifics distilled from the client interview (route, cargo, schedule quirks). Write them in English."),
    currency: tool.schema.string().optional().describe("Mandate currency code, default COP"),
    company_name: tool.schema.string().optional().describe("Company name, default Nauta"),
    language: tool.schema.enum(["es", "en"]).optional().describe("Spoken conversation language for the calls, default es"),
  },
  async execute(args, context) {
    const root = context.worktree || context.directory
    const files = composeAll(root, args)

    const outDir = path.join(root, "generated")
    fs.mkdirSync(outDir, { recursive: true })
    const written: string[] = []
    for (const [name, content] of Object.entries(files)) {
      const filePath = path.join(outDir, name)
      fs.writeFileSync(filePath, content, "utf8")
      written.push(filePath)
    }

    const summary = Object.entries(files)
      .map(([name, content]) => `=== ${name} (${content.length} chars) ===\n${content}`)
      .join("\n\n")
    return `Generated ${written.length} prompts for mode "${args.transport_mode}":\n${written.join("\n")}\n\n${summary}`
  },
})
