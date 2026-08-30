const { consumirLimite } = require("../services/limitesRequisicao");
const { registrarErro, registrarEvento } = require("../utils/log");

function limitarRequisicoes({ escopo, limite, janelaMs, obterChave }) {
  return async function rateLimit(req, res, next) {
    try {
      const chave = await obterChave(req);
      const resultado = await consumirLimite({ escopo, chave, limite, janelaMs });

      res.setHeader("RateLimit-Limit", String(limite));
      res.setHeader("RateLimit-Remaining", String(resultado.restante));

      if (!resultado.permitido) {
        res.setHeader("Retry-After", String(resultado.retryAfter));
        registrarEvento("aviso", "rate_limit_excedido", {
          request_id: req.id,
          escopo,
          chave: resultado.chaveHashPrefixo,
        });
        return res.status(429).json({
          mensagem: "Muitas tentativas. Aguarde antes de tentar novamente",
        });
      }

      next();
    } catch (erro) {
      registrarErro("rate_limit_indisponivel", erro, req, { escopo });
      res.status(503).json({ mensagem: "Serviço temporariamente indisponível" });
    }
  };
}

module.exports = { limitarRequisicoes };
