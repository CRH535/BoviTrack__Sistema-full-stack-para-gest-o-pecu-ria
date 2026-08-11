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

app.get("/propriedades/:id", async (req, res) => {
  try {
    const id = req.params.id;
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
