# Graph Report - Teste  (2026-10-01)

## Corpus Check
- 151 files · ~192,657 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1050 nodes · 1794 edges · 88 communities (79 shown, 6 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 116 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8bbab947`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PreferencesProvider.jsx
- app.js
- migrate-to-supabase.js
- scripts
- desmamasRoutes.js
- devDependencies
- Migração do BoviTrack para o Supabase
- FichaAnimal
- authRoutes.js
- security-hardening.js
- App.jsx
- api.js
- AuthContext.jsx
- usuariosRoutes.js
- formatarDataSemFuso
- Desmamas.jsx
- log.js
- validacoes.js
- producoesLeiteirasRoutes.js
- auth-permissions.js
- sessoes.js
- Lucros.jsx
- Lotes
- usuariosController.js
- What You Must Do When Invoked
- registrarErro
- calf-management.js
- impactoExclusao.js
- graphify reference: extra exports and benchmark
- migrate-auth.js
- receitas.js
- Animais
- Lucros
- Usuarios
- MinhaConta
- propriedadesRoutes.js
- lotesRoutes.js
- Despesas
- Vacinacoes
- pool.js
- Propriedades
- Vacinas
- check-database.js
- migrate-animal-lots.js
- migrate-animals.js
- migrate-calf-management.js
- migrate-expenses.js
- migrate-milk-production.js
- migrate-refresh-sessions.js
- migrate-users.js
- BoviTrack Login Hero Image
- Expenses Icon
- Properties Icon
- Livestock Identification Icon
- Livestock Production Icon
- Livestock Vaccinations Icon
- Green Home Leaf Icon
- Logout Icon
- vercel.json
- Green B Leaf Brand Mark
- Cattle
- Animal-Lot Association
- Pasture Fence
- Calendar With Checkmark
- Medicine Bottle and Capsules
- Ícone verde de grupo de usuários
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- extraction-spec.md
- Q: Como adicionar o proprietário das propriedades somente para administradores no BoviTrack?
- tests/clima.js
- receitasRoutes.js
- milk-production.js
- Q: Quais componentes e estilos causam overflow e sobreposição no Dashboard do BoviTrack?
- ClimaPropriedade.jsx
- calf-management-integration.js
- server.js
- erros.js
- contextoRequisicao.js
- Q: Onde estão os campos de senha de Login, Cadastro e usuários?

## God Nodes (most connected - your core abstractions)
1. `registrarErro()` - 25 edges
2. `scripts` - 24 edges
3. `formatarDataSemFuso()` - 23 edges
4. `api` - 20 edges
5. `converterId()` - 19 edges
6. `FichaAnimal()` - 19 edges
7. `useAuth()` - 17 edges
8. `validarCamposPermitidos()` - 16 edges
9. `normalizarDataCalendario()` - 15 edges
10. `ControleDesmama()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Frontend limitado a VITE_API_URL` --conceptually_related_to--> `BoviTrack HTML entry`  [INFERRED]
  backend/database/SEGURANCA_PRODUCAO.md → frontend/index.html
- `Gestão pecuária de animais, lotes, vacinações e despesas` --conceptually_related_to--> `Migração do BoviTrack para o Supabase`  [INFERRED]
  frontend/index.html → backend/MIGRACAO_SUPABASE.md
- `TLS verify-full com CA confiável` --semantically_similar_to--> `TLS verify-full no runtime`  [INFERRED] [semantically similar]
  backend/MIGRACAO_SUPABASE.md → backend/database/SEGURANCA_PRODUCAO.md
- `Supabase Auth, Data API e RLS fora do fluxo` --semantically_similar_to--> `Data API desativada`  [INFERRED] [semantically similar]
  backend/MIGRACAO_SUPABASE.md → backend/database/SEGURANCA_PRODUCAO.md
- `criarConsultarClima()` --calls--> `registrarErro()`  [EXTRACTED]
  backend/controllers/climaController.js → backend/utils/log.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fluxo seguro de migração para Supabase** — backend_migracao_supabase_copia_transacional, backend_migracao_supabase_destino_vazio, backend_migracao_supabase_sequence_verification_002, backend_migracao_supabase_rollback_local [EXTRACTED 1.00]
- **Runtime serverless seguro do banco** — backend_database_seguranca_producao_runtime_least_privilege, backend_database_seguranca_producao_transaction_pooler_runtime, backend_database_seguranca_producao_tls_verify_full, backend_database_seguranca_producao_data_api_desativada, backend_database_seguranca_producao_post_deploy_verification [EXTRACTED 1.00]
- **Superfície de runtime do frontend BoviTrack** — frontend_readme_react_vite_template, frontend_index_bovitrack_html_entry, backend_database_seguranca_producao_frontend_public_config [INFERRED 0.75]

## Communities (88 total, 6 thin omitted)

### Community 0 - "PreferencesProvider.jsx"
Cohesion: 0.09
Nodes (29): obterElementosFocaveis(), TutorialDialog(), controlarTeclado(), elementoEstaVisivel(), obterElementosFocaveis(), TutorialOverlay(), controlarTeclado(), scheduleUpdate() (+21 more)

### Community 1 - "app.js"
Cohesion: 0.09
Nodes (21): animaisRoutes, { autenticar }, authRoutes, climaRoutes, { contextoRequisicao }, cors, { criarConfiguracaoCors }, dashboardRoutes (+13 more)

### Community 2 - "migrate-to-supabase.js"
Cohesion: 0.08
Nodes (41): analisarUrl(), configurarSsl(), criarConfiguracaoBanco(), criarConfiguracaoLegada(), criarConfiguracaoPorUrl(), fs, inteiroPositivo(), PARAMETROS_SSL_URL (+33 more)

### Community 3 - "scripts"
Cohesion: 0.04
Nodes (47): author, dependencies, bcryptjs, cors, dotenv, express, helmet, jsonwebtoken (+39 more)

### Community 4 - "desmamasRoutes.js"
Cohesion: 0.09
Nodes (25): {
  buscarAnimalPermitido,
  buscarLoteCompativel,
  buscarMaeCompativel,
}, {
  converterId,
  normalizarDataCalendario,
  normalizarDesmama,
  normalizarPaginacao,
  responderPagina,
  validarCamposPermitidos,
  normalizarTextoOpcional,
}, express, pool, { registrarErro }, router, { sincronizarPesoAtual }, { validarParametroId } (+17 more)

### Community 5 - "devDependencies"
Cohesion: 0.05
Nodes (38): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, dependencies, axios, react (+30 more)

### Community 6 - "Migração do BoviTrack para o Supabase"
Cohesion: 0.07
Nodes (33): Cookie HttpOnly e ausência de JWT em storage, Data API desativada, Frontend limitado a VITE_API_URL, Migrations de segurança e hardening, Rotação obrigatória de JWT_SECRET, Verificação de segurança pós-deploy, Login runtime de menor privilégio, Segurança do banco em produção (+25 more)

### Community 7 - "FichaAnimal"
Cohesion: 0.11
Nodes (23): ControleDesmama(), abrirConclusao(), cancelar(), carregar(), concluir(), planejar(), salvar(), novo() (+15 more)

### Community 8 - "authRoutes.js"
Cohesion: 0.12
Nodes (21): { autenticar }, bcrypt, { consumirLimite }, {
  criarSessaoRefresh,
  criarTokenAcesso,
  definirCookieRefresh,
  encerrarSessaoRefresh,
  encerrarTodasSessoes,
  lerRefreshToken,
  limparCookieRefresh,
  renovarSessaoRefresh,
}, emailNormalizado(), express, limitarCadastro, limitarLoginConta (+13 more)

### Community 9 - "security-hardening.js"
Cohesion: 0.09
Nodes (20): configuracao, dotenv, duracaoEmSegundos(), DURACOES, validarAmbiente(), { app }, assert, { consumirLimite } (+12 more)

### Community 10 - "App.jsx"
Cohesion: 0.15
Nodes (13): itensMenu, Layout(), AdminRoute(), ProtectedRoute(), useAuth(), IconeConfiguracoes(), PasswordInput(), Cadastro() (+5 more)

### Community 11 - "api.js"
Cohesion: 0.30
Nodes (8): IconeImagem(), icones, VoltarInicio(), formularioInicial, api, API_URL, CHAVES_AUTH_LEGADAS, ROTAS_SEM_RENOVACAO

### Community 12 - "AuthContext.jsx"
Cohesion: 0.10
Nodes (24): App(), sair(), AuthContext, AuthProvider(), avisarOutrasAbas(), finalizarLogoutVisual(), login(), logout() (+16 more)

### Community 13 - "usuariosRoutes.js"
Cohesion: 0.12
Nodes (18): autenticar(), exigirAutenticacaoRecente(), pool, { registrarErro }, somenteAdmin(), { verificarTokenAcesso }, { excluirUsuarioComDados }, express (+10 more)

### Community 14 - "formatarDataSemFuso"
Cohesion: 0.11
Nodes (23): ROTULOS_TIPO, STATUS, TIPOS, ControlePesagens(), carregar(), confirmarExclusao(), salvar(), gmd() (+15 more)

### Community 15 - "Desmamas.jsx"
Cohesion: 0.12
Nodes (9): RegistroFichaNotice(), Desmamas(), ROTULOS_STATUS, ROTULOS_TIPO, STATUS, TIPOS, Pesagens(), ROTULOS (+1 more)

### Community 16 - "log.js"
Cohesion: 0.20
Nodes (13): criarConfiguracaoCors(), normalizarOrigem(), obterOrigensPermitidas(), {
  normalizarOrigem,
  obterOrigensPermitidas,
}, origemDoReferer(), protegerContraCsrf(), { registrarEvento }, express (+5 more)

### Community 17 - "validacoes.js"
Cohesion: 0.12
Nodes (34): {
  converterId,
  normalizarDataNascimento,
  normalizarNumeroBrinco,
  normalizarPaginacao,
  responderPagina,
  validarCamposPermitidos,
  normalizarTextoObrigatorio,
  normalizarTextoOpcional,
  normalizarNumeroFinito,
}, express, normalizarDadosAnimal(), pool, { registrarErro }, router, { validarParametroId }, express (+26 more)

### Community 18 - "producoesLeiteirasRoutes.js"
Cohesion: 0.25
Nodes (7): { buscarAnimalPermitido }, {
  converterId,
  normalizarDataCalendario,
  normalizarProducaoLeiteira,
  normalizarPaginacao,
  responderPagina,
}, express, pool, { registrarErro }, router, { validarParametroId }

### Community 19 - "auth-permissions.js"
Cohesion: 0.33
Nodes (8): { app, pool }, assert, bcrypt, confirmar(), executar(), criarConjunto(), login(), requisitar()

### Community 20 - "sessoes.js"
Cohesion: 0.20
Nodes (15): {
  audience,
  expiracaoAcesso,
  issuer,
}, criarSessaoRefresh(), criarTokenAcesso(), crypto, definirCookieRefresh(), duracaoEmMilissegundos(), encerrarSessaoRefresh(), encerrarTodasSessoes() (+7 more)

### Community 21 - "Lucros.jsx"
Cohesion: 0.17
Nodes (10): ConfirmacaoExclusao(), descreverRegistro(), detalhesResumo(), formatarData(), ResumoImpactoExclusao(), ROTULOS_RESUMO, CATEGORIAS_SUGERIDAS, FILTROS_INICIAIS (+2 more)

### Community 22 - "Lotes"
Cohesion: 0.24
Nodes (8): Lotes(), adicionarAnimalAoLote(), carregarAnimaisDoLote(), carregarLotes(), gerenciarAnimais(), limparFormulario(), removerAnimalDoLote(), salvarLote()

### Community 23 - "usuariosController.js"
Cohesion: 0.27
Nodes (9): { criarUsuarioComum }, { registrarEvento, registrarErro }, responderCriacaoUsuario(), bcrypt, criarErroValidacao(), criarUsuarioComum(), { excluirUsuarioComDados }, pool (+1 more)

### Community 24 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 25 - "registrarErro"
Cohesion: 0.29
Nodes (8): { consumirLimite }, limitarRequisicoes(), { registrarErro, registrarEvento }, consumirLimite(), crypto, hashChave(), pool, registrarErro()

### Community 26 - "calf-management.js"
Cohesion: 0.32
Nodes (9): calcularGMD(), calcularIdadeEmDias(), calcularP205(), dataUtc(), montarResumoPesagens(), ordenarPesagens(), assert, {
  calcularGMD,
  calcularIdadeEmDias,
  calcularP205,
  montarResumoPesagens,
} (+1 more)

### Community 27 - "impactoExclusao.js"
Cohesion: 0.17
Nodes (23): executar(), {
  obterImpactoExclusaoPropriedade,
  obterImpactoExclusaoUsuario,
}, pool, VERIFICACOES_ORFAOS, adicionarSemDuplicar(), agregarGrupos(), buscarPropriedadeAutorizada(), consultarRegistrosDaPropriedade() (+15 more)

### Community 28 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 29 - "migrate-auth.js"
Cohesion: 0.25
Nodes (8): bcrypt, email, executar(), fs, lerMigracao(), nome, path, pool

### Community 30 - "receitas.js"
Cohesion: 0.36
Nodes (8): { app, pool }, assert, bcrypt, confirmar(), executar(), limpar(), login(), requisitar()

### Community 31 - "Animais"
Cohesion: 0.28
Nodes (6): Animais(), carregarAnimais(), limparFormulario(), salvarAnimal(), formatarDataSemFuso(), obterDataAtualLocal()

### Community 32 - "Lucros"
Cohesion: 0.25
Nodes (4): formatarMoeda(), Lucros(), limparFormulario(), salvarReceita()

### Community 33 - "Usuarios"
Cohesion: 0.25
Nodes (7): Usuarios(), alterarSituacao(), carregarUsuarios(), excluirUsuario(), fecharExclusaoUsuario(), fecharFormulario(), salvarUsuario()

### Community 35 - "propriedadesRoutes.js"
Cohesion: 0.12
Nodes (15): { converterId }, validarParametroId(), {
  excluirPropriedadeComDados,
  obterImpactoExclusaoPropriedade,
}, express, { normalizarPaginacao, responderPagina, validarCamposPermitidos, normalizarTextoObrigatorio, normalizarNumeroFinito }, pool, { registrarErro, registrarEvento }, router (+7 more)

### Community 36 - "lotesRoutes.js"
Cohesion: 0.13
Nodes (14): { converterId, normalizarPaginacao, responderPagina, validarCamposPermitidos, normalizarTextoObrigatorio, normalizarTextoOpcional }, express, pool, { registrarErro }, router, { validarParametroId }, express, { normalizarPaginacao, responderPagina, validarCamposPermitidos, normalizarTextoObrigatorio, normalizarTextoOpcional } (+6 more)

### Community 37 - "Despesas"
Cohesion: 0.32
Nodes (5): Despesas(), carregarDespesas(), limparFormulario(), salvarDespesa(), formatarDataSemFuso()

### Community 38 - "Vacinacoes"
Cohesion: 0.32
Nodes (4): Vacinacoes(), carregarVacinacoes(), limparFormulario(), salvarVacinacao()

### Community 39 - "pool.js"
Cohesion: 0.29
Nodes (4): { criarConfiguracaoBanco }, pool, { Pool, types }, pool

### Community 40 - "Propriedades"
Cohesion: 0.36
Nodes (6): Propriedades(), carregarPropriedades(), excluirPropriedade(), fecharExclusao(), limparFormulario(), salvarPropriedade()

### Community 41 - "Vacinas"
Cohesion: 0.47
Nodes (4): Vacinas(), carregarVacinas(), limparFormulario(), salvarVacina()

### Community 42 - "check-database.js"
Cohesion: 0.40
Nodes (3): pool, TABELAS, TABELAS_COM_SEQUENCE

### Community 43 - "migrate-animal-lots.js"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 44 - "migrate-animals.js"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 45 - "migrate-calf-management.js"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 46 - "migrate-expenses.js"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 47 - "migrate-milk-production.js"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 48 - "migrate-refresh-sessions.js"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 49 - "migrate-users.js"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 50 - "BoviTrack Login Hero Image"
Cohesion: 0.60
Nodes (5): Agricultural Landscape, Cultivated Green Fields, Farm Buildings, Golden-Hour Light, BoviTrack Login Hero Image

### Community 51 - "Expenses Icon"
Cohesion: 0.50
Nodes (5): Currency Symbol, Expense Tracking, Expenses Icon, Financial Receipt, Stacked Coins

### Community 52 - "Properties Icon"
Cohesion: 0.50
Nodes (5): Green Farm Barn, Cultivated Field Rows, Properties Icon, Rural Property, Farm Silo

### Community 53 - "Livestock Identification Icon"
Cohesion: 0.67
Nodes (4): Livestock Identification Icon, Livestock Identification, Identification Number 1234, Green Numbered Ear Tag

### Community 54 - "Livestock Production Icon"
Cohesion: 0.67
Nodes (4): Livestock Production Icon, Livestock Production Growth, Rising Green Bar Chart, Upward Trend

### Community 55 - "Livestock Vaccinations Icon"
Cohesion: 0.67
Nodes (4): Livestock Vaccinations Icon, Livestock Vaccination, Syringe with Green Liquid, Vaccine Vial

### Community 56 - "Green Home Leaf Icon"
Cohesion: 0.50
Nodes (4): Green Home Leaf Icon, Home Navigation, Leaf Motif, Sustainable Agriculture

### Community 57 - "Logout Icon"
Cohesion: 0.50
Nodes (4): Doorway, Logout Icon, Outbound Arrow, Sign Out

### Community 58 - "vercel.json"
Cohesion: 0.50
Nodes (3): headers, rewrites, $schema

### Community 59 - "Green B Leaf Brand Mark"
Cohesion: 0.67
Nodes (3): Bold White Letter B, Green B Leaf Brand Mark, Mint Green Leaf Sprout

### Community 60 - "Cattle"
Cohesion: 0.67
Nodes (3): Cattle, Cow Head Icon, Livestock Farming

### Community 61 - "Animal-Lot Association"
Cohesion: 1.00
Nodes (3): Animal-Lot Association, Green Chain Link, Animals and Lots Icon

### Community 62 - "Pasture Fence"
Cohesion: 0.67
Nodes (3): Fenced Paddock Icon, Livestock Lot, Pasture Fence

### Community 63 - "Calendar With Checkmark"
Cohesion: 0.67
Nodes (3): Calendar With Checkmark, Upcoming Vaccinations, Vaccination Schedule Icon

### Community 64 - "Medicine Bottle and Capsules"
Cohesion: 0.67
Nodes (3): Animal Vaccination, Medicine Bottle and Capsules, Vaccine Medication Icon

### Community 65 - "Ícone verde de grupo de usuários"
Cohesion: 0.67
Nodes (3): Gestão de usuários, Ícone verde de grupo de usuários, Três perfis humanos agrupados

### Community 69 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 70 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 71 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 72 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 77 - "Q: Como adicionar o proprietário das propriedades somente para administradores no BoviTrack?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Como adicionar o proprietário das propriedades somente para administradores no BoviTrack?, Source Nodes

### Community 78 - "tests/clima.js"
Cohesion: 0.08
Nodes (31): climaService, criarConsultarClima(), { ErroClima }, pool, { registrarErro }, { consultarClima }, express, router (+23 more)

### Community 79 - "receitasRoutes.js"
Cohesion: 0.18
Nodes (8): construirFiltro(), {
  converterId,
  normalizarDataCalendario,
  normalizarNumeroFinito,
  normalizarPaginacao,
  normalizarTextoObrigatorio,
  normalizarTextoOpcional,
  responderPagina,
  validarCamposPermitidos,
}, express, PERIODOS, pool, { registrarErro }, router, { validarParametroId }

### Community 80 - "milk-production.js"
Cohesion: 0.33
Nodes (8): { app, pool }, assert, confirmar(), dataNoFuso(), executar(), login(), requisitar(), somarDias()

### Community 81 - "Q: Quais componentes e estilos causam overflow e sobreposição no Dashboard do BoviTrack?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Quais componentes e estilos causam overflow e sobreposição no Dashboard do BoviTrack?, Source Nodes

### Community 82 - "ClimaPropriedade.jsx"
Cohesion: 0.43
Nodes (5): ClimaDashboard(), ClimaPropriedade(), CONDICOES, descreverClima(), formatarMedida()

### Community 83 - "calf-management-integration.js"
Cohesion: 0.32
Nodes (6): { app, pool }, assert, confirmar(), emails, executar(), requisitar()

### Community 84 - "server.js"
Cohesion: 0.50
Nodes (3): app, pool, { app, pool }

### Community 85 - "erros.js"
Cohesion: 0.50
Nodes (3): { registrarErro }, rotaNaoEncontrada(), tratarErros()

### Community 87 - "Q: Onde estão os campos de senha de Login, Cadastro e usuários?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Onde estão os campos de senha de Login, Cadastro e usuários?, Source Nodes

## Knowledge Gaps
- **432 isolated node(s):** `express`, `cors`, `helmet`, `{ criarConfiguracaoCors }`, `{ autenticar }` (+427 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 536 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `criarConfiguracaoPorUrl()` connect `migrate-to-supabase.js` to `security-hardening.js`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `FichaAnimal()` connect `FichaAnimal` to `App.jsx`, `formatarDataSemFuso`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `registrarErro()` connect `registrarErro` to `propriedadesRoutes.js`, `desmamasRoutes.js`, `lotesRoutes.js`, `authRoutes.js`, `usuariosRoutes.js`, `tests/clima.js`, `receitasRoutes.js`, `log.js`, `validacoes.js`, `producoesLeiteirasRoutes.js`, `erros.js`, `usuariosController.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `express`, `cors`, `helmet` to the rest of the system?**
  _432 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PreferencesProvider.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08819345661450925 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `migrate-to-supabase.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._