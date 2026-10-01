const pool = require("../database/pool");
const climaService = require("../services/climaService");
const { ErroClima } = require("../services/openMeteoService");
const { registrarErro } = require("../utils/log");

function criarConsultarClima({ banco = pool, buscarClima = climaService.buscarClimaDaPropriedade } = {}) {
  return async function consultarClima(req, res) {
    let propriedade;
    try {
      const resultado = await banco.query(
        `SELECT id, nome, cidade, estado FROM propriedades
          WHERE id = $1 AND ($2 = 'admin' OR usuario_id = $3)`,
        [req.params.id, req.usuario.perfil, req.usuario.id],
      );
      propriedade = resultado.rows[0];
      if (!propriedade) return res.status(404).json({ mensagem: "Propriedade não encontrada" });
      const clima = await buscarClima(propriedade);
      return res.json(clima);
    } catch (erro) {
      if (erro instanceof ErroClima) {
        if (erro.codigo !== "LOCALIZACAO_NAO_ENCONTRADA") {
          registrarErro("clima_api_erro", erro, req, {
            propriedade_id: propriedade?.id, provider: "Open-Meteo", tipo_erro: erro.codigo,
          });
        }
        return res.status(erro.status).json({
          codigo: erro.codigo,
          mensagem: erro.codigo === "LOCALIZACAO_NAO_ENCONTRADA"
            ? "Não foi possível localizar a cidade desta propriedade. Confira cidade e estado."
            : "Não foi possível carregar a previsão do tempo agora. Tente novamente mais tarde.",
        });
      }
      registrarErro("clima_rota_erro", erro, req, { propriedade_id: propriedade?.id });
      return res.status(500).json({ mensagem: "Erro ao consultar o clima" });
    }
  };
}

module.exports = { consultarClima: criarConsultarClima(), criarConsultarClima };
