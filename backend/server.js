const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

// ======================================================
// BANCO DE DADOS
// ======================================================

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "agrocontrol",
    password: "123546879",
    port: 5432,
});

// ======================================================
// ROTA INICIAL
// ======================================================

app.get("/", (req, res) => {
    res.send("Olá AgroControl!");
});


// ======================================================
// PROPRIEDADES
// ======================================================

// GET - listar propriedades
app.get("/propriedades", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM propriedades ORDER BY id"
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar propriedades"
        });
    }
});


// GET - buscar propriedade por ID
app.get("/propriedades/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Propriedade não encontrada"
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar propriedade"
        });
    }
});


// POST - cadastrar propriedade
app.post("/propriedades", async (req, res) => {
    try {
        const {
            nome,
            cidade,
            estado,
            area
        } = req.body;

        if (!nome || !cidade || !estado || !area) {
            return res.status(400).json({
                mensagem: "Todos os campos são obrigatórios"
            });
        }

        if (estado.length !== 2) {
            return res.status(400).json({
                mensagem: "Estado deve conter 2 caracteres"
            });
        }

        if (area <= 0) {
            return res.status(400).json({
                mensagem: "A área deve ser maior que zero"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO propriedades
            (nome, cidade, estado, area)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                nome,
                cidade,
                estado.toUpperCase(),
                area
            ]
        );

        res.status(201).json({
            mensagem: "Propriedade cadastrada com sucesso!",
            propriedade: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar propriedade"
        });
    }
});


// PUT - atualizar propriedade
app.put("/propriedades/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nome,
            cidade,
            estado,
            area
        } = req.body;

        if (!nome || !cidade || !estado || !area) {
            return res.status(400).json({
                mensagem: "Todos os campos são obrigatórios"
            });
        }

        if (estado.length !== 2) {
            return res.status(400).json({
                mensagem: "Estado deve conter 2 caracteres"
            });
        }

        if (area <= 0) {
            return res.status(400).json({
                mensagem: "A área deve ser maior que zero"
            });
        }

        const resultado = await pool.query(
            `UPDATE propriedades
             SET nome = $1,
                 cidade = $2,
                 estado = $3,
                 area = $4
             WHERE id = $5
             RETURNING *`,
            [
                nome,
                cidade,
                estado.toUpperCase(),
                area,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Propriedade não encontrada"
            });
        }

        res.json({
            mensagem: "Propriedade atualizada com sucesso!",
            propriedade: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar propriedade"
        });
    }
});


// DELETE - excluir propriedade
app.delete("/propriedades/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM propriedades
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Propriedade não encontrada"
            });
        }

        res.json({
            mensagem: "Propriedade excluída com sucesso!",
            propriedade: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao excluir propriedade"
        });
    }
});


// GET - animais de uma propriedade
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


// GET - lotes de uma propriedade
app.get("/propriedades/:id/lotes", async (req, res) => {
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
            "SELECT * FROM lotes WHERE propriedade_id = $1",
            [id]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar lotes da propriedade"
        });
    }
});


// ======================================================
// ANIMAIS
// ======================================================

// GET - listar animais
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
                propriedades.nome AS propriedade
            FROM animais
            JOIN propriedades
                ON animais.propriedade_id = propriedades.id
            ORDER BY animais.id
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar animais"
        });
    }
});


// GET - buscar animal por ID
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


// POST - cadastrar animal
app.post("/animais", async (req, res) => {
    try {
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
            `INSERT INTO animais
            (nome, especie, raca, sexo, peso, propriedade_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                nome,
                especie,
                raca,
                sexo.toUpperCase(),
                peso,
                propriedade_id
            ]
        );

        res.status(201).json({
            mensagem: "Animal cadastrado com sucesso!",
            animal: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar animal"
        });
    }
});


// PUT - atualizar animal
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


// DELETE - excluir animal
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


// ======================================================
// LOTES
// ======================================================

// GET - listar lotes
app.get("/lotes", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM lotes ORDER BY id"
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar lotes"
        });
    }
});


// GET - buscar lote por ID
app.get("/lotes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM lotes WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Lote não encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar lote"
        });
    }
});


// POST - cadastrar lote
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
            [
                nome,
                descricao,
                propriedade_id
            ]
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


// PUT - atualizar lote
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
            [
                nome,
                descricao,
                propriedade_id,
                id
            ]
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


// DELETE - excluir lote
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


// ======================================================
// ANIMAIS + LOTES
// ======================================================

// POST - adicionar animal ao lote
app.post("/lotes/:id/animais", async (req, res) => {
    try {
        const { id } = req.params;
        const { animal_id } = req.body;

        if (!animal_id) {
            return res.status(400).json({
                mensagem: "Animal é obrigatório"
            });
        }

        const loteExiste = await pool.query(
            "SELECT * FROM lotes WHERE id = $1",
            [id]
        );

        if (loteExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Lote não encontrado"
            });
        }

        const animalExiste = await pool.query(
            "SELECT * FROM animais WHERE id = $1",
            [animal_id]
        );

        if (animalExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado"
            });
        }

        if (
            loteExiste.rows[0].propriedade_id !==
            animalExiste.rows[0].propriedade_id
        ) {
            return res.status(400).json({
                mensagem: "Animal e lote pertencem a propriedades diferentes"
            });
        }

        const relacaoExiste = await pool.query(
            `SELECT * FROM animais_lotes
             WHERE animal_id = $1
             AND lote_id = $2`,
            [
                animal_id,
                id
            ]
        );

        if (relacaoExiste.rows.length > 0) {
            return res.status(400).json({
                mensagem: "Animal já pertence a este lote"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO animais_lotes
             (animal_id, lote_id)
             VALUES ($1, $2)
             RETURNING *`,
            [
                animal_id,
                id
            ]
        );

        res.status(201).json({
            mensagem: "Animal adicionado ao lote com sucesso!",
            relacao: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao adicionar animal ao lote"
        });
    }
});


// GET - animais de um lote
app.get("/lotes/:id/animais", async (req, res) => {
    try {
        const { id } = req.params;

        const loteExiste = await pool.query(
            "SELECT * FROM lotes WHERE id = $1",
            [id]
        );

        if (loteExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Lote não encontrado"
            });
        }

        const resultado = await pool.query(
            `SELECT animais.*
             FROM animais
             JOIN animais_lotes
                ON animais.id = animais_lotes.animal_id
             WHERE animais_lotes.lote_id = $1`,
            [id]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar animais do lote"
        });
    }
});


// DELETE - remover animal do lote
app.delete("/lotes/:id/animais/:animal_id", async (req, res) => {
    try {
        const {
            id,
            animal_id
        } = req.params;

        const resultado = await pool.query(
            `DELETE FROM animais_lotes
             WHERE lote_id = $1
             AND animal_id = $2
             RETURNING *`,
            [
                id,
                animal_id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado neste lote"
            });
        }

        res.json({
            mensagem: "Animal removido do lote com sucesso!",
            relacao: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao remover animal do lote"
        });
    }
});


// GET - lotes de um animal
app.get("/animais/:id/lotes", async (req, res) => {
    try {
        const { id } = req.params;

        const animalExiste = await pool.query(
            "SELECT * FROM animais WHERE id = $1",
            [id]
        );

        if (animalExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado"
            });
        }

        const resultado = await pool.query(
            `SELECT lotes.*
             FROM lotes
             JOIN animais_lotes
                ON lotes.id = animais_lotes.lote_id
             WHERE animais_lotes.animal_id = $1`,
            [id]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar lotes do animal"
        });
    }
});


// ======================================================
// VACINAS
// ======================================================

// GET - listar vacinas
app.get("/vacinas", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM vacinas ORDER BY id"
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar vacinas"
        });
    }
});


// GET - buscar vacina por ID
app.get("/vacinas/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM vacinas WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Vacina não encontrada"
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar vacina"
        });
    }
});


// POST - cadastrar vacina
app.post("/vacinas", async (req, res) => {
    try {
        const {
            nome,
            fabricante,
            descricao
        } = req.body;

        if (!nome) {
            return res.status(400).json({
                mensagem: "Nome da vacina é obrigatório"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO vacinas
             (nome, fabricante, descricao)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                nome,
                fabricante,
                descricao
            ]
        );

        res.status(201).json({
            mensagem: "Vacina cadastrada com sucesso!",
            vacina: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar vacina"
        });
    }
});


// PUT - atualizar vacina
app.put("/vacinas/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nome,
            fabricante,
            descricao
        } = req.body;

        if (!nome) {
            return res.status(400).json({
                mensagem: "Nome da vacina é obrigatório"
            });
        }

        const resultado = await pool.query(
            `UPDATE vacinas
             SET nome = $1,
                 fabricante = $2,
                 descricao = $3
             WHERE id = $4
             RETURNING *`,
            [
                nome,
                fabricante,
                descricao,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Vacina não encontrada"
            });
        }

        res.json({
            mensagem: "Vacina atualizada com sucesso!",
            vacina: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar vacina"
        });
    }
});


// DELETE - excluir vacina
app.delete("/vacinas/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM vacinas
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Vacina não encontrada"
            });
        }

        res.json({
            mensagem: "Vacina excluída com sucesso!",
            vacina: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao excluir vacina"
        });
    }
});


// ======================================================
// VACINAÇÕES
// ======================================================

// GET - próximas vacinações com filtro
// IMPORTANTE: esta rota precisa ficar antes de /vacinacoes/:id

app.get("/vacinacoes/proximas", async (req, res) => {
    try {
        const { periodo = "todos" } = req.query;

        const filtrosPeriodo = {
            hoje:
                "vacinacoes.proxima_dose = CURRENT_DATE",

            semana: `
                vacinacoes.proxima_dose BETWEEN CURRENT_DATE
                AND CURRENT_DATE + INTERVAL '7 days'
            `,

            futuro:
                "vacinacoes.proxima_dose > CURRENT_DATE",

            todos:
                "vacinacoes.proxima_dose IS NOT NULL"
        };

        const filtro = filtrosPeriodo[periodo];

        if (!filtro) {
            return res.status(400).json({
                mensagem:
                    "Período inválido. Use hoje, semana, futuro ou todos"
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
            JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
            WHERE ${filtro}
            ORDER BY vacinacoes.proxima_dose
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar próximas vacinações"
        });
    }
});


// GET - listar todas as vacinações
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
            JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
            ORDER BY vacinacoes.id
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar vacinações"
        });
    }
});


// GET - buscar vacinação por ID
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
             JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
             WHERE vacinacoes.id = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Vacinação não encontrada"
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar vacinação"
        });
    }
});


// POST - registrar vacinação
app.post("/vacinacoes", async (req, res) => {
    try {
        const {
            animal_id,
            vacina_id,
            data_aplicacao,
            proxima_dose,
            observacao
        } = req.body;

        if (!animal_id || !vacina_id || !data_aplicacao) {
            return res.status(400).json({
                mensagem:
                    "Animal, vacina e data de aplicação são obrigatórios"
            });
        }

        const animalExiste = await pool.query(
            "SELECT * FROM animais WHERE id = $1",
            [animal_id]
        );

        if (animalExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado"
            });
        }

        const vacinaExiste = await pool.query(
            "SELECT * FROM vacinas WHERE id = $1",
            [vacina_id]
        );

        if (vacinaExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Vacina não encontrada"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO vacinacoes
             (
                animal_id,
                vacina_id,
                data_aplicacao,
                proxima_dose,
                observacao
             )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                animal_id,
                vacina_id,
                data_aplicacao,
                proxima_dose || null,
                observacao || null
            ]
        );

        res.status(201).json({
            mensagem: "Vacinação registrada com sucesso!",
            vacinacao: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao registrar vacinação"
        });
    }
});


// PUT - atualizar vacinação
app.put("/vacinacoes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            animal_id,
            vacina_id,
            data_aplicacao,
            proxima_dose,
            observacao
        } = req.body;

        if (!animal_id || !vacina_id || !data_aplicacao) {
            return res.status(400).json({
                mensagem:
                    "Animal, vacina e data de aplicação são obrigatórios"
            });
        }

        const animalExiste = await pool.query(
            "SELECT * FROM animais WHERE id = $1",
            [animal_id]
        );

        if (animalExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado"
            });
        }

        const vacinaExiste = await pool.query(
            "SELECT * FROM vacinas WHERE id = $1",
            [vacina_id]
        );

        if (vacinaExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Vacina não encontrada"
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
             RETURNING *`,
            [
                animal_id,
                vacina_id,
                data_aplicacao,
                proxima_dose || null,
                observacao || null,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Vacinação não encontrada"
            });
        }

        res.json({
            mensagem: "Vacinação atualizada com sucesso!",
            vacinacao: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar vacinação"
        });
    }
});


// DELETE - excluir vacinação
app.delete("/vacinacoes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM vacinacoes
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Vacinação não encontrada"
            });
        }

        res.json({
            mensagem: "Vacinação excluída com sucesso!",
            vacinacao: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao excluir vacinação"
        });
    }
});


// GET - histórico de vacinações de um animal
app.get("/animais/:id/vacinacoes", async (req, res) => {
    try {
        const { id } = req.params;

        const animalExiste = await pool.query(
            "SELECT * FROM animais WHERE id = $1",
            [id]
        );

        if (animalExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado"
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
             WHERE vacinacoes.animal_id = $1
             ORDER BY vacinacoes.data_aplicacao DESC`,
            [id]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar vacinações do animal"
        });
    }
});


// ======================================================
// SERVIDOR
// ======================================================

app.listen(3000, () => {
    console.log("Servidor está em http://localhost:3000");
});