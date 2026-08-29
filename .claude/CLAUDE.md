# Claude Code — Volta

Eres el agente de este repo. Cualquier sesión empieza aquí.

1. Lee `AGENTS.md` (mapa, arranque).
2. Aplica las reglas de `.cursor/rules/` (son las mismas para Cursor y Claude).
3. Para implementar o extender UI, usa el subagente `volta-frontend`.
4. Después de editar código, usa el subagente `clean-code-reviewer`.

## Comandos

- `npm start` — http://localhost:4200
- `npm run build` — debe pasar antes de dar una tarea por cerrada

## Recuerda

- Angular 21 standalone, zoneless.
- Scaffold vacío: carpetas y dependencias, sin UI ni lógica.
- No hagas commit ni push si el humano no lo pidió.
