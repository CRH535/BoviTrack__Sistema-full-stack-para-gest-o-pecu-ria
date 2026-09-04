---
type: "query"
date: "2026-09-04T03:05:39.620343+00:00"
question: "Como adicionar o proprietário das propriedades somente para administradores no BoviTrack?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["propriedadesRoutes.js", "Propriedades()", "useAuth()", "autenticar()"]
---

# Q: Como adicionar o proprietário das propriedades somente para administradores no BoviTrack?

## Answer

O fluxo relevante é Propriedades.jsx para services/api, app.js/autenticar e propriedadesRoutes.js. A rota aplica ownership com req.usuario e agora faz JOIN condicional com usuarios somente para admin, serializando apenas id, nome e email; o frontend usa useAuth e usuario.perfil para renderizar os dados nos cards.

## Outcome

- Signal: useful

## Source Nodes

- propriedadesRoutes.js
- Propriedades()
- useAuth()
- autenticar()