const pool = require("../database/pool");

async function buscarAnimalPermitido(animalId, usuario) {
  const resultado = await pool.query(
    `SELECT a.id
       FROM animais a
       JOIN propriedades p ON p.id = a.propriedade_id
      WHERE a.id = $1
        AND ($2 = 'admin' OR p.usuario_id = $3)`,
    [animalId, usuario.perfil, usuario.id],
  );

  return resultado.rows[0] || null;
}

module.exports = { buscarAnimalPermitido };

