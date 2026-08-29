# Volta — AI Logistics Dashboard

Maqueta visual estática (boilerplate) del command deck para un agente de voz de logística. Angular 21 standalone, Tailwind CSS 4, DaisyUI 5 y Lucide. Toda la UI corre con mock data; no hay APIs ni base de datos.

## Requisitos

- Node.js `^20.19 || ^22.12 || >=24` (esta máquina usa `v22.20.0`, compatible con Angular 21)
- npm 8+

> Angular 22 CLI exige Node `>=22.22.3`. En este hackathon se usa **Angular 21.2** (última línea que corre en Node 22.20).

## Inicializar el stack (comandos)

Si partes de cero en otra carpeta:

```bash
# 1. Proyecto Angular standalone + Tailwind 4 (CLI 21)
npx -y @angular/cli@21 new volta --style=tailwind --ssr=false --skip-git --skip-tests --routing=false --standalone --zoneless --interactive=false --ai-config=none

cd volta

# 2. DaisyUI + Lucide
npm install daisyui@latest @lucide/angular --force

# 3. DaisyUI usa color-mix(); apunta el build a browsers modernos
npm pkg set browserslist="> 1%"
```

En `src/styles.css`:

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: volta --default;
}
```

PostCSS ya queda en `.postcssrc.json` gracias a `--style=tailwind`:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

## Correr este repo

```bash
npm install
npm start
```

Abre [http://localhost:4200](http://localhost:4200).

```bash
npm run build   # producción
```

## Mapa de componentes

| Superficie | Selector | Archivo |
|---|---|---|
| Shell | `app-root` | `src/app/app.ts` |
| Navbar + Agent Online | `app-navbar` | `src/app/layout/navbar/` |
| Dashboard | `app-dashboard` | `src/app/features/dashboard/` |
| Operation Mandate | `app-operation-mandate` | `.../operation-mandate/` |
| The Arena | `app-arena` | `.../arena/` |
| Carrier card | `app-carrier-card` | `.../carrier-card/` |
| Auditable Trail | `app-auditable-trail` | `.../auditable-trail/` |
| Call Brief Logs | `app-call-brief-logs` | `.../call-brief-logs/` |
| The Commitment | `app-commitment` | `.../commitment/` |

Mock data: `src/app/core/mocks/dashboard.mock.ts`.

## Estados mock de The Arena

- **Transportes del Valle** → `Calling...` + `animate-pulse` + waveform (agente hablando)
- **Flota Norte Express** → `Rejected`
- **Express Pacífico** → `Won/Committed`

Los logs del terminal caen en secuencia (mock, sin backend). `Play Audio Recap` solo simula reproducción.

## Agentes y reglas

Cualquier developer o agente (Cursor / Claude Code) debe leer **[AGENTS.md](./AGENTS.md)** primero.

| Dónde | Qué |
|---|---|
| `AGENTS.md` | Mapa del repo, arranque, cómo cambiar código |
| `.cursor/rules/` | Reglas que Cursor aplica solo (proyecto, clean code, Angular, UI) |
| `.cursor/agents/` y `.claude/agents/` | `volta-frontend` (implementa) y `clean-code-reviewer` (revisa) |
| `.claude/CLAUDE.md` | Entrada de Claude Code |
