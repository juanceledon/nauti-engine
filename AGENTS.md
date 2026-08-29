# Volta — guía para agentes y developers

Scaffold Angular 21 standalone (zoneless) + Tailwind 4 + DaisyUI 5 + `@lucide/angular`. Sin UI ni lógica: solo carpetas y dependencias.

Lee este archivo antes de tocar código. Las reglas de Cursor viven en `.cursor/rules/`. El agente de Claude Code vive en `.claude/agents/`.

## Arranque

```bash
npm install
npm start          # http://localhost:4200
npm run build      # verifica que compile
```

- Node `^20.19 || ^22.12 || >=24`. Angular **21.2**.
- Naming 2025: `carrier-card.ts`, no `carrier-card.component.ts`.
- Componente nuevo: `npx ng generate component path/name --skip-tests`.

## Mapa del código

```
src/app/
  app.ts / app.html / app.config.ts
  core/models/
  core/mocks/
  layout/navbar/
  features/dashboard/
    arena/
    auditable-trail/
    call-brief-logs/
    carrier-card/
    commitment/
    operation-mandate/
```

## No hagas

- NgModules, `any`.
- Instalar librerías de UI extra (Material, PrimeNG, Chart.js) sin pedirlo.
- Commits, push o PRs si nadie lo pidió.
