async function bloquearAnimalParaPeso(cliente, animalId) {
  const resultado = await cliente.query(
    "SELECT id FROM animais WHERE id = $1 FOR UPDATE",
    [animalId],
  );
  return Boolean(resultado.rows[0]);
}

async function sincronizarPesoAtual(cliente, animalId) {
  await bloquearAnimalParaPeso(cliente, animalId);
  await cliente.query(
    `UPDATE animais
        SET peso = (
          SELECT p.peso_kg
            FROM pesagens p
           WHERE p.animal_id = animais.id
           ORDER BY p.data_pesagem DESC, p.id DESC
           LIMIT 1
        )
      WHERE id = $1`,
    [animalId],
  );
}

module.exports = { bloquearAnimalParaPeso, sincronizarPesoAtual };
