# Fase 1 — setup

```bash
bun create vite admin-panel --template react-ts && cd admin-panel
bun add react-router-dom @tanstack/react-query axios zustand i18next react-i18next \
        react-hook-form zod @hookform/resolvers sonner
bun add -d tailwindcss @tailwindcss/vite @types/node
# Copy this folder's src/, vite.config.ts, vercel.json, .env.example over the template.
# Delete the template's App.css and src/assets.
```

tsconfig.json AND tsconfig.app.json need:
```json
"baseUrl": ".", "paths": { "@/*": ["./src/*"] }
```
Also enable `"resolveJsonModule": true` (locales are JSON).
shadcn/ui: `bunx shadcn@latest init` after the above (it starts being used in Phase 3).
