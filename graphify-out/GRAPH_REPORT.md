# Graph Report - Teste  (2026-09-01)

## Corpus Check
- 141 files · ~175,748 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 880 nodes · 1542 edges · 69 communities
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend Transitions and Icons
- Express API Composition
- PostgreSQL TLS Configuration
- Backend Package Dependencies
- Weaning Backend Logic
- Frontend Tooling Dependencies
- Production Security Guidance
- Weaning UI Workflow
- Authentication Routes
- Environment Validation
- Frontend Routing Layout
- Shared UI Components
- Authentication Context
- Authorization Middleware
- Calf Management Components
- Weaning Listing UI
- CORS and CSRF
- Animal API Routes
- Filtering and Vaccinations
- Weighing UI Workflow
- Refresh Session Service
- Confirmation and Account
- Lot Management UI
- User Administration Backend
- Revenue API Routes
- Database Rate Limiting
- Validation and Lot API
- Expense API Routes
- Auth Integration Tests
- Auth Migration Script
- Revenue Integration Tests
- Animal Management UI
- Profit Dashboard UI
- User Administration UI
- Milk Production API
- Property API Routes
- Vaccine API Routes
- Expense Management UI
- Vaccination Management UI
- Database Pool and Audit
- Property Management UI
- Vaccine Catalog UI
- Database Integrity Checks
- Animal Lots Migration
- Animals Migration
- Calf Management Migration
- Expenses Migration
- Milk Production Migration
- Refresh Sessions Migration
- Users Migration
- Login Agricultural Hero
- Expense Iconography
- Property Iconography
- Livestock Identification Icon
- Production Growth Icon
- Vaccination Procedure Icon
- Home Navigation Icon
- Logout Iconography
- Vercel Frontend Deployment
- BoviTrack Brand Mark
- Cattle Iconography
- Animal Lot Association
- Lot Fencing Icon
- Vaccination Schedule Icon
- Vaccine Medication Icon
- User Management Icon

## God Nodes (most connected - your core abstractions)
1. `registrarErro()` - 23 edges
2. `scripts` - 21 edges
3. `formatarDataSemFuso()` - 21 edges
4. `converterId()` - 19 edges
5. `FichaAnimal()` - 19 edges
6. `api` - 18 edges
7. `validarCamposPermitidos()` - 16 edges
8. `normalizarDataCalendario()` - 15 edges
9. `useAuth()` - 15 edges
10. `ControleDesmama()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Gestão pecuária de animais, lotes, vacinações e despesas` --conceptually_related_to--> `Migração do BoviTrack para o Supabase`  [INFERRED]
  frontend/index.html → backend/MIGRACAO_SUPABASE.md
- `Frontend limitado a VITE_API_URL` --conceptually_related_to--> `BoviTrack HTML entry`  [INFERRED]
  backend/database/SEGURANCA_PRODUCAO.md → frontend/index.html
- `Supabase Auth, Data API e RLS fora do fluxo` --semantically_similar_to--> `Data API desativada`  [INFERRED] [semantically similar]
  backend/MIGRACAO_SUPABASE.md → backend/database/SEGURANCA_PRODUCAO.md
- `TLS verify-full com CA confiável` --semantically_similar_to--> `TLS verify-full no runtime`  [INFERRED] [semantically similar]
  backend/MIGRACAO_SUPABASE.md → backend/database/SEGURANCA_PRODUCAO.md
- `responderCriacaoUsuario()` --calls--> `registrarErro()`  [EXTRACTED]
  backend/controllers/usuariosController.js → backend/utils/log.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fluxo seguro de migração para Supabase** — backend_migracao_supabase_copia_transacional, backend_migracao_supabase_destino_vazio, backend_migracao_supabase_sequence_verification_002, backend_migracao_supabase_rollback_local [EXTRACTED 1.00]
- **Runtime serverless seguro do banco** — backend_database_seguranca_producao_runtime_least_privilege, backend_database_seguranca_producao_transaction_pooler_runtime, backend_database_seguranca_producao_tls_verify_full, backend_database_seguranca_producao_data_api_desativada, backend_database_seguranca_producao_post_deploy_verification [EXTRACTED 1.00]
- **Superfície de runtime do frontend BoviTrack** — frontend_readme_react_vite_template, frontend_index_bovitrack_html_entry, backend_database_seguranca_producao_frontend_public_config [INFERRED 0.75]

## Communities (69 total, 0 thin omitted)

### Community 0 - "Frontend Transitions and Icons"
Cohesion: 0.06
Nodes (38): App(), IconeConfiguracoes(), BlackHoleTransition(), PARTICULAS, obterElementosFocaveis(), TutorialDialog(), controlarTeclado(), elementoEstaVisivel() (+30 more)

### Community 1 - "Express API Composition"
Cohesion: 0.05
Nodes (42): animaisRoutes, app, { autenticar }, authRoutes, { contextoRequisicao }, cors, { criarConfiguracaoCors }, dashboardRoutes (+34 more)

### Community 2 - "PostgreSQL TLS Configuration"
Cohesion: 0.08
Nodes (41): analisarUrl(), configurarSsl(), criarConfiguracaoBanco(), criarConfiguracaoLegada(), criarConfiguracaoPorUrl(), fs, inteiroPositivo(), PARAMETROS_SSL_URL (+33 more)

### Community 3 - "Backend Package Dependencies"
Cohesion: 0.04
Nodes (44): author, dependencies, bcryptjs, cors, dotenv, express, helmet, jsonwebtoken (+36 more)

### Community 4 - "Weaning Backend Logic"
Cohesion: 0.07
Nodes (34): {
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
}, express, pool, { registrarErro }, router, { sincronizarPesoAtual }, { validarParametroId } (+26 more)

### Community 5 - "Frontend Tooling Dependencies"
Cohesion: 0.05
Nodes (38): axios, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, dependencies, axios, react (+30 more)

### Community 6 - "Production Security Guidance"
Cohesion: 0.07
Nodes (33): Cookie HttpOnly e ausência de JWT em storage, Data API desativada, Frontend limitado a VITE_API_URL, Migrations de segurança e hardening, Rotação obrigatória de JWT_SECRET, Verificação de segurança pós-deploy, Login runtime de menor privilégio, Segurança do banco em produção (+25 more)

### Community 7 - "Weaning UI Workflow"
Cohesion: 0.11
Nodes (23): ControleDesmama(), abrirConclusao(), cancelar(), carregar(), concluir(), planejar(), salvar(), novo() (+15 more)

### Community 8 - "Authentication Routes"
Cohesion: 0.10
Nodes (24): { autenticar }, bcrypt, { consumirLimite }, {
  criarSessaoRefresh,
  criarTokenAcesso,
  definirCookieRefresh,
  encerrarSessaoRefresh,
  encerrarTodasSessoes,
  lerRefreshToken,
  limparCookieRefresh,
  renovarSessaoRefresh,
}, emailNormalizado(), express, limitarCadastro, limitarLoginConta (+16 more)

### Community 9 - "Environment Validation"
Cohesion: 0.09
Nodes (20): configuracao, dotenv, duracaoEmSegundos(), DURACOES, validarAmbiente(), { app }, assert, { consumirLimite } (+12 more)

### Community 10 - "Frontend Routing Layout"
Cohesion: 0.21
Nodes (10): itensMenu, Layout(), AdminRoute(), ProtectedRoute(), useAuth(), Cadastro(), Dashboard(), resumoInicial (+2 more)

### Community 11 - "Shared UI Components"
Cohesion: 0.25
Nodes (11): IconeImagem(), icones, VoltarInicio(), CATEGORIAS_SUGERIDAS, FILTROS_INICIAIS, FORMAS_RECEBIMENTO, RESUMO_INICIAL, api (+3 more)

### Community 12 - "Authentication Context"
Cohesion: 0.16
Nodes (17): sair(), AuthContext, AuthProvider(), avisarOutrasAbas(), finalizarLogoutVisual(), login(), logout(), logoutTodosDispositivos() (+9 more)

### Community 13 - "Authorization Middleware"
Cohesion: 0.12
Nodes (17): autenticar(), exigirAutenticacaoRecente(), pool, { registrarErro }, somenteAdmin(), { verificarTokenAcesso }, { excluirUsuarioComDados }, express (+9 more)

### Community 14 - "Calf Management Components"
Cohesion: 0.20
Nodes (13): ROTULOS_TIPO, STATUS, TIPOS, GraficoPeso(), margem, formatarLitros(), GraficoProducaoLeite(), margem (+5 more)

### Community 15 - "Weaning Listing UI"
Cohesion: 0.12
Nodes (9): RegistroFichaNotice(), Desmamas(), ROTULOS_STATUS, ROTULOS_TIPO, STATUS, TIPOS, Pesagens(), ROTULOS (+1 more)

### Community 16 - "CORS and CSRF"
Cohesion: 0.20
Nodes (13): criarConfiguracaoCors(), normalizarOrigem(), obterOrigensPermitidas(), {
  normalizarOrigem,
  obterOrigensPermitidas,
}, origemDoReferer(), protegerContraCsrf(), { registrarEvento }, express (+5 more)

### Community 17 - "Animal API Routes"
Cohesion: 0.16
Nodes (15): {
  converterId,
  normalizarDataNascimento,
  normalizarNumeroBrinco,
  normalizarPaginacao,
  responderPagina,
  validarCamposPermitidos,
  normalizarTextoObrigatorio,
  normalizarTextoOpcional,
  normalizarNumeroFinito,
}, express, normalizarDadosAnimal(), pool, { registrarErro }, router, { validarParametroId }, METODOS_PESAGEM (+7 more)

### Community 18 - "Filtering and Vaccinations"
Cohesion: 0.22
Nodes (16): normalizarFiltros(), normalizarReceita(), express, normalizarDadosVacinacao(), { normalizarPaginacao, responderPagina, validarCamposPermitidos, converterId, normalizarDataCalendario, normalizarTextoOpcional }, pool, { registrarErro }, router (+8 more)

### Community 19 - "Weighing UI Workflow"
Cohesion: 0.19
Nodes (10): ControlePesagens(), carregar(), confirmarExclusao(), salvar(), gmd(), kg(), METODOS, RESUMO_VAZIO (+2 more)

### Community 20 - "Refresh Session Service"
Cohesion: 0.24
Nodes (12): {
  audience,
  expiracaoAcesso,
  issuer,
}, criarSessaoRefresh(), criarTokenAcesso(), crypto, duracaoEmMilissegundos(), encerrarSessaoRefresh(), encerrarTodasSessoes(), gerarIdentificadorSessao() (+4 more)

### Community 21 - "Confirmation and Account"
Cohesion: 0.20
Nodes (3): ConfirmacaoExclusao(), MinhaConta(), formularioInicial

### Community 22 - "Lot Management UI"
Cohesion: 0.24
Nodes (8): Lotes(), adicionarAnimalAoLote(), carregarAnimaisDoLote(), carregarLotes(), gerenciarAnimais(), limparFormulario(), removerAnimalDoLote(), salvarLote()

### Community 23 - "User Administration Backend"
Cohesion: 0.29
Nodes (9): { criarUsuarioComum }, { registrarEvento, registrarErro }, responderCriacaoUsuario(), bcrypt, criarErroValidacao(), criarUsuarioComum(), excluirUsuarioComDados(), pool (+1 more)

### Community 24 - "Revenue API Routes"
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

### Community 25 - "Database Rate Limiting"
Cohesion: 0.29
Nodes (8): { consumirLimite }, limitarRequisicoes(), { registrarErro, registrarEvento }, consumirLimite(), crypto, hashChave(), pool, registrarErro()

### Community 26 - "Validation and Lot API"
Cohesion: 0.22
Nodes (8): { converterId }, validarParametroId(), { converterId, normalizarPaginacao, responderPagina, validarCamposPermitidos, normalizarTextoObrigatorio, normalizarTextoOpcional }, express, pool, { registrarErro }, router, { validarParametroId }

### Community 27 - "Expense API Routes"
Cohesion: 0.24
Nodes (9): express, normalizarDadosDespesa(), { normalizarFormaPagamento, normalizarPaginacao, responderPagina, validarCamposPermitidos, converterId, normalizarDataCalendario, normalizarTextoObrigatorio, normalizarNumeroFinito }, pool, { registrarErro }, router, { validarParametroId }, normalizarFormaPagamento() (+1 more)

### Community 28 - "Auth Integration Tests"
Cohesion: 0.33
Nodes (8): { app, pool }, assert, bcrypt, confirmar(), executar(), criarConjunto(), login(), requisitar()

### Community 29 - "Auth Migration Script"
Cohesion: 0.25
Nodes (8): bcrypt, email, executar(), fs, lerMigracao(), nome, path, pool

### Community 30 - "Revenue Integration Tests"
Cohesion: 0.36
Nodes (8): { app, pool }, assert, bcrypt, confirmar(), executar(), limpar(), login(), requisitar()

### Community 31 - "Animal Management UI"
Cohesion: 0.28
Nodes (6): Animais(), carregarAnimais(), limparFormulario(), salvarAnimal(), formatarDataSemFuso(), obterDataAtualLocal()

### Community 32 - "Profit Dashboard UI"
Cohesion: 0.25
Nodes (4): formatarMoeda(), Lucros(), limparFormulario(), salvarReceita()

### Community 33 - "User Administration UI"
Cohesion: 0.31
Nodes (5): Usuarios(), alterarSituacao(), carregarUsuarios(), fecharFormulario(), salvarUsuario()

### Community 34 - "Milk Production API"
Cohesion: 0.25
Nodes (7): { buscarAnimalPermitido }, {
  converterId,
  normalizarDataCalendario,
  normalizarProducaoLeiteira,
  normalizarPaginacao,
  responderPagina,
}, express, pool, { registrarErro }, router, { validarParametroId }

### Community 35 - "Property API Routes"
Cohesion: 0.25
Nodes (7): express, { normalizarPaginacao, responderPagina, validarCamposPermitidos, normalizarTextoObrigatorio, normalizarNumeroFinito }, pool, { registrarErro }, router, { validarParametroId }, normalizarPaginacao()

### Community 36 - "Vaccine API Routes"
Cohesion: 0.25
Nodes (7): express, { normalizarPaginacao, responderPagina, validarCamposPermitidos, normalizarTextoObrigatorio, normalizarTextoOpcional }, pool, { registrarErro }, router, { validarParametroId }, responderPagina()

### Community 37 - "Expense Management UI"
Cohesion: 0.32
Nodes (5): Despesas(), carregarDespesas(), limparFormulario(), salvarDespesa(), formatarDataSemFuso()

### Community 38 - "Vaccination Management UI"
Cohesion: 0.32
Nodes (4): Vacinacoes(), carregarVacinacoes(), limparFormulario(), salvarVacinacao()

### Community 39 - "Database Pool and Audit"
Cohesion: 0.29
Nodes (4): { criarConfiguracaoBanco }, pool, { Pool, types }, pool

### Community 40 - "Property Management UI"
Cohesion: 0.47
Nodes (4): Propriedades(), carregarPropriedades(), limparFormulario(), salvarPropriedade()

### Community 41 - "Vaccine Catalog UI"
Cohesion: 0.47
Nodes (4): Vacinas(), carregarVacinas(), limparFormulario(), salvarVacina()

### Community 42 - "Database Integrity Checks"
Cohesion: 0.40
Nodes (3): pool, TABELAS, TABELAS_COM_SEQUENCE

### Community 43 - "Animal Lots Migration"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 44 - "Animals Migration"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 45 - "Calf Management Migration"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 46 - "Expenses Migration"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 47 - "Milk Production Migration"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 48 - "Refresh Sessions Migration"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 49 - "Users Migration"
Cohesion: 0.40
Nodes (3): fs, path, pool

### Community 50 - "Login Agricultural Hero"
Cohesion: 0.60
Nodes (5): Agricultural Landscape, Cultivated Green Fields, Farm Buildings, Golden-Hour Light, BoviTrack Login Hero Image

### Community 51 - "Expense Iconography"
Cohesion: 0.50
Nodes (5): Currency Symbol, Expense Tracking, Expenses Icon, Financial Receipt, Stacked Coins

### Community 52 - "Property Iconography"
Cohesion: 0.50
Nodes (5): Green Farm Barn, Cultivated Field Rows, Properties Icon, Rural Property, Farm Silo

### Community 53 - "Livestock Identification Icon"
Cohesion: 0.67
Nodes (4): Livestock Identification Icon, Livestock Identification, Identification Number 1234, Green Numbered Ear Tag

### Community 54 - "Production Growth Icon"
Cohesion: 0.67
Nodes (4): Livestock Production Icon, Livestock Production Growth, Rising Green Bar Chart, Upward Trend

### Community 55 - "Vaccination Procedure Icon"
Cohesion: 0.67
Nodes (4): Livestock Vaccinations Icon, Livestock Vaccination, Syringe with Green Liquid, Vaccine Vial

### Community 56 - "Home Navigation Icon"
Cohesion: 0.50
Nodes (4): Green Home Leaf Icon, Home Navigation, Leaf Motif, Sustainable Agriculture

### Community 57 - "Logout Iconography"
Cohesion: 0.50
Nodes (4): Doorway, Logout Icon, Outbound Arrow, Sign Out

### Community 58 - "Vercel Frontend Deployment"
Cohesion: 0.50
Nodes (3): headers, rewrites, $schema

### Community 59 - "BoviTrack Brand Mark"
Cohesion: 0.67
Nodes (3): Bold White Letter B, Green B Leaf Brand Mark, Mint Green Leaf Sprout

### Community 60 - "Cattle Iconography"
Cohesion: 0.67
Nodes (3): Cattle, Cow Head Icon, Livestock Farming

### Community 61 - "Animal Lot Association"
Cohesion: 1.00
Nodes (3): Animal-Lot Association, Green Chain Link, Animals and Lots Icon

### Community 62 - "Lot Fencing Icon"
Cohesion: 0.67
Nodes (3): Fenced Paddock Icon, Livestock Lot, Pasture Fence

### Community 63 - "Vaccination Schedule Icon"
Cohesion: 0.67
Nodes (3): Calendar With Checkmark, Upcoming Vaccinations, Vaccination Schedule Icon

### Community 64 - "Vaccine Medication Icon"
Cohesion: 0.67
Nodes (3): Animal Vaccination, Medicine Bottle and Capsules, Vaccine Medication Icon

### Community 65 - "User Management Icon"
Cohesion: 0.67
Nodes (3): Gestão de usuários, Ícone verde de grupo de usuários, Três perfis humanos agrupados

## Knowledge Gaps
- **349 isolated node(s):** `express`, `cors`, `helmet`, `{ criarConfiguracaoCors }`, `{ autenticar }` (+344 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 434 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `criarConfiguracaoPorUrl()` connect `PostgreSQL TLS Configuration` to `Environment Validation`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `FichaAnimal()` connect `Weaning UI Workflow` to `Frontend Routing Layout`, `Calf Management Components`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `formatarDataSemFuso()` connect `Calf Management Components` to `Profit Dashboard UI`, `Vaccination Management UI`, `Weaning UI Workflow`, `Frontend Routing Layout`, `Shared UI Components`, `Weaning Listing UI`, `Weighing UI Workflow`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `express`, `cors`, `helmet` to the rest of the system?**
  _349 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Transitions and Icons` be split into smaller, more focused modules?**
  _Cohesion score 0.06429070580013976 - nodes in this community are weakly interconnected._
- **Should `Express API Composition` be split into smaller, more focused modules?**
  _Cohesion score 0.05061224489795919 - nodes in this community are weakly interconnected._
- **Should `PostgreSQL TLS Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._