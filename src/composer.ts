import * as fs from "node:fs"
import * as path from "node:path"

export const ROLES = ["principal", "negociador", "confirmador"] as const
export const TRANSPORT_MODES = ["terrestre", "maritimo"] as const

export type Role = (typeof ROLES)[number]
export type TransportMode = (typeof TRANSPORT_MODES)[number]

export const MODE_LABELS: Record<TransportMode, string> = {
  terrestre: "ground (trucking)",
  maritimo: "sea (ocean freight)",
}

export const LANGUAGE_LABELS: Record<string, string> = {
  es: "Spanish (Latin American)",
  en: "English",
}

export interface ComposeVars {
  transport_mode: TransportMode
  use_case_notes?: string
  currency?: string
  company_name?: string
  language?: string
}

function readBlock(root: string, relPath: string): string {
  return fs.readFileSync(path.join(root, "blocks", relPath), "utf8").trim()
}

export function composeRole(root: string, role: Role, input: ComposeVars): string {
  const mode = input.transport_mode
  const vars: Record<string, string> = {
    transport_mode: mode,
    transport_mode_label: MODE_LABELS[mode],
    currency: input.currency || "COP",
    company_name: input.company_name || "Nauta",
    language_label: LANGUAGE_LABELS[input.language || "es"] || input.language || "Spanish (Latin American)",
    use_case_notes: input.use_case_notes?.trim() || "(none — standard flow for this transport mode)",
  }

  const markers: Record<string, string> = {
    "[[BLOCK:NAUTA_CONTEXT]]": readBlock(root, "shared/nauta-context.md"),
    "[[BLOCK:PRINCIPIOS]]": readBlock(root, "shared/principios.md"),
    "[[BLOCK:ESTILO_VOZ]]": readBlock(root, "shared/estilo-voz.md"),
    "[[BLOCK:MODE_VOCABULARIO]]": readBlock(root, `modes/${mode}/vocabulario.md`),
    "[[BLOCK:MODE_PREGUNTAS]]": readBlock(root, `modes/${mode}/preguntas-principal.md`),
    "[[BLOCK:MODE_NEGOCIACION]]": readBlock(root, `modes/${mode}/contexto-negociacion.md`),
  }

  let text = readBlock(root, `roles/${role}.md`)
  for (const [marker, content] of Object.entries(markers)) text = text.replaceAll(marker, content)
  for (const [key, value] of Object.entries(vars)) text = text.replaceAll(`{{${key}}}`, value)

  const leftover = text.match(/\[\[BLOCK:[A-Z_]+\]\]|\{\{[a-z_]+\}\}/)
  if (leftover) throw new Error(`Unresolved placeholder "${leftover[0]}" while composing role "${role}" (mode ${mode})`)
  return text + "\n"
}

export function composeAll(root: string, input: ComposeVars): Record<string, string> {
  const files: Record<string, string> = {}
  for (const role of ROLES) files[`nauti-${role}-${input.transport_mode}.md`] = composeRole(root, role, input)
  return files
}
