require("dotenv").config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET não foi configurado no arquivo .env");
}

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./database/pool");
const { autenticar, somenteAdmin } = require("./middleware/autenticacao");
const { criarUsuarioComum } = require("./services/usuarios");

const app = express();

app.use(express.json());
app.use(cors());

function converterId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get("/", (req, res) => {
  res.send("ola agrocontrol!");
});

// =========================
// AUTENTICAÇÃO E USUÁRIOS
// =========================

async function responderCriacaoUsuario(req, res, mensagemSucesso) {
  try {
    const usuario = await criarUsuarioComum(req.body);

    res.status(201).json({
      mensagem: mensagemSucesso,
      usuario,
    });
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message });
    }

    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário" });
  }
}

app.post("/auth/cadastro", async (req, res) => {
  await responderCriacaoUsuario(
    req,
    res,
    "Conta criada com sucesso. Agora você já pode entrar no AgroControl.",
  );
});

app.post("/usuarios", autenticar, somenteAdmin, async (req, res) => {
  await responderCriacaoUsuario(req, res, "Usuário cadastrado com sucesso!");
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email: emailRecebido, senha } = req.body;

    if (typeof emailRecebido !== "string" || typeof senha !== "string") {
      return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
    }

    const email = emailRecebido.trim().toLowerCase();

    if (!email || !senha) {
      return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
    }

    const resultado = await pool.query(
      `SELECT id, nome, email, senha, perfil, ativo
         FROM usuarios
        WHERE email = $1`,
      [email],
    );

    const usuario = resultado.rows[0];
    const senhaCorreta = usuario && (await bcrypt.compare(senha, usuario.senha));

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Email ou senha inválidos" });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        mensagem: "Usuário desativado. Entre em contato com o administrador",
      });
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
      },
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao realizar login" });
  }
});

app.use(autenticar);

app.get("/auth/me", (req, res) => {
  res.json({ usuario: req.usuario });
});

app.get("/usuarios", somenteAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, perfil, ativo, created_at
         FROM usuarios
        ORDER BY id`,
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar usuários" });
  }
});

app.get("/usuarios/:id", somenteAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, perfil, ativo, created_at
         FROM usuarios
        WHERE id = $1`,
      [req.params.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar usuário" });
  }
});

app.put("/usuarios/:id", somenteAdmin, async (req, res) => {
  try {
    const { nome: nomeRecebido, email: emailRecebido } = req.body;

    if (typeof nomeRecebido !== "string" || typeof emailRecebido !== "string") {
      return res.status(400).json({ mensagem: "Nome e email são obrigatórios" });
    }

    const nome = nomeRecebido.trim();
    const email = emailRecebido.trim().toLowerCase();

    if (!nome || !email) {
      return res.status(400).json({ mensagem: "Nome e email são obrigatórios" });
    }

    if (nome.length > 120 || email.length > 255) {
      return res.status(400).json({ mensagem: "Nome ou email excede o tamanho permitido" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ mensagem: "Email inválido" });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
          SET nome = $1,
              email = $2
        WHERE id = $3
        RETURNING id, nome, email, perfil, ativo, created_at`,
      [nome, email, req.params.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.json({
      mensagem: "Usuário atualizado com sucesso!",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    if (erro.code === "23505") {
      return res.status(409).json({ mensagem: "Este email já está cadastrado" });
    }

    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao atualizar usuário" });
  }
});

app.put("/usuarios/:id/ativo", somenteAdmin, async (req, res) => {
  try {
    const { ativo } = req.body;

    if (typeof ativo !== "boolean") {
      return res.status(400).json({ mensagem: "O campo ativo deve ser verdadeiro ou falso" });
    }

    const usuarioResultado = await pool.query(
      "SELECT id, perfil FROM usuarios WHERE id = $1",
      [req.params.id],
    );

    if (usuarioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    if (usuarioResultado.rows[0].perfil === "admin") {
      return res.status(403).json({
        mensagem: "O administrador principal não pode ser ativado ou desativado por esta rota",
      });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
          SET ativo = $1
        WHERE id = $2
        RETURNING id, nome, email, perfil, ativo, created_at`,
      [ativo, req.params.id],
    );

    res.json({
      mensagem: ativo
        ? "Usuário ativado com sucesso!"
        : "Usuário desativado com sucesso!",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao alterar situação do usuário" });
  }
});

app.delete("/usuarios/:id", somenteAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, perfil FROM usuarios WHERE id = $1",
      [req.params.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    if (resultado.rows[0].perfil === "admin") {
      return res.status(403).json({ mensagem: "O administrador principal não pode ser excluído" });
    }

    res.status(400).json({
      mensagem: "A exclusão de usuários está desabilitada. Desative o usuário para preservar seus dados",
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao verificar usuário" });
  }
});

// =========================
// DASHBOARD
// =========================

app.get("/dashboard", async (req, res) => {
  try {
    const parametros = [req.usuario.perfil, req.usuario.id];

    const resumoResultado = await pool.query(
      `SELECT
        (SELECT COUNT(*)
           FROM propriedades p
          WHERE ($1 = 'admin' OR p.usuario_id = $2)) AS propriedades,
        (SELECT COUNT(*)
           FROM animais a
           JOIN propriedades p ON p.id = a.propriedade_id
          WHERE ($1 = 'admin' OR p.usuario_id = $2)) AS animais,
        (SELECT COUNT(*)
           FROM lotes l
           JOIN propriedades p ON p.id = l.propriedade_id
          WHERE ($1 = 'admin' OR p.usuario_id = $2)) AS lotes,
        (SELECT COUNT(*)
           FROM vacinas v
          WHERE ($1 = 'admin' OR v.usuario_id = $2)) AS vacinas,
        (SELECT COALESCE(SUM(d.valor), 0)
           FROM despesas d
           JOIN propriedades p ON p.id = d.propriedade_id
          WHERE ($1 = 'admin' OR p.usuario_id = $2)) AS total_despesas`,
      parametros,
    );

    const proximasResultado = await pool.query(
      `SELECT vc.id,
              vc.animal_id,
              a.nome AS animal,
              vc.vacina_id,
              v.nome AS vacina,
              vc.data_aplicacao,
              vc.proxima_dose,
              vc.observacao
         FROM vacinacoes vc
         JOIN animais a ON a.id = vc.animal_id
         JOIN propriedades p ON p.id = a.propriedade_id
         JOIN vacinas v ON v.id = vc.vacina_id
        WHERE vc.proxima_dose BETWEEN CURRENT_DATE
                                  AND CURRENT_DATE + INTERVAL '7 days'
          AND (
            $1 = 'admin'
            OR (p.usuario_id = $2 AND v.usuario_id = $2)
          )
        ORDER BY vc.proxima_dose`,
      parametros,
    );

    const resumo = resumoResultado.rows[0];

    res.json({
      resumo: {
        propriedades: Number(resumo.propriedades),
        animais: Number(resumo.animais),
        lotes: Number(resumo.lotes),
        vacinas: Number(resumo.vacinas),
        total_despesas: Number(resumo.total_despesas),
      },
      proximas_vacinacoes: proximasResultado.rows,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao carregar o dashboard" });
  }
});

// =========================
// PROPRIEDADES
// =========================

app.get("/propriedades", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, cidade, estado, area, usuario_id
         FROM propriedades
        WHERE ($1 = 'admin' OR usuario_id = $2)
        ORDER BY id`,
      [req.usuario.perfil, req.usuario.id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar propriedades",
    });
  }
});

app.get("/propriedades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT id, nome, cidade, estado, area, usuario_id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar propriedade",
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
        mensagem: "Estado deve conter 2 caracteres",
      });
    }

    if (area <= 0) {
      return res.status(400).json({
        mensagem: "A área deve ser maior que zero",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO propriedades (nome, cidade, estado, area, usuario_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
      [nome, cidade, estado.toUpperCase(), area, req.usuario.id],
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

app.put("/propriedades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cidade, estado, area } = req.body;

    if (!nome || !cidade || !estado || !area) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (estado.length !== 2) {
      return res.status(400).json({
        mensagem: "Estado deve conter 2 caracteres",
      });
    }

    if (area <= 0) {
      return res.status(400).json({
        mensagem: "A área deve ser maior que zero",
      });
    }

    const resultado = await pool.query(
      `UPDATE propriedades
             SET nome = $1,
                 cidade = $2,
                 estado = $3,
                 area = $4
             WHERE id = $5
               AND ($6 = 'admin' OR usuario_id = $7)
             RETURNING *`,
      [
        nome,
        cidade,
        estado.toUpperCase(),
        area,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    res.json({
      mensagem: "Propriedade atualizada com sucesso!",
      propriedade: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar propriedade",
    });
  }
});

app.delete("/propriedades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM propriedades
             WHERE id = $1
               AND ($2 = 'admin' OR usuario_id = $3)
             RETURNING *`,
      [id, req.usuario.perfil, req.usuario.id],
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
// =========================
// ANIMAIS
// =========================

app.get("/animais", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT
                animais.id,
                animais.nome,
                animais.especie,
                animais.raca,
                animais.sexo,
                animais.peso,
                animais.propriedade_id,
                propriedades.nome AS propriedade,
                COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object('id', l.id, 'nome', l.nome)
                      ORDER BY l.nome, l.id
                    )
                    FROM animais_lotes al
                    JOIN lotes l ON l.id = al.lote_id
                    WHERE al.animal_id = animais.id
                      AND l.propriedade_id = animais.propriedade_id
                  ),
                  '[]'::json
                ) AS lotes
            FROM animais
            JOIN propriedades
                ON animais.propriedade_id = propriedades.id
            WHERE ($1 = 'admin' OR propriedades.usuario_id = $2)
            ORDER BY animais.id
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar animais",
    });
  }
});

app.get("/animais/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT
                animais.id,
                animais.nome,
                animais.especie,
                animais.raca,
                animais.sexo,
                animais.peso,
                animais.propriedade_id,
                propriedades.nome AS propriedade,
                COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object('id', l.id, 'nome', l.nome)
                      ORDER BY l.nome, l.id
                    )
                    FROM animais_lotes al
                    JOIN lotes l ON l.id = al.lote_id
                    WHERE al.animal_id = animais.id
                      AND l.propriedade_id = animais.propriedade_id
                  ),
                  '[]'::json
                ) AS lotes
             FROM animais
             JOIN propriedades
                ON animais.propriedade_id = propriedades.id
             WHERE animais.id = $1
               AND ($2 = 'admin' OR propriedades.usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar animal",
    });
  }
});

app.get("/propriedades/:id/animais", async (req, res) => {
  try {
    const { id } = req.params;

    const propriedadeExiste = await pool.query(
      `SELECT id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const resultado = await pool.query(
      `SELECT *
             FROM animais
             WHERE propriedade_id = $1
             ORDER BY id`,
      [id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar animais da propriedade",
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

    if (sexo.toUpperCase() !== "M" && sexo.toUpperCase() !== "F") {
      return res.status(400).json({
        mensagem: "Sexo deve ser M ou F",
      });
    }

    if (peso !== undefined && peso !== null && peso < 0) {
      return res.status(400).json({
        mensagem: "Peso não pode ser negativo",
      });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id, usuario_id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [propriedade_id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
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

app.put("/animais/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, especie, raca, sexo, peso, propriedade_id } = req.body;

    if (!nome || !especie || !sexo || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Nome, espécie, sexo e propriedade são obrigatórios",
      });
    }

    if (sexo.toUpperCase() !== "M" && sexo.toUpperCase() !== "F") {
      return res.status(400).json({
        mensagem: "Sexo deve ser M ou F",
      });
    }

    if (peso !== undefined && peso !== null && peso < 0) {
      return res.status(400).json({
        mensagem: "Peso não pode ser negativo",
      });
    }

    const animalAtual = await pool.query(
      `SELECT a.id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (animalAtual.rows.length === 0) {
      return res.status(404).json({ mensagem: "Animal não encontrado" });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id, usuario_id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [propriedade_id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const vinculoIncompativel = await pool.query(
      `SELECT 1
         FROM animais_lotes al
         JOIN lotes l ON l.id = al.lote_id
        WHERE al.animal_id = $1
          AND l.propriedade_id <> $2
       UNION ALL
       SELECT 1
         FROM vacinacoes vc
         JOIN vacinas v ON v.id = vc.vacina_id
        WHERE vc.animal_id = $1
          AND v.usuario_id <> $3
        LIMIT 1`,
      [id, propriedade_id, propriedadeExiste.rows[0].usuario_id],
    );

    if (vinculoIncompativel.rows.length > 0) {
      return res.status(400).json({
        mensagem: "O animal possui lote ou vacinação incompatível com a nova propriedade",
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
               AND (
                 $8 = 'admin'
                 OR EXISTS (
                   SELECT 1
                     FROM propriedades p
                    WHERE p.id = animais.propriedade_id
                      AND p.usuario_id = $9
                 )
               )
             RETURNING *`,
      [
        nome,
        especie,
        raca,
        sexo.toUpperCase(),
        peso,
        propriedade_id,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    res.json({
      mensagem: "Animal atualizado com sucesso!",
      animal: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar animal",
    });
  }
});

app.delete("/animais/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM animais a
             USING propriedades p
             WHERE a.id = $1
               AND p.id = a.propriedade_id
               AND ($2 = 'admin' OR p.usuario_id = $3)
             RETURNING a.*`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    res.json({
      mensagem: "Animal excluído com sucesso!",
      animal: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir animal",
    });
  }
});
// =========================
// LOTES
// =========================

app.get("/lotes", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT
                lotes.id,
                lotes.nome,
                lotes.descricao,
                lotes.propriedade_id,
                propriedades.nome AS propriedade,
                (SELECT COUNT(*)::INTEGER
                   FROM animais_lotes al
                  WHERE al.lote_id = lotes.id) AS quantidade_animais
            FROM lotes
            JOIN propriedades
                ON lotes.propriedade_id = propriedades.id
            WHERE ($1 = 'admin' OR propriedades.usuario_id = $2)
            ORDER BY lotes.id
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar lotes",
    });
  }
});

app.get("/lotes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT
                lotes.id,
                lotes.nome,
                lotes.descricao,
                lotes.propriedade_id,
                propriedades.nome AS propriedade,
                (SELECT COUNT(*)::INTEGER
                   FROM animais_lotes al
                  WHERE al.lote_id = lotes.id) AS quantidade_animais
             FROM lotes
             JOIN propriedades
                ON lotes.propriedade_id = propriedades.id
             WHERE lotes.id = $1
               AND ($2 = 'admin' OR propriedades.usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Lote não encontrado",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar lote",
    });
  }
});

app.post("/lotes", async (req, res) => {
  try {
    const { nome, descricao, propriedade_id } = req.body;

    if (!nome || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Nome e propriedade são obrigatórios",
      });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [propriedade_id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO lotes
            (nome, descricao, propriedade_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
      [nome, descricao, propriedade_id],
    );

    res.status(201).json({
      mensagem: "Lote cadastrado com sucesso!",
      lote: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar lote",
    });
  }
});

app.put("/lotes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, descricao, propriedade_id } = req.body;

    if (!nome || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Nome e propriedade são obrigatórios",
      });
    }

    const loteAtual = await pool.query(
      `SELECT l.id
         FROM lotes l
         JOIN propriedades p ON p.id = l.propriedade_id
        WHERE l.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (loteAtual.rows.length === 0) {
      return res.status(404).json({ mensagem: "Lote não encontrado" });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [propriedade_id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const animalIncompativel = await pool.query(
      `SELECT 1
         FROM animais_lotes al
         JOIN animais a ON a.id = al.animal_id
        WHERE al.lote_id = $1
          AND a.propriedade_id <> $2
        LIMIT 1`,
      [id, propriedade_id],
    );

    if (animalIncompativel.rows.length > 0) {
      return res.status(400).json({
        mensagem: "O lote possui animais incompatíveis com a nova propriedade",
      });
    }

    const resultado = await pool.query(
      `UPDATE lotes
             SET nome = $1,
                 descricao = $2,
                 propriedade_id = $3
             WHERE id = $4
               AND (
                 $5 = 'admin'
                 OR EXISTS (
                   SELECT 1
                     FROM propriedades p
                    WHERE p.id = lotes.propriedade_id
                      AND p.usuario_id = $6
                 )
               )
             RETURNING *`,
      [
        nome,
        descricao,
        propriedade_id,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Lote não encontrado",
      });
    }

    res.json({
      mensagem: "Lote atualizado com sucesso!",
      lote: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar lote",
    });
  }
});

app.delete("/lotes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM lotes l
             USING propriedades p
             WHERE l.id = $1
               AND p.id = l.propriedade_id
               AND ($2 = 'admin' OR p.usuario_id = $3)
             RETURNING l.*`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Lote não encontrado",
      });
    }

    res.json({
      mensagem: "Lote excluído com sucesso!",
      lote: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir lote",
    });
  }
});

// =========================
// ANIMAIS ↔ LOTES
// =========================

app.post("/lotes/:id/animais", async (req, res) => {
  try {
    const { id } = req.params;
    const { animal_id } = req.body;
    const loteId = converterId(id);
    const animalId = converterId(animal_id);

    if (!loteId || !animalId) {
      return res.status(400).json({
        mensagem: "Lote e animal devem possuir IDs válidos",
      });
    }

    const loteExiste = await pool.query(
      `SELECT l.*, p.usuario_id
         FROM lotes l
         JOIN propriedades p ON p.id = l.propriedade_id
        WHERE l.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [loteId, req.usuario.perfil, req.usuario.id],
    );

    if (loteExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Lote não encontrado",
      });
    }

    const animalExiste = await pool.query(
      `SELECT a.*, p.usuario_id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [animalId, req.usuario.perfil, req.usuario.id],
    );

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    if (
      loteExiste.rows[0].propriedade_id !== animalExiste.rows[0].propriedade_id
    ) {
      return res.status(400).json({
        mensagem: "Animal e lote pertencem a propriedades diferentes",
      });
    }

    const relacaoExiste = await pool.query(
      `SELECT * FROM animais_lotes
             WHERE animal_id = $1
             AND lote_id = $2`,
      [animalId, loteId],
    );

    if (relacaoExiste.rows.length > 0) {
      return res.status(400).json({
        mensagem: "Animal já pertence a este lote",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO animais_lotes
            (animal_id, lote_id)
            VALUES ($1, $2)
            RETURNING *`,
      [animalId, loteId],
    );

    res.status(201).json({
      mensagem: "Animal adicionado ao lote com sucesso!",
      relacao: resultado.rows[0],
    });
  } catch (erro) {
    if (erro.code === "23505") {
      return res.status(400).json({
        mensagem: "Animal já pertence a este lote",
      });
    }

    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao adicionar animal ao lote",
    });
  }
});

app.get("/lotes/:id/animais", async (req, res) => {
  try {
    const { id } = req.params;
    const loteId = converterId(id);

    if (!loteId) {
      return res.status(400).json({ mensagem: "ID do lote inválido" });
    }

    const loteExiste = await pool.query(
      `SELECT l.id
         FROM lotes l
         JOIN propriedades p ON p.id = l.propriedade_id
        WHERE l.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [loteId, req.usuario.perfil, req.usuario.id],
    );

    if (loteExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Lote não encontrado",
      });
    }

    const resultado = await pool.query(
      `SELECT animais.*
             FROM animais
             JOIN animais_lotes
                ON animais.id = animais_lotes.animal_id
             JOIN lotes
                ON lotes.id = animais_lotes.lote_id
             WHERE animais_lotes.lote_id = $1
               AND animais.propriedade_id = lotes.propriedade_id
             ORDER BY animais.id`,
      [loteId],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar animais do lote",
    });
  }
});

app.delete("/lotes/:id/animais/:animal_id", async (req, res) => {
  try {
    const { id, animal_id } = req.params;
    const loteId = converterId(id);
    const animalId = converterId(animal_id);

    if (!loteId || !animalId) {
      return res.status(400).json({
        mensagem: "Lote e animal devem possuir IDs válidos",
      });
    }

    const resultado = await pool.query(
      `DELETE FROM animais_lotes al
             USING lotes l, propriedades p, animais a
             WHERE al.lote_id = $1
               AND al.animal_id = $2
               AND l.id = al.lote_id
               AND a.id = al.animal_id
               AND p.id = l.propriedade_id
               AND a.propriedade_id = p.id
               AND ($3 = 'admin' OR p.usuario_id = $4)
             RETURNING al.*`,
      [loteId, animalId, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado neste lote",
      });
    }

    res.json({
      mensagem: "Animal removido do lote com sucesso!",
      relacao: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao remover animal do lote",
    });
  }
});

app.get("/animais/:id/lotes", async (req, res) => {
  try {
    const { id } = req.params;
    const animalId = converterId(id);

    if (!animalId) {
      return res.status(400).json({ mensagem: "ID do animal inválido" });
    }

    const animalExiste = await pool.query(
      `SELECT a.id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [animalId, req.usuario.perfil, req.usuario.id],
    );

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    const resultado = await pool.query(
      `SELECT lotes.*
             FROM lotes
             JOIN animais_lotes
                ON lotes.id = animais_lotes.lote_id
             JOIN animais
                ON animais.id = animais_lotes.animal_id
             WHERE animais_lotes.animal_id = $1
               AND lotes.propriedade_id = animais.propriedade_id
             ORDER BY lotes.id`,
      [animalId],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar lotes do animal",
    });
  }
});
// =========================
// VACINAS
// =========================

app.post("/vacinas", async (req, res) => {
  try {
    const { nome, fabricante, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({
        mensagem: "Nome da vacina é obrigatório",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO vacinas
             (nome, fabricante, descricao, usuario_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      [nome, fabricante, descricao, req.usuario.id],
    );

    res.status(201).json({
      mensagem: "Vacina cadastrada com sucesso!",
      vacina: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar vacina",
    });
  }
});

app.get("/vacinas", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, fabricante, descricao, usuario_id
         FROM vacinas
        WHERE ($1 = 'admin' OR usuario_id = $2)
        ORDER BY id`,
      [req.usuario.perfil, req.usuario.id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacinas",
    });
  }
});

app.get("/vacinas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT id, nome, fabricante, descricao, usuario_id
         FROM vacinas
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacina",
    });
  }
});

app.put("/vacinas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, fabricante, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({
        mensagem: "Nome da vacina é obrigatório",
      });
    }

    const resultado = await pool.query(
      `UPDATE vacinas
             SET nome = $1,
                 fabricante = $2,
                 descricao = $3
             WHERE id = $4
               AND ($5 = 'admin' OR usuario_id = $6)
             RETURNING *`,
      [nome, fabricante, descricao, id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    res.json({
      mensagem: "Vacina atualizada com sucesso!",
      vacina: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar vacina",
    });
  }
});

app.delete("/vacinas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM vacinas
             WHERE id = $1
               AND ($2 = 'admin' OR usuario_id = $3)
             RETURNING *`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    res.json({
      mensagem: "Vacina excluída com sucesso!",
      vacina: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir vacina",
    });
  }
});

// =========================
// VACINAÇÕES
// =========================

app.post("/vacinacoes", async (req, res) => {
  try {
    const { animal_id, vacina_id, data_aplicacao, proxima_dose, observacao } =
      req.body;

    if (!animal_id || !vacina_id || !data_aplicacao) {
      return res.status(400).json({
        mensagem: "Animal, vacina e data de aplicação são obrigatórios",
      });
    }

    const animalExiste = await pool.query(
      `SELECT a.*, p.usuario_id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [animal_id, req.usuario.perfil, req.usuario.id],
    );

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    const vacinaExiste = await pool.query(
      `SELECT id, usuario_id
         FROM vacinas
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [vacina_id, req.usuario.perfil, req.usuario.id],
    );

    if (vacinaExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    if (animalExiste.rows[0].usuario_id !== vacinaExiste.rows[0].usuario_id) {
      return res.status(400).json({
        mensagem: "Animal e vacina pertencem a usuários diferentes",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO vacinacoes
             (animal_id, vacina_id, data_aplicacao, proxima_dose, observacao)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
      [
        animal_id,
        vacina_id,
        data_aplicacao,
        proxima_dose || null,
        observacao || null,
      ],
    );

    res.status(201).json({
      mensagem: "Vacinação registrada com sucesso!",
      vacinacao: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao registrar vacinação",
    });
  }
});

app.get("/vacinacoes", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT
                vacinacoes.id,
                vacinacoes.animal_id,
                animais.nome AS animal,
                vacinacoes.vacina_id,
                vacinas.nome AS vacina,
                vacinacoes.data_aplicacao,
                vacinacoes.proxima_dose,
                vacinacoes.observacao
            FROM vacinacoes
            JOIN animais
                ON vacinacoes.animal_id = animais.id
            JOIN propriedades
                ON animais.propriedade_id = propriedades.id
            JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
            WHERE (
              $1 = 'admin'
              OR (propriedades.usuario_id = $2 AND vacinas.usuario_id = $2)
            )
            ORDER BY vacinacoes.id
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacinações",
    });
  }
});

// IMPORTANTE:
// esta rota deve ficar ANTES de /vacinacoes/:id

app.get("/vacinacoes/proximas", async (req, res) => {
  try {
    const { periodo = "todos" } = req.query;

    const filtrosPeriodo = {
      hoje: "vacinacoes.proxima_dose = CURRENT_DATE",

      semana: `
                vacinacoes.proxima_dose BETWEEN CURRENT_DATE
                AND CURRENT_DATE + INTERVAL '7 days'
            `,

      futuro: "vacinacoes.proxima_dose > CURRENT_DATE",

      todos: "vacinacoes.proxima_dose IS NOT NULL",
    };

    const filtro = filtrosPeriodo[periodo];

    if (!filtro) {
      return res.status(400).json({
        mensagem: "Período inválido. Use hoje, semana, futuro ou todos",
      });
    }

    const resultado = await pool.query(`
            SELECT
                vacinacoes.id,
                vacinacoes.animal_id,
                animais.nome AS animal,
                vacinacoes.vacina_id,
                vacinas.nome AS vacina,
                vacinacoes.data_aplicacao,
                vacinacoes.proxima_dose,
                vacinacoes.observacao
            FROM vacinacoes
            JOIN animais
                ON vacinacoes.animal_id = animais.id
            JOIN propriedades
                ON animais.propriedade_id = propriedades.id
            JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
            WHERE ${filtro}
              AND (
                $1 = 'admin'
                OR (propriedades.usuario_id = $2 AND vacinas.usuario_id = $2)
              )
            ORDER BY vacinacoes.proxima_dose
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar próximas vacinações",
    });
  }
});

app.get("/vacinacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT
                vacinacoes.id,
                vacinacoes.animal_id,
                animais.nome AS animal,
                vacinacoes.vacina_id,
                vacinas.nome AS vacina,
                vacinacoes.data_aplicacao,
                vacinacoes.proxima_dose,
                vacinacoes.observacao
             FROM vacinacoes
             JOIN animais
                ON vacinacoes.animal_id = animais.id
             JOIN propriedades
                ON animais.propriedade_id = propriedades.id
             JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
             WHERE vacinacoes.id = $1
               AND (
                 $2 = 'admin'
                 OR (propriedades.usuario_id = $3 AND vacinas.usuario_id = $3)
               )`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacinação não encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacinação",
    });
  }
});

app.put("/vacinacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { animal_id, vacina_id, data_aplicacao, proxima_dose, observacao } =
      req.body;

    if (!animal_id || !vacina_id || !data_aplicacao) {
      return res.status(400).json({
        mensagem: "Animal, vacina e data de aplicação são obrigatórios",
      });
    }

    const animalExiste = await pool.query(
      `SELECT a.*, p.usuario_id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [animal_id, req.usuario.perfil, req.usuario.id],
    );

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    const vacinaExiste = await pool.query(
      `SELECT id, usuario_id
         FROM vacinas
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [vacina_id, req.usuario.perfil, req.usuario.id],
    );

    if (vacinaExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    if (animalExiste.rows[0].usuario_id !== vacinaExiste.rows[0].usuario_id) {
      return res.status(400).json({
        mensagem: "Animal e vacina pertencem a usuários diferentes",
      });
    }

    const resultado = await pool.query(
      `UPDATE vacinacoes
             SET animal_id = $1,
                 vacina_id = $2,
                 data_aplicacao = $3,
                 proxima_dose = $4,
                 observacao = $5
             WHERE id = $6
               AND (
                 $7 = 'admin'
                 OR EXISTS (
                   SELECT 1
                     FROM animais a_atual
                     JOIN propriedades p_atual
                       ON p_atual.id = a_atual.propriedade_id
                    WHERE a_atual.id = vacinacoes.animal_id
                      AND p_atual.usuario_id = $8
                 )
               )
             RETURNING *`,
      [
        animal_id,
        vacina_id,
        data_aplicacao,
        proxima_dose || null,
        observacao || null,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacinação não encontrada",
      });
    }

    res.json({
      mensagem: "Vacinação atualizada com sucesso!",
      vacinacao: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar vacinação",
    });
  }
});

app.delete("/vacinacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM vacinacoes vc
             USING animais a, propriedades p
             WHERE vc.id = $1
               AND a.id = vc.animal_id
               AND p.id = a.propriedade_id
               AND ($2 = 'admin' OR p.usuario_id = $3)
             RETURNING vc.*`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacinação não encontrada",
      });
    }

    res.json({
      mensagem: "Vacinação excluída com sucesso!",
      vacinacao: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir vacinação",
    });
  }
});

// =========================
// HISTÓRICO DO ANIMAL
// =========================

app.get("/animais/:id/vacinacoes", async (req, res) => {
  try {
    const { id } = req.params;

    const animalExiste = await pool.query(
      `SELECT a.id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    const resultado = await pool.query(
      `SELECT
                vacinacoes.id,
                vacinacoes.vacina_id,
                vacinas.nome AS vacina,
                vacinacoes.data_aplicacao,
                vacinacoes.proxima_dose,
                vacinacoes.observacao
             FROM vacinacoes
             JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
             JOIN animais
                ON animais.id = vacinacoes.animal_id
             JOIN propriedades
                ON propriedades.id = animais.propriedade_id
             WHERE vacinacoes.animal_id = $1
               AND vacinas.usuario_id = propriedades.usuario_id
             ORDER BY vacinacoes.data_aplicacao DESC`,
      [id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacinações do animal",
    });
  }
});
// =========================
// DESPESAS
// =========================

app.post("/despesas", async (req, res) => {
  try {
    const { descricao, categoria, valor, data, propriedade_id } = req.body;

    if (!descricao || !categoria || !valor || !data || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (valor <= 0) {
      return res.status(400).json({
        mensagem: "O valor da despesa deve ser maior que zero",
      });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [propriedade_id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO despesas
            (descricao, categoria, valor, data, propriedade_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
      [descricao, categoria, valor, data, propriedade_id],
    );

    res.status(201).json({
      mensagem: "Despesa cadastrada com sucesso!",
      despesa: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar despesa",
    });
  }
});

app.get("/despesas", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT
                despesas.id,
                despesas.descricao,
                despesas.categoria,
                despesas.valor,
                despesas.data,
                despesas.propriedade_id,
                propriedades.nome AS propriedade
            FROM despesas
            JOIN propriedades
                ON despesas.propriedade_id = propriedades.id
            WHERE ($1 = 'admin' OR propriedades.usuario_id = $2)
            ORDER BY despesas.data DESC
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar despesas",
    });
  }
});

app.get("/despesas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
            SELECT
                despesas.id,
                despesas.descricao,
                despesas.categoria,
                despesas.valor,
                despesas.data,
                despesas.propriedade_id,
                propriedades.nome AS propriedade
            FROM despesas
            JOIN propriedades
                ON despesas.propriedade_id = propriedades.id
            WHERE despesas.id = $1
              AND ($2 = 'admin' OR propriedades.usuario_id = $3)
        `,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Despesa não encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar despesa",
    });
  }
});

app.put("/despesas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { descricao, categoria, valor, data, propriedade_id } = req.body;

    if (!descricao || !categoria || !valor || !data || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (valor <= 0) {
      return res.status(400).json({
        mensagem: "O valor da despesa deve ser maior que zero",
      });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [propriedade_id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const resultado = await pool.query(
      `UPDATE despesas
             SET descricao = $1,
                 categoria = $2,
                 valor = $3,
                 data = $4,
                 propriedade_id = $5
             WHERE id = $6
               AND (
                 $7 = 'admin'
                 OR EXISTS (
                   SELECT 1
                     FROM propriedades p
                    WHERE p.id = despesas.propriedade_id
                      AND p.usuario_id = $8
                 )
               )
             RETURNING *`,
      [
        descricao,
        categoria,
        valor,
        data,
        propriedade_id,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Despesa não encontrada",
      });
    }

    res.json({
      mensagem: "Despesa atualizada com sucesso!",
      despesa: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar despesa",
    });
  }
});

app.delete("/despesas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM despesas d
             USING propriedades p
             WHERE d.id = $1
               AND p.id = d.propriedade_id
               AND ($2 = 'admin' OR p.usuario_id = $3)
             RETURNING d.*`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Despesa não encontrada",
      });
    }

    res.json({
      mensagem: "Despesa excluída com sucesso!",
      despesa: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir despesa",
    });
  }
});
// =========================
// DESPESAS POR PROPRIEDADE
// =========================

app.get("/propriedades/:id/despesas", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      periodo = "todos",
      categoria,
      valor_minimo,
      valor_maximo,
      data_inicio,
      data_fim,
    } = req.query;

    const propriedadeExiste = await pool.query(
      `SELECT id, nome, cidade, estado, area
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    if (!["hoje", "semana", "mes", "todos"].includes(periodo)) {
      return res.status(400).json({
        mensagem: "Período inválido. Use hoje, semana, mes ou todos",
      });
    }

    if (valor_minimo && isNaN(Number(valor_minimo))) {
      return res.status(400).json({
        mensagem: "Valor mínimo inválido",
      });
    }

    if (valor_maximo && isNaN(Number(valor_maximo))) {
      return res.status(400).json({
        mensagem: "Valor máximo inválido",
      });
    }

    if (valor_minimo && Number(valor_minimo) < 0) {
      return res.status(400).json({
        mensagem: "O valor mínimo não pode ser negativo",
      });
    }

    if (valor_maximo && Number(valor_maximo) < 0) {
      return res.status(400).json({
        mensagem: "O valor máximo não pode ser negativo",
      });
    }

    if (
      valor_minimo &&
      valor_maximo &&
      Number(valor_minimo) > Number(valor_maximo)
    ) {
      return res.status(400).json({
        mensagem: "O valor mínimo não pode ser maior que o valor máximo",
      });
    }

    if (data_inicio && isNaN(Date.parse(data_inicio))) {
      return res.status(400).json({
        mensagem: "Data inicial inválida",
      });
    }

    if (data_fim && isNaN(Date.parse(data_fim))) {
      return res.status(400).json({
        mensagem: "Data final inválida",
      });
    }

    if (data_inicio && data_fim && new Date(data_inicio) > new Date(data_fim)) {
      return res.status(400).json({
        mensagem: "A data inicial não pode ser posterior à data final",
      });
    }

    if (periodo !== "todos" && (data_inicio || data_fim)) {
      return res.status(400).json({
        mensagem:
          "Use periodo ou intervalo de datas, não os dois ao mesmo tempo",
      });
    }

    const valores = [id];
    let filtro = "";

    if (periodo === "hoje") {
      filtro += " AND data = CURRENT_DATE";
    }

    if (periodo === "semana") {
      filtro += `
                AND data BETWEEN CURRENT_DATE - INTERVAL '7 days'
                AND CURRENT_DATE
            `;
    }

    if (periodo === "mes") {
      filtro += `
                AND data BETWEEN DATE_TRUNC('month', CURRENT_DATE)
                AND CURRENT_DATE
            `;
    }

    if (categoria) {
      const parametro = valores.length + 1;

      filtro += ` AND categoria = $${parametro}`;
      valores.push(categoria);
    }

    if (valor_minimo) {
      const parametro = valores.length + 1;

      filtro += ` AND valor >= $${parametro}`;
      valores.push(Number(valor_minimo));
    }

    if (valor_maximo) {
      const parametro = valores.length + 1;

      filtro += ` AND valor <= $${parametro}`;
      valores.push(Number(valor_maximo));
    }

    if (data_inicio) {
      const parametro = valores.length + 1;

      filtro += ` AND data >= $${parametro}`;
      valores.push(data_inicio);
    }

    if (data_fim) {
      const parametro = valores.length + 1;

      filtro += ` AND data <= $${parametro}`;
      valores.push(data_fim);
    }

    const resultado = await pool.query(
      `SELECT *
             FROM despesas
             WHERE propriedade_id = $1
             ${filtro}
             ORDER BY data DESC, valor DESC`,
      valores,
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar despesas da propriedade",
    });
  }
});
// =========================
// RESUMO FINANCEIRO
// =========================

app.get("/propriedades/:id/despesas/resumo", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      periodo = "todos",
      categoria,
      valor_minimo,
      valor_maximo,
      data_inicio,
      data_fim,
    } = req.query;

    const propriedadeExiste = await pool.query(
      `SELECT id, nome, cidade, estado, area
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    if (!["hoje", "semana", "mes", "todos"].includes(periodo)) {
      return res.status(400).json({
        mensagem: "Período inválido. Use hoje, semana, mes ou todos",
      });
    }

    if (valor_minimo && isNaN(Number(valor_minimo))) {
      return res.status(400).json({
        mensagem: "Valor mínimo inválido",
      });
    }

    if (valor_maximo && isNaN(Number(valor_maximo))) {
      return res.status(400).json({
        mensagem: "Valor máximo inválido",
      });
    }

    if (valor_minimo && Number(valor_minimo) < 0) {
      return res.status(400).json({
        mensagem: "O valor mínimo não pode ser negativo",
      });
    }

    if (valor_maximo && Number(valor_maximo) < 0) {
      return res.status(400).json({
        mensagem: "O valor máximo não pode ser negativo",
      });
    }

    if (
      valor_minimo &&
      valor_maximo &&
      Number(valor_minimo) > Number(valor_maximo)
    ) {
      return res.status(400).json({
        mensagem: "O valor mínimo não pode ser maior que o valor máximo",
      });
    }

    if (data_inicio && isNaN(Date.parse(data_inicio))) {
      return res.status(400).json({
        mensagem: "Data inicial inválida",
      });
    }

    if (data_fim && isNaN(Date.parse(data_fim))) {
      return res.status(400).json({
        mensagem: "Data final inválida",
      });
    }

    if (data_inicio && data_fim && new Date(data_inicio) > new Date(data_fim)) {
      return res.status(400).json({
        mensagem: "A data inicial não pode ser posterior à data final",
      });
    }

    if (periodo !== "todos" && (data_inicio || data_fim)) {
      return res.status(400).json({
        mensagem:
          "Use periodo ou intervalo de datas, não os dois ao mesmo tempo",
      });
    }

    const valores = [id];
    let filtro = "";

    if (periodo === "hoje") {
      filtro += " AND data = CURRENT_DATE";
    }

    if (periodo === "semana") {
      filtro += `
                AND data BETWEEN CURRENT_DATE - INTERVAL '7 days'
                AND CURRENT_DATE
            `;
    }

    if (periodo === "mes") {
      filtro += `
                AND data BETWEEN DATE_TRUNC('month', CURRENT_DATE)
                AND CURRENT_DATE
            `;
    }

    if (categoria) {
      const parametro = valores.length + 1;

      filtro += ` AND categoria = $${parametro}`;
      valores.push(categoria);
    }

    if (valor_minimo) {
      const parametro = valores.length + 1;

      filtro += ` AND valor >= $${parametro}`;
      valores.push(Number(valor_minimo));
    }

    if (valor_maximo) {
      const parametro = valores.length + 1;

      filtro += ` AND valor <= $${parametro}`;
      valores.push(Number(valor_maximo));
    }

    if (data_inicio) {
      const parametro = valores.length + 1;

      filtro += ` AND data >= $${parametro}`;
      valores.push(data_inicio);
    }

    if (data_fim) {
      const parametro = valores.length + 1;

      filtro += ` AND data <= $${parametro}`;
      valores.push(data_fim);
    }

    const resumoResultado = await pool.query(
      `SELECT
        COALESCE(SUM(valor), 0) AS total,
        COALESCE(ROUND(AVG(valor), 2), 0) AS media,
        COALESCE(MAX(valor), 0) AS maior,
        COALESCE(MIN(valor), 0) AS menor,
        COUNT(*) AS quantidade
     FROM despesas
     WHERE propriedade_id = $1
     ${filtro}`,
      valores,
    );

    const categoriasResultado = await pool.query(
      `SELECT
        categoria,
        COALESCE(SUM(valor), 0) AS total,
        COUNT(*) AS quantidade,
        COALESCE(ROUND(AVG(valor), 2), 0) AS media
     FROM despesas
     WHERE propriedade_id = $1
     ${filtro}
     GROUP BY categoria
     ORDER BY total DESC`,
      valores,
    );

    const propriedade = propriedadeExiste.rows[0];

    const dadosPropriedade = {
      id: propriedade.id,
      nome: propriedade.nome,
      cidade: propriedade.cidade,
      estado: propriedade.estado,
      area: propriedade.area,
    };

    res.json({
      propriedade: dadosPropriedade,

      resumo: {
        total: resumoResultado.rows[0].total,
        media: resumoResultado.rows[0].media,
        maior: resumoResultado.rows[0].maior,
        menor: resumoResultado.rows[0].menor,
        quantidade: resumoResultado.rows[0].quantidade,
      },

      categorias: categoriasResultado.rows,
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar resumo de despesas",
    });
  }
});

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor esta em http://localhost:${PORT}`);
  });
}

module.exports = { app, pool };
