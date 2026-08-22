const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "agrocontrol",
  password: "123546879",
  port: 5432,
});

app.post("/lotes", async (req, res) => {
    try {
        const {
            nome,
            descricao,
            propriedade_id
        } = req.body;

        if (!nome || !propriedade_id) {
            return res.status(400).json({
                mensagem: "Nome e propriedade são obrigatórios"
            });
        }

        const propriedadeExiste = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [propriedade_id]
        );

        if (propriedadeExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Propriedade não encontrada"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO lotes
             (nome, descricao, propriedade_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nome, descricao, propriedade_id]
        );

        res.status(201).json({
            mensagem: "Lote cadastrado com sucesso!",
            lote: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar lote"
        });
    }
});

app.get('/lotes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      'SELECT * FROM lotes WHERE id = $1;',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Lote não encontrado'
      });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao buscar lote:', erro);

    res.status(500).json({
      mensagem: 'Erro interno do servidor'
    });
  }
});

app.delete("/lotes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM lotes
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Lote não encontrado"
            });
        }

        res.json({
            mensagem: "Lote excluído com sucesso!",
            lote: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao excluir lote"
        });
    }
});

app.get("/lotes", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM lotes"
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar lotes"
        });
    }
});

app.put("/lotes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nome,
            descricao,
            propriedade_id
        } = req.body;

        if (!nome || !propriedade_id) {
            return res.status(400).json({
                mensagem: "Nome e propriedade são obrigatórios"
            });
        }

        const propriedadeExiste = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [propriedade_id]
        );

        if (propriedadeExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Propriedade não encontrada"
            });
        }

        const resultado = await pool.query(
            `UPDATE lotes
             SET nome = $1,
                 descricao = $2,
                 propriedade_id = $3
             WHERE id = $4
             RETURNING *`,
            [nome, descricao, propriedade_id, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Lote não encontrado"
            });
        }

        res.json({
            mensagem: "Lote atualizado com sucesso!",
            lote: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar lote"
        });
    }
});

app.delete("/propriedades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM propriedades
             WHERE id = $1
             RETURNING *`,
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    res.json({
      mensagem: "Propriedade excluída com sucesso!",
      propriedade: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir propriedade",
    });
  }
});

app.get("/propriedades/:id/animais", async (req, res) => {
    try {
        const { id } = req.params;

        const propriedadeExiste = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [id]
        );

        if (propriedadeExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Propriedade não encontrada"
            });
        }

        const resultado = await pool.query(
            "SELECT * FROM animais WHERE propriedade_id = $1",
            [id]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar animais da propriedade"
        });
    }
});

app.get("/animais/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM animais WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar animal"
        });
    }
});

app.put("/animais/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nome,
            especie,
            raca,
            sexo,
            peso,
            propriedade_id
        } = req.body;

        if (!nome || !especie || !sexo || !propriedade_id) {
            return res.status(400).json({
                mensagem: "Nome, espécie, sexo e propriedade são obrigatórios"
            });
        }

        const propriedadeExiste = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [propriedade_id]
        );

        if (propriedadeExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Propriedade não encontrada"
            });
        }

        const resultado = await pool.query(
            `UPDATE animais
             SET nome = $1,
                 especie = $2,
                 raca = $3,
                 sexo = $4,
                 peso = $5,
                 propriedade_id = $6
             WHERE id = $7
             RETURNING *`,
            [
                nome,
                especie,
                raca,
                sexo.toUpperCase(),
                peso,
                propriedade_id,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado"
            });
        }

        res.json({
            mensagem: "Animal atualizado com sucesso!",
            animal: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar animal"
        });
    }
});

app.delete("/animais/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM animais
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado"
            });
        }

        res.json({
            mensagem: "Animal excluído com sucesso!",
            animal: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao excluir animal"
        });
    }
});

app.get("/animais", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM animais");

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar animais",
    });
  }
});

app.post("/animais", async (req, res) => {
  try {
    const { nome, especie, raca, sexo, peso, propriedade_id } = req.body;
    if (!nome || !especie || !sexo || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Nome, espécie, sexo e propriedade são obrigatórios",
      });
    }
    const propriedadeExiste = await pool.query(
      "SELECT id FROM propriedades WHERE id = $1",
      [propriedade_id],
    );
    if (propriedadeExiste.rows.length === 0) {
      return res.status(400).json({
        mensagem: "Propriedade não encontrada",
      });
    }
    const resultado = await pool.query(
      `INSERT INTO animais
       (nome, especie, raca, sexo, peso, propriedade_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
      [nome, especie, raca, sexo.toUpperCase(), peso, propriedade_id],
    );

    res.status(201).json({
      mensagem: "Animal cadastrado com sucesso!",
      animal: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar animal",
    });
  }
});

app.get("/propriedades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      `SELECT * FROM propriedades WHERE id = $1`,
      [id],
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error("Erro ao consultar banco", erro);
    res.status(500).json({
      mensagem: "Erro interno do servidor",
    });
  }
});



app.post("/propriedades", async (req, res) => {
  try {
    const { nome, cidade, estado, area } = req.body;
    if (!nome || !cidade || !estado || !area) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (estado.length !== 2) {
      return res.status(400).json({
        mensagem: "Estado deve ter 2 caracteres",
      });
    }

    if (area <= 0) {
      return res.status(400).json({
        mensagem: "Área deve ser maior que 0",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO propriedades (nome, cidade, estado, area)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      [nome, cidade, estado.toUpperCase(), area],
    );

    res.status(201).json({
      mensagem: "Propriedade cadastrada com sucesso!",
      propriedade: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar propriedade",
    });
  }
});

app.get("/", (req, res) => {
  res.send("ola agrocontrol!");
});

app.get("/propriedades", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM propriedades");

    res.json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao consultar banco", erro);
    res.status(500).json({
      mensagem: "Erro interno do servidor",
    });
  }
});

app.listen(3000, () => {
  console.log(`Servidor esta em http://localhost:3000`);
});
