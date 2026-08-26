require("./config/ambiente");

const express = require("express");
const cors = require("cors");
const pool = require("./database/pool");
const { criarConfiguracaoCors } = require("./config/cors");
const { autenticar } = require("./middleware/autenticacao");
const authRoutes = require("./routes/authRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const propriedadesRoutes = require("./routes/propriedadesRoutes");
const animaisRoutes = require("./routes/animaisRoutes");
const lotesRoutes = require("./routes/lotesRoutes");
const vacinasRoutes = require("./routes/vacinasRoutes");
const vacinacoesRoutes = require("./routes/vacinacoesRoutes");
const producoesLeiteirasRoutes = require("./routes/producoesLeiteirasRoutes");
const despesasRoutes = require("./routes/despesasRoutes");

const app = express();

app.use(express.json());
app.use(cors(criarConfiguracaoCors()));

app.get("/", (req, res) => {
  res.send("ola bovitrack!");
});

app.use(authRoutes);
app.use(autenticar);
app.use(usuariosRoutes);
app.use(dashboardRoutes);
app.use(propriedadesRoutes);
app.use(animaisRoutes);
app.use(lotesRoutes);
app.use(vacinasRoutes);
app.use(vacinacoesRoutes);
app.use(producoesLeiteirasRoutes);
app.use(despesasRoutes);

// A exportacao direta permite que a Vercel detecte o Express sem adaptadores.
// As propriedades preservam a interface usada pelos testes e pelo servidor local.
module.exports = app;
module.exports.app = app;
module.exports.pool = pool;
