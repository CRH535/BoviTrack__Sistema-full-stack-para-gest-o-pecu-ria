---
type: "query"
date: "2026-09-04T03:21:35.768036+00:00"
question: "Quais componentes e estilos causam overflow e sobreposição no Dashboard do BoviTrack?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Dashboard()", "Layout()", "IconeImagem()", "GraficoPeso()", "GraficoProducaoLeite()"]
---

# Q: Quais componentes e estilos causam overflow e sobreposição no Dashboard do BoviTrack?

## Answer

Expanded from graph vocabulary: dashboard, layout, main, resumo, chart, grafico, icon, icone, icones. Graph traversal located Dashboard() in frontend/src/pages/Dashboard.jsx, Layout() in frontend/src/App.jsx, IconeImagem and the SVG chart components. Source inspection showed the root cause in frontend/src/index.css: a fixed six-column stats grid combined with 210px financial-card minimum widths exceeded the content width left by the sidebar and padding. The correction uses auto-fit/minmax based on available space, min-width:0 containment, fixed-size nonshrinking icons, and fluid SVG wrappers.

## Outcome

- Signal: useful

## Source Nodes

- Dashboard()
- Layout()
- IconeImagem()
- GraficoPeso()
- GraficoProducaoLeite()