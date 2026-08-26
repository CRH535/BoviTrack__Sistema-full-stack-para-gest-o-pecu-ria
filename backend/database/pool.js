const { Pool, types } = require("pg");
const { criarConfiguracaoBanco } = require("./config");

// PostgreSQL DATE nao possui horario nem fuso. Manter YYYY-MM-DD evita que a
// serializacao JSON desloque o dia conforme o timezone do servidor.
types.setTypeParser(1082, (valor) => valor);

const pool = new Pool(criarConfiguracaoBanco());

module.exports = pool;
