# MEMÓRIA DO PROJETO — BOVITRACK

> Arquivo de referência do sistema BoviTrack.
> Contém decisões de projeto, arquitetura, banco de dados, códigos, rotas, validações, conceitos aprendidos e status atual do desenvolvimento.

---

# 1. Visão geral do projeto

## Nome
**BoviTrack**

## Objetivo
Sistema web para gerenciamento de propriedades rurais, com foco em:
- propriedades;
- animais;
- lotes;
- vacinação/sanidade;
- despesas;
- usuários;
- dashboard;
- integrações externas úteis.

## Ideia central
O BoviTrack não deve ser apenas um CRUD simples. O objetivo é transformá-lo em um sistema de gestão pecuária que:
- armazena dados;
- relaciona informações;
- valida dados;
- gera alertas;
- organiza o rebanho;
- acompanha despesas;
- futuramente apresenta clima, gráficos e QR Code.

---

# 2. Escopo simplificado para iniciante

## Módulos principais
1. Usuários
2. Propriedades
3. Animais
4. Lotes
5. Vacinas / vacinações
6. Despesas
7. Dashboard

## Funcionalidades futuras
- Login com JWT
- Controle de administrador e funcionário
- ViaCEP
- OpenWeather
- IBGE
- Dashboard com gráficos
- Alertas de vacinação
- QR Code para animais
- Histórico/auditoria
- Relatórios

---

# 3. Tecnologias escolhidas

## Frontend
- React
- Vite
- React Router
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Recharts

## Backend
- Node.js
- Express
- pg
- Futuramente Prisma
- JWT
- bcrypt
- Zod
- Helmet
- Rate Limit

## Banco de dados
- PostgreSQL 18.4

## Ferramentas
- VS Code
- Postman
- Git
- GitHub

---

# 4. Arquitetura geral

```text
USUÁRIO
   ↓
REACT
   ↓
HTTP / API REST
   ↓
NODE.JS + EXPRESS
   ↓
pg / futuramente Prisma
   ↓
POSTGRESQL
```

## Responsabilidades

### React
Interface com o usuário.

### Node.js
Ambiente que executa JavaScript no backend.

### Express
Framework usado para criar rotas e API.

### PostgreSQL
Armazena os dados permanentemente.

### pg
Biblioteca que permite ao Node.js conversar com PostgreSQL.

---

# 5. Conceitos aprendidos

## Métodos HTTP

```text
POST   → criar
GET    → buscar
PUT    → atualizar
DELETE → excluir
```

## CRUD

```text
CREATE → POST
READ   → GET
UPDATE → PUT
DELETE → DELETE
```

## Status HTTP

```text
200 → sucesso
201 → recurso criado
400 → requisição inválida
404 → recurso não encontrado
500 → erro interno do servidor
```

## req.body

Dados enviados no corpo da requisição.

Exemplo:

```json
{
  "nome": "Fazenda Boa Vista",
  "cidade": "Uberaba",
  "estado": "MG",
  "area": 300
}
```

Uso:

```javascript
const { nome, cidade, estado, area } = req.body;
```

## req.params

Valores enviados pela URL.

Exemplo:

```text
GET /propriedades/3
```

Uso:

```javascript
const { id } = req.params;
```

## async / await

Usado quando o Node precisa esperar uma operação assíncrona, como uma consulta ao banco.

```javascript
const resultado = await pool.query(
    "SELECT * FROM propriedades"
);
```

## try / catch

Usado para tratar erros.

```javascript
try {
    // operação
} catch (erro) {
    console.error(erro);
}
```

---

# 6. Ambiente PostgreSQL

## Versão instalada

```text
PostgreSQL 18.4
```

## Caminho identificado no Windows

```text
C:\Program Files\PostgreSQL\18\bin
```

## Comando de acesso

```cmd
psql -U postgres
```

## Banco criado

```sql
CREATE DATABASE agrocontrol;
```

## Conectar ao banco

```sql
\c agrocontrol
```

---

# 7. Banco de dados

## Banco

```text
agrocontrol
```

---

# 8. Tabela propriedades

## Criação

```sql
CREATE TABLE propriedades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    area DECIMAL(10,2) NOT NULL
);
```

## Estrutura

```text
id      → integer / chave primária
nome    → varchar(100)
cidade  → varchar(100)
estado  → char(2)
area    → numeric(10,2)
```

## Ver estrutura

```sql
\d propriedades
```

## Inserção inicial

```sql
INSERT INTO propriedades (nome, cidade, estado, area)
VALUES ('Chais', 'Lagoa', 'MG', 100);
```

## Consultar tudo

```sql
SELECT * FROM propriedades;
```

## Dados que chegaram a existir durante o desenvolvimento

```text
1 | Chais              | Lagoa   | MG | 100.00
2 | Fazenda Esperança  | Uberaba | MG | 450.00
3 | Fazenda Esperança  | Uberaba | MG | 450.00
4 | Fazenda do krl     | bahia   | MG | 1000.00
```

Observação:
- O ID 2 foi posteriormente excluído em um teste de DELETE.
- Os dados acima representam o histórico do desenvolvimento, não necessariamente o estado atual exato do banco.

---

# 9. Tabela animais

## Criação

```sql
CREATE TABLE animais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(100),
    sexo CHAR(1) NOT NULL,
    peso DECIMAL(10,2),
    propriedade_id INTEGER NOT NULL,
    FOREIGN KEY (propriedade_id)
        REFERENCES propriedades(id)
);
```

## Relacionamento

```text
PROPRIEDADES
     ↑
     │
     │ propriedade_id
     │
ANIMAIS
```

Relacionamento:

```text
1 propriedade → N animais
```

## Primeiro animal registrado

```text
id: 1
nome: Mimosa
especie: Bovino
raca: Nelore
sexo: F
peso: 420.00
propriedade_id: 3
```

## Consulta

```sql
SELECT * FROM animais;
```

Resultado registrado:

```text
id | nome   | especie | raca   | sexo | peso   | propriedade_id
1  | Mimosa | Bovino  | Nelore | F    | 420.00 | 3
```

---

# 10. Chave estrangeira / FOREIGN KEY

## Teste realizado

Tentativa:

```sql
INSERT INTO animais
(nome, especie, raca, sexo, peso, propriedade_id)
VALUES
('Fantasma', 'Bovino', 'Nelore', 'M', 500, 999);
```

Erro esperado:

```text
violação de chave estrangeira
propriedade_id 999 não existe em propriedades
```

## Significado

O PostgreSQL impede que um animal seja ligado a uma propriedade inexistente.

Isso garante integridade referencial.

---

# 11. Dependências Node instaladas

## Express

```bash
npm install express
```

## PostgreSQL driver

```bash
npm install pg
```

Resultado registrado:

```text
added 14 packages
found 0 vulnerabilities
```

---

# 12. Conexão Node.js → PostgreSQL

## Importação

```javascript
const { Pool } = require("pg");
```

## Pool

```javascript
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "agrocontrol",
    password: "SUA_SENHA",
    port: 5432,
});
```

> A senha real não deve ser salva neste arquivo.

## Primeiro teste

```javascript
pool.query("SELECT * FROM propriedades")
    .then(resultado => {
        console.log(resultado.rows);
    })
    .catch(erro => {
        console.error("Erro ao consultar banco:", erro);
    });
```

Retorno obtido:

```javascript
[
  {
    id: 1,
    nome: 'Chais',
    cidade: 'Lagoa',
    estado: 'MG',
    area: '100.00'
  }
]
```

---

# 13. Erro encontrado durante conexão

Erro:

```text
SyntaxError: Identifier 'pool' has already been declared
```

Motivo:
- `const pool = new Pool(...)` havia sido declarado mais de uma vez.

Correção:
- manter apenas uma declaração de `pool`.

---

# 14. Estrutura base do server.js

```javascript
const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "agrocontrol",
    password: "SUA_SENHA",
    port: 5432,
});

app.get("/", (req, res) => {
    res.send("ola bovitrack!");
});

app.listen(3000, () => {
    console.log("Servidor esta em http://localhost:3000");
});
```

---

# 15. Rota GET /propriedades

```javascript
app.get("/propriedades", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM propriedades"
        );

        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar propriedades",
        });
    }
});
```

---

# 16. Rota GET /propriedades/:id

```javascript
app.get("/propriedades/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [id]
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
```

---

# 17. Rota POST /propriedades

```javascript
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
            `INSERT INTO propriedades (nome, cidade, estado, area)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nome, cidade, estado.toUpperCase(), area]
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
```

---

# 18. Validações de propriedades

## Campos obrigatórios

```javascript
if (!nome || !cidade || !estado || !area) {
    return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
    });
}
```

## Estado com duas letras

```javascript
if (estado.length !== 2) {
    return res.status(400).json({
        mensagem: "Estado deve conter 2 caracteres",
    });
}
```

## Área positiva

```javascript
if (area <= 0) {
    return res.status(400).json({
        mensagem: "A área deve ser maior que zero",
    });
}
```

## Normalização da UF

```javascript
estado.toUpperCase()
```

Exemplo:

```text
mg → MG
```

---

# 19. Rota PUT /propriedades/:id

```javascript
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
             RETURNING *`,
            [nome, cidade, estado.toUpperCase(), area, id]
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
```

---

# 20. Rota DELETE /propriedades/:id

```javascript
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
```

## Teste realizado

Foi excluída:

```json
{
  "id": 2,
  "nome": "Fazenda Esperança",
  "cidade": "Uberaba",
  "estado": "MG",
  "area": "450.00"
}
```

---

# 21. CRUD completo de propriedades

```text
POST   /propriedades      → criar
GET    /propriedades      → listar todas
GET    /propriedades/:id  → buscar uma
PUT    /propriedades/:id  → atualizar
DELETE /propriedades/:id  → excluir
```

---

# 22. Parâmetros SQL

Exemplo:

```javascript
await pool.query(
    "SELECT * FROM propriedades WHERE id = $1",
    [id]
);
```

Significado:

```text
$1 → primeiro valor do array
```

Em:

```javascript
[nome, cidade, estado, area]
```

temos:

```text
$1 → nome
$2 → cidade
$3 → estado
$4 → area
```

Uso de parâmetros ajuda a evitar SQL Injection.

---

# 23. RETURNING *

Exemplo:

```sql
INSERT INTO propriedades (...)
VALUES (...)
RETURNING *;
```

Serve para devolver o registro criado/alterado/excluído.

Muito útil em:
- POST
- PUT
- DELETE

---

# 24. Rota GET /animais

Versão simples:

```javascript
app.get("/animais", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM animais"
        );

        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar animais",
        });
    }
});
```

---

# 25. Rota POST /animais

```javascript
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
                mensagem: "Nome, espécie, sexo e propriedade são obrigatórios",
            });
        }

        const propriedadeExiste = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [propriedade_id]
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
            animal: resultado.rows[0],
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar animal",
        });
    }
});
```

---

# 26. Validação da propriedade no cadastro de animais

Fluxo:

```text
POST /animais
    ↓
recebe propriedade_id
    ↓
SELECT propriedade
    ↓
existe?
  ↙     ↘
não     sim
↓        ↓
404    INSERT
```

Essa validação deixa a mensagem de erro amigável antes do PostgreSQL gerar uma exceção de chave estrangeira.

---

# 27. JOIN — Animais + propriedades

Objetivo:
Mostrar o animal junto com o nome da propriedade.

## Consulta

```sql
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
    ON animais.propriedade_id = propriedades.id;
```

## Rota sugerida

```javascript
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
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar animais",
        });
    }
});
```

## Conceito do JOIN

```text
animais.propriedade_id
          =
propriedades.id
```

Exemplo:

```text
Mimosa
propriedade_id = 3
        ↓
propriedades.id = 3
        ↓
nome da propriedade
```

---

# 28. AS no SQL

Exemplo:

```sql
propriedades.nome AS propriedade
```

O nome real da coluna continua sendo `nome`, mas no resultado aparece como:

```json
{
  "propriedade": "Fazenda Esperança"
}
```

---

# 29. Próxima rota planejada

Ainda não construída na conversa:

```text
GET /propriedades/:id/animais
```

Objetivo:

```text
mostrar todos os animais pertencentes a uma propriedade específica
```

Exemplo:

```text
GET /propriedades/3/animais
```

---

# 30. Próximas etapas do backend

## Animais
- GET /animais/:id
- PUT /animais/:id
- DELETE /animais/:id
- GET /propriedades/:id/animais

## Lotes
Criar tabela e relacionar:
- propriedade
- animais

## Vacinas
Criar:
- vacinas
- vacinações

Relacionamento esperado:

```text
ANIMAL
  ↓
VACINAÇÃO
  ↓
VACINA
```

## Despesas
Relacionar despesas com propriedades.

---

# 31. Banco planejado futuramente

```text
USUARIOS
   │
   └── PROPRIEDADES
           │
           ├── ANIMAIS
           │      │
           │      ├── LOTES
           │      └── VACINACOES
           │
           └── DESPESAS
```

Versão mais detalhada:

```text
USUARIO
   │
   └── PROPRIEDADE
           │
           ├── ANIMAL
           │      ├── VACINAÇÃO
           │      ├── TRATAMENTO
           │      └── LOTE
           │
           ├── DESPESA
           ├── FUNCIONÁRIO
           └── EQUIPAMENTO
```

---

# 32. APIs externas planejadas

## Manter
### ViaCEP
Cadastro automático de endereço.

### OpenWeather
Clima da propriedade no dashboard.

### IBGE
Estados e municípios.

## Futuro
### QR Code
Identificação de animais.

## Removidas / não prioritárias
- BrasilAPI
- AwesomeAPI
- NASA POWER
- Embrapa API
- Mapbox
- Nodemailer
- Sharp
- Docker inicialmente
- Framer Motion
- Chart.js

---

# 33. Dashboard planejado

Indicadores:

```text
Animais
Vacinas
Despesas
Lotes
Alertas
Clima
```

Gráficos:
- animais por espécie;
- despesas por categoria;
- vacinação por período.

Alertas futuros:
- vacinação próxima;
- medicamentos próximos do vencimento;
- estoque baixo;
- despesas elevadas.

---

# 34. Segurança planejada

- bcrypt
- JWT
- Helmet
- Rate Limit
- Zod
- variáveis de ambiente
- controle de acesso por perfil

## Perfis

### Administrador
Pode:
- cadastrar;
- editar;
- excluir;
- visualizar;
- gerenciar usuários;
- financeiro.

### Funcionário
Pode:
- consultar;
- cadastrar;
- editar;
- registrar vacinações;
- registrar ocorrências.

---

# 35. Regra importante de segurança

Nunca confiar apenas no frontend.

Mesmo que um botão não apareça para um funcionário, o backend deve impedir ações não autorizadas.

Exemplo futuro:

```text
DELETE /animais/15
```

deve verificar:
- usuário autenticado;
- função;
- permissão.

---

# 36. Estrutura de pastas planejada

## Backend

```text
backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── schemas/
│   ├── lib/
│   └── server.js
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── package.json
└── README.md
```

## Frontend

```text
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── hooks/
│   ├── schemas/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

---

# 37. Ordem de desenvolvimento definida

```text
1. Banco
2. Backend
3. Testar API
4. Frontend
5. Integração
6. Segurança
7. Dashboard
8. APIs externas
9. QR Code
```

---

# 38. Status atual do aprendizado

Já estudado/praticado:
- JavaScript básico aplicado ao backend;
- Node.js;
- Express;
- HTTP;
- API REST;
- GET;
- POST;
- PUT;
- DELETE;
- req.body;
- req.params;
- JSON;
- async/await;
- try/catch;
- status HTTP;
- PostgreSQL;
- SQL básico;
- CREATE DATABASE;
- CREATE TABLE;
- INSERT;
- SELECT;
- UPDATE;
- DELETE SQL;
- PRIMARY KEY;
- FOREIGN KEY;
- relacionamento 1:N;
- parâmetros SQL;
- RETURNING *;
- JOIN;
- conexão Node.js + PostgreSQL com pg.

---

# 39. Estado atual do projeto

## Propriedades
CRUD completo:
- GET
- GET por ID
- POST
- PUT
- DELETE

## Animais
Já existe:
- tabela animais;
- relação com propriedades;
- GET /animais;
- POST /animais;
- validação de propriedade;
- JOIN planejado/implementado conforme última etapa.

Ainda faltam:
- GET /animais/:id;
- PUT /animais/:id;
- DELETE /animais/:id;
- GET /propriedades/:id/animais.

---

# 40. Próximo ponto exato para continuar

Continuar a partir de:

```text
GET /propriedades/:id/animais
```

Depois:
1. completar CRUD de animais;
2. criar lotes;
3. criar vacinas/vacinações;
4. criar despesas;
5. revisar backend;
6. organizar arquivos;
7. depois iniciar React.

---

# 41. Exemplo de fluxo atual do sistema

## Cadastro de propriedade

```text
Postman
   ↓
POST /propriedades
   ↓
req.body
   ↓
validação
   ↓
INSERT
   ↓
PostgreSQL
   ↓
RETURNING *
   ↓
JSON
```

## Cadastro de animal

```text
Postman
   ↓
POST /animais
   ↓
req.body
   ↓
propriedade_id
   ↓
propriedade existe?
   ↓
INSERT animais
   ↓
PostgreSQL
```

---

# 42. Regra de filosofia do projeto

> Se uma funcionalidade não melhora o sistema ou não demonstra um conceito importante, ela não entra.

Objetivo:
- manter o projeto simples;
- compreensível para iniciante;
- profissional;
- explicável na apresentação;
- sem excesso de bibliotecas e APIs.

---

# 43. Resumo técnico rápido

```text
Projeto: BoviTrack
Backend: Node.js + Express
Banco: PostgreSQL 18.4
Driver: pg
API: REST
Porta backend: 3000
Porta PostgreSQL: 5432
Banco: agrocontrol
Tabela principal atual: propriedades
Tabela relacionada: animais
Relacionamento: propriedades 1:N animais
Frontend: ainda não iniciado
Prisma: planejado para etapa futura
React: planejado para etapa futura
```

---

# 44. Código consolidado atual aproximado do server.js

> Ajustar a senha do banco antes de executar.

```javascript
const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "agrocontrol",
    password: "SUA_SENHA",
    port: 5432,
});

app.get("/", (req, res) => {
    res.send("ola bovitrack!");
});

// =========================
// PROPRIEDADES
// =========================

app.get("/propriedades", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM propriedades"
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
            "SELECT * FROM propriedades WHERE id = $1",
            [id]
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
            `INSERT INTO propriedades (nome, cidade, estado, area)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nome, cidade, estado.toUpperCase(), area]
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
             RETURNING *`,
            [nome, cidade, estado.toUpperCase(), area, id]
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
             RETURNING *`,
            [id]
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
                propriedades.nome AS propriedade
            FROM animais
            JOIN propriedades
                ON animais.propriedade_id = propriedades.id
        `);

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
                mensagem: "Nome, espécie, sexo e propriedade são obrigatórios",
            });
        }

        const propriedadeExiste = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [propriedade_id]
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
            animal: resultado.rows[0],
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar animal",
        });
    }
});

// =========================
// SERVER
// =========================

app.listen(3000, () => {
    console.log("Servidor esta em http://localhost:3000");
});
```

---

# 45. Observações importantes

- Nunca colocar senha real do PostgreSQL em arquivos compartilhados.
- Futuramente mover credenciais para `.env`.
- O código ainda está propositalmente simples para facilitar o aprendizado.
- A arquitetura será organizada em arquivos separados quando o backend estiver mais completo.
- Prisma será introduzido depois que os conceitos de SQL e PostgreSQL estiverem bem compreendidos.
- O frontend React ainda não foi iniciado.
- O projeto está em fase de backend e modelagem relacional.

---

# FIM DA MEMÓRIA ATUAL DO BOVITRACK

---

# ATUALIZAÇÃO DA MEMÓRIA — CONTINUAÇÃO DA CONVERSA DE 22/08/2026

> Esta seção registra tudo o que foi desenvolvido após o ponto salvo anteriormente no arquivo de memória.

# 46. Continuação do CRUD de animais

Foi concluído o planejamento e implementação das rotas restantes do módulo de animais.

## GET /propriedades/:id/animais

Objetivo: listar todos os animais pertencentes a uma propriedade específica.

Fluxo:

```text
recebe id em req.params
↓
verifica se a propriedade existe
↓
se não existir → 404
↓
busca animais por propriedade_id
↓
retorna resultado.rows
```

Código:

```javascript
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
```

Conceito reforçado:
- `req.params` é usado para valores presentes na URL.
- `resultado.rows.length === 0` significa que a consulta não encontrou registros.
- quando um recurso existe, mas não possui registros relacionados, o retorno correto pode ser `[]`.

## GET /animais/:id

```javascript
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
```

Conceito aprendido:
- `resultado.rows` retorna um array.
- `resultado.rows[0]` retorna apenas o primeiro objeto do array.
- em rotas que buscam um único registro por ID, usar `rows[0]` é mais apropriado.

## PUT /animais/:id

```javascript
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
```

Conceito reforçado:
- `req.params` identifica qual recurso será alterado.
- `req.body` contém os novos dados.
- `sexo.toUpperCase()` padroniza valores como `m`/`f` para `M`/`F`.

## DELETE /animais/:id

```javascript
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
```

Conceito reforçado:
- `RETURNING *` devolve o registro apagado, atualizado ou criado.

---

# 47. Módulo de lotes

Decisão de modelagem tomada:
- um animal pode pertencer a vários lotes ao mesmo tempo;
- um lote pode possuir vários animais;
- relacionamento: N:N;
- será usada uma tabela intermediária `animais_lotes`.

## Tabela lotes

```sql
CREATE TABLE lotes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    propriedade_id INTEGER NOT NULL,

    FOREIGN KEY (propriedade_id)
        REFERENCES propriedades(id)
);
```

Regra:
- cada lote pertence a uma propriedade específica para evitar misturar lotes de propriedades diferentes.

## Tabela animais_lotes

```sql
CREATE TABLE animais_lotes (
    animal_id INTEGER NOT NULL,
    lote_id INTEGER NOT NULL,

    PRIMARY KEY (animal_id, lote_id),

    FOREIGN KEY (animal_id)
        REFERENCES animais(id),

    FOREIGN KEY (lote_id)
        REFERENCES lotes(id)
);
```

Conceito aprendido:
- chave primária composta `PRIMARY KEY (animal_id, lote_id)` impede repetir exatamente a mesma relação.
- exemplo válido:

```text
animal_id | lote_id
1         | 2
1         | 3
1         | 5
```

- exemplo inválido:

```text
1 | 2
1 | 2
```

## CRUD de lotes

Rotas definidas:

```text
POST   /lotes
GET    /lotes
GET    /lotes/:id
PUT    /lotes/:id
DELETE /lotes/:id
```

### POST /lotes

```javascript
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
```

### GET /lotes

```javascript
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
```

### GET /lotes/:id

```javascript
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
```

### PUT /lotes/:id

```javascript
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
```

### DELETE /lotes/:id

```javascript
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
```

---

# 48. Relação entre animais e lotes

## POST /lotes/:id/animais

Objetivo: adicionar um animal a um lote.

Regras:
- lote deve existir;
- animal deve existir;
- animal e lote devem pertencer à mesma propriedade;
- a relação não pode existir previamente.

```javascript
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
            [animal_id, id]
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
            [animal_id, id]
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
```

## GET /lotes/:id/animais

```javascript
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
```

## DELETE /lotes/:id/animais/:animal_id

Objetivo: remover apenas a relação entre animal e lote, sem apagar o animal do sistema.

```javascript
app.delete("/lotes/:id/animais/:animal_id", async (req, res) => {
    try {
        const { id, animal_id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM animais_lotes
             WHERE lote_id = $1
             AND animal_id = $2
             RETURNING *`,
            [id, animal_id]
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
```

## GET /animais/:id/lotes

```javascript
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
```

Conceitos reforçados:
- `JOIN` é necessário para cruzar tabelas relacionadas.
- um recurso existente sem relações retorna `[]`.
- `404` é usado quando o recurso principal não existe.
- `400` é usado para regra de negócio inválida.

---

# 49. Módulo de vacinas

Decisão de modelagem:
- a tabela `vacinas` é geral no sistema;
- uma mesma vacina pode ser usada por várias propriedades;
- a aplicação da vacina em um animal é registrada em `vacinacoes`.

## Tabela vacinas

```sql
CREATE TABLE vacinas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    fabricante VARCHAR(100),
    descricao VARCHAR(255)
);
```

## CRUD de vacinas

Rotas:

```text
POST   /vacinas
GET    /vacinas
GET    /vacinas/:id
PUT    /vacinas/:id
DELETE /vacinas/:id
```

### POST /vacinas

```javascript
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
            [nome, fabricante, descricao]
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
```

### GET /vacinas

```javascript
app.get("/vacinas", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM vacinas"
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar vacinas"
        });
    }
});
```

### GET /vacinas/:id

```javascript
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
```

### PUT /vacinas/:id

```javascript
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
            [nome, fabricante, descricao, id]
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
```

### DELETE /vacinas/:id

```javascript
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
```

---

# 50. Módulo de vacinações

Decisão:
- `vacinas` guarda o cadastro da vacina;
- `vacinacoes` guarda cada aplicação realizada em um animal;
- `proxima_dose` é opcional;
- `observacao` é opcional.

## Tabela vacinacoes

```sql
CREATE TABLE vacinacoes (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL,
    vacina_id INTEGER NOT NULL,
    data_aplicacao DATE NOT NULL,
    proxima_dose DATE,
    observacao VARCHAR(255),

    FOREIGN KEY (animal_id)
        REFERENCES animais(id),

    FOREIGN KEY (vacina_id)
        REFERENCES vacinas(id)
);
```

A ordem correta de criação foi reforçada:
1. criar `vacinas`;
2. depois criar `vacinacoes`, pois ela referencia `vacinas(id)`.

## POST /vacinacoes

```javascript
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
                mensagem: "Animal, vacina e data de aplicação são obrigatórios"
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
             (animal_id, vacina_id, data_aplicacao, proxima_dose, observacao)
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
```

## GET /vacinacoes

Foi decidido usar JOIN para tornar a resposta mais clara, trazendo nome do animal e nome da vacina.

```javascript
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
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar vacinações"
        });
    }
});
```

Conceito reforçado:
- `animais.nome AS animal`
  - `animais.nome` identifica a coluna original;
  - `AS animal` é um apelido para a coluna no resultado.
- mesmo conceito para `vacinas.nome AS vacina`.

## GET /vacinacoes/:id

```javascript
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
```

## PUT /vacinacoes/:id

```javascript
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
                mensagem: "Animal, vacina e data de aplicação são obrigatórios"
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
```

## DELETE /vacinacoes/:id

Sintaxe correta aprendida:

```sql
DELETE FROM vacinacoes
WHERE id = $1
RETURNING *;
```

Não usar:

```sql
DELETE * FROM vacinacoes
```

porque `DELETE *` não é sintaxe válida.

Código:

```javascript
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
```

---

# 51. Histórico de vacinações de um animal

## GET /animais/:id/vacinacoes

Objetivo:
- mostrar o histórico de vacinações de um animal;
- trazer o nome da vacina com JOIN.

```javascript
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
```

Regra:
- animal inexistente → 404;
- animal existente sem vacinações → `[]`.

---

# 52. req.query

Novo conceito aprendido.

## req.params

Usado para valores que fazem parte da rota.

Exemplo:

```text
GET /animais/5
```

```javascript
const { id } = req.params;
```

## req.body

Usado para dados enviados no corpo da requisição.

Exemplo:

```json
{
  "nome": "Mimosa",
  "peso": 450
}
```

## req.query

Usado para filtros ou opções presentes depois de `?` na URL.

Exemplo:

```text
GET /vacinacoes/proximas?periodo=hoje
```

```javascript
const { periodo } = req.query;
```

Resumo:

```text
req.params → QUAL recurso?
req.body   → QUAIS DADOS?
req.query  → COMO FILTRAR?
```

Exemplo combinado:

```text
GET /animais/3/vacinacoes?periodo=hoje
```

```text
3 → req.params
periodo=hoje → req.query
```

---

# 53. Alertas de próximas doses

Foi planejada a rota:

```text
GET /vacinacoes/proximas
```

Com filtros:

```text
?periodo=hoje
?periodo=semana
?periodo=futuro
?periodo=todos
```

Decisão:
- `semana` significa próximos 7 dias a partir de hoje.
- se nenhum período for informado, usar `todos` por padrão.

## Filtros SQL

```text
hoje   → proxima_dose = CURRENT_DATE
semana → proxima_dose BETWEEN CURRENT_DATE
         AND CURRENT_DATE + INTERVAL '7 days'
futuro → proxima_dose > CURRENT_DATE
todos  → proxima_dose IS NOT NULL
```

Conceito aprendido:
- `IS NULL` verifica ausência de valor;
- `IS NOT NULL` verifica presença de valor;
- não usar `= NULL`.

## Objeto de filtros

```javascript
const filtrosPeriodo = {
    hoje: "vacinacoes.proxima_dose = CURRENT_DATE",

    semana: `
        vacinacoes.proxima_dose BETWEEN CURRENT_DATE
        AND CURRENT_DATE + INTERVAL '7 days'
    `,

    futuro: "vacinacoes.proxima_dose > CURRENT_DATE",

    todos: "vacinacoes.proxima_dose IS NOT NULL"
};
```

Período padrão:

```javascript
const { periodo = "todos" } = req.query;
```

Busca do filtro:

```javascript
const filtro = filtrosPeriodo[periodo];
```

Exemplo:

```text
periodo = "semana"
```

então:

```javascript
filtrosPeriodo["semana"]
```

retorna a condição SQL referente à semana.

Se o usuário informar algo inválido, por exemplo:

```text
?periodo=abc
```

então:

```javascript
filtrosPeriodo["abc"]
```

retorna:

```text
undefined
```

Tratamento:

```javascript
if (!filtro) {
    return res.status(400).json({
        mensagem: "Período inválido. Use hoje, semana, futuro ou todos"
    });
}
```

## Rota completa

```javascript
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
                mensagem: "Período inválido. Use hoje, semana, futuro ou todos"
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
```

Observação importante:
- a rota `/vacinacoes/proximas` deve ficar antes de `/vacinacoes/:id` para evitar que `proximas` seja interpretado como um ID.

---

# 54. Status HTTP reforçados nesta etapa

```text
200 → operação/busca bem-sucedida
201 → recurso criado com sucesso
400 → dados inválidos ou regra de negócio inválida
404 → recurso não encontrado
500 → erro interno do servidor
```

Exemplos vistos:
- animal e lote de propriedades diferentes → 400;
- vacinação inexistente → 404;
- período inválido em `req.query` → 400.

---

# 55. server.js consolidado da etapa atual

Foi entregue ao usuário um `server.js` completo contendo:
- conexão PostgreSQL;
- CRUD de propriedades;
- CRUD de animais;
- GET de animais por propriedade;
- CRUD de lotes;
- relação N:N animais ↔ lotes;
- consulta de lotes por animal;
- CRUD de vacinas;
- CRUD de vacinações;
- histórico de vacinações do animal;
- rota `/vacinacoes/proximas` com filtros por `req.query`.

A senha real do PostgreSQL continua devendo ser mantida fora de arquivos compartilhados.

---

# 56. Início do módulo de despesas

Foi iniciado o planejamento de despesas.

Decisão:
- cada despesa deve possuir `propriedade_id` para identificar a qual propriedade pertence;
- `categoria` será texto livre inicialmente, sem tabela separada de categorias.

Estrutura planejada:

```sql
CREATE TABLE despesas (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data DATE NOT NULL,
    propriedade_id INTEGER NOT NULL,

    FOREIGN KEY (propriedade_id)
        REFERENCES propriedades(id)
);
```

Exemplos de categoria:

```text
Ração
Combustível
Energia
Medicamentos
Manutenção
Funcionário
Outros
```

## Próximo ponto exato para continuar

A última pergunta feita foi sobre a validação do campo `valor` da despesa:

```text
O campo valor pode aceitar 0 ou valor negativo,
ou devemos exigir que seja sempre maior que zero?
```

Portanto, a continuação deve começar pela definição dessa regra e depois seguir com o CRUD de despesas.

---

# 57. Estado atual do projeto após esta atualização

## Propriedades
CRUD completo.

## Animais
CRUD completo + listagem por propriedade.

## Lotes
CRUD completo.

## Animais ↔ Lotes
Relacionamento N:N implementado conceitualmente e com rotas.

## Vacinas
CRUD completo.

## Vacinações
CRUD completo + JOINs + histórico por animal.

## Alertas de vacinação
Filtro por:
- hoje;
- próximos 7 dias;
- futuro;
- todos.

## req.query
Conceito aprendido e aplicado.

## Despesas
Tabela planejada; CRUD ainda não iniciado.

## Frontend
Ainda não iniciado.

## Próximas etapas

```text
1. finalizar regras de despesas
2. criar tabela despesas
3. criar CRUD de despesas
4. criar consultas de despesas por propriedade
5. futuramente criar totais e filtros financeiros
6. revisar backend completo
7. organizar arquivos do backend
8. iniciar frontend React
```

# FIM DA ATUALIZAÇÃO DE 22/08/2026

---

# ATUALIZAÇÃO DA MEMÓRIA — CONTINUAÇÃO DA CONVERSA DE 23/08/2026

> Esta seção registra o desenvolvimento realizado após o ponto salvo anteriormente, principalmente o módulo de despesas e os conceitos financeiros associados.

# 58. Correção ao criar a tabela despesas

Ao tentar executar `CREATE TABLE despesas`, ocorreu o erro:

```text
ERRO: relação "propriedades" não existe
```

Foi identificado que o `psql` estava conectado ao banco padrão:

```text
postgres=#
```

em vez do banco do projeto:

```text
agrocontrol=#
```

Correção:

```sql
\c agrocontrol
```

Depois, conferir as tabelas:

```sql
\dt
```

E então criar a tabela `despesas` dentro do banco correto.

---

# 59. Regra definida para o valor da despesa

Decisão tomada:

```text
valor > 0
```

Portanto:
- `valor = 0` é inválido no cadastro;
- valor negativo é inválido no cadastro;
- apenas valores maiores que zero são aceitos.

Validação definida:

```javascript
if (valor <= 0) {
    return res.status(400).json({
        mensagem: "O valor da despesa deve ser maior que zero"
    });
}
```

---

# 60. Estrutura definitiva da tabela despesas

```sql
CREATE TABLE despesas (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data DATE NOT NULL,
    propriedade_id INTEGER NOT NULL,

    FOREIGN KEY (propriedade_id)
        REFERENCES propriedades(id)
);
```

Campos:

```text
id             → chave primária
descricao      → descrição da despesa
categoria      → texto livre
valor          → valor monetário da despesa
data           → data da despesa
propriedade_id → propriedade à qual a despesa pertence
```

---

# 61. POST /despesas

Fluxo definido:

```text
recebe req.body
↓
valida campos obrigatórios
↓
valida valor > 0
↓
verifica se propriedade existe
↓
INSERT
↓
RETURNING *
↓
201 Created
```

Código consolidado:

```javascript
app.post("/despesas", async (req, res) => {
    try {
        const {
            descricao,
            categoria,
            valor,
            data,
            propriedade_id
        } = req.body;

        if (!descricao || !categoria || !valor || !data || !propriedade_id) {
            return res.status(400).json({
                mensagem: "Todos os campos são obrigatórios"
            });
        }

        if (valor <= 0) {
            return res.status(400).json({
                mensagem: "O valor da despesa deve ser maior que zero"
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
            `INSERT INTO despesas
            (descricao, categoria, valor, data, propriedade_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                descricao,
                categoria,
                valor,
                data,
                propriedade_id
            ]
        );

        res.status(201).json({
            mensagem: "Despesa cadastrada com sucesso!",
            despesa: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar despesa"
        });
    }
});
```

Conceitos reforçados:
- `req.body` contém os dados do cadastro;
- `201` é usado quando um novo recurso é criado;
- `400` é usado para dados inválidos;
- `404` é usado quando a propriedade relacionada não existe;
- `resultado.rows[0]` retorna o único registro criado.

---

# 62. GET /despesas com JOIN

Decisão:
- retornar `propriedade_id`;
- retornar também o nome da propriedade usando `JOIN`.

Código:

```javascript
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
            ORDER BY despesas.data DESC
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar despesas"
        });
    }
});
```

Regra de listagem reforçada:

```text
nenhum registro encontrado → 200 com []
```

---

# 63. GET /despesas/:id

Código:

```javascript
app.get("/despesas/:id", async (req, res) => {
    try {
        const { id } = req.params;

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
            WHERE despesas.id = $1
        `, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Despesa não encontrada"
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar despesa"
        });
    }
});
```

Regra reforçada:

```text
buscar lista → resultado.rows
buscar um registro → resultado.rows[0]
```

---

# 64. PUT /despesas/:id

Código consolidado:

```javascript
app.put("/despesas/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            descricao,
            categoria,
            valor,
            data,
            propriedade_id
        } = req.body;

        if (!descricao || !categoria || !valor || !data || !propriedade_id) {
            return res.status(400).json({
                mensagem: "Todos os campos são obrigatórios"
            });
        }

        if (valor <= 0) {
            return res.status(400).json({
                mensagem: "O valor da despesa deve ser maior que zero"
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
            `UPDATE despesas
             SET descricao = $1,
                 categoria = $2,
                 valor = $3,
                 data = $4,
                 propriedade_id = $5
             WHERE id = $6
             RETURNING *`,
            [
                descricao,
                categoria,
                valor,
                data,
                propriedade_id,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Despesa não encontrada"
            });
        }

        res.json({
            mensagem: "Despesa atualizada com sucesso!",
            despesa: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar despesa"
        });
    }
});
```

Status usado em atualização bem-sucedida:

```text
200
```

---

# 65. DELETE /despesas/:id

Consulta correta:

```sql
DELETE FROM despesas
WHERE id = $1
RETURNING *;
```

Código:

```javascript
app.delete("/despesas/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM despesas
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Despesa não encontrada"
            });
        }

        res.json({
            mensagem: "Despesa excluída com sucesso!",
            despesa: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao excluir despesa"
        });
    }
});
```

Status em exclusão bem-sucedida:

```text
200
```

---

# 66. CRUD de despesas concluído conceitualmente

```text
POST   /despesas      → criar
GET    /despesas      → listar
GET    /despesas/:id  → buscar uma
PUT    /despesas/:id  → atualizar
DELETE /despesas/:id  → excluir
```

---

# 67. GET /propriedades/:id/despesas

Objetivo:
- listar as despesas pertencentes a uma propriedade específica.

Regra importante:

```text
propriedade não existe → 404
propriedade existe, mas não tem despesas → 200 com []
```

Estrutura inicial:

```javascript
app.get("/propriedades/:id/despesas", async (req, res) => {
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
            `SELECT * FROM despesas
             WHERE propriedade_id = $1
             ORDER BY data DESC`,
            [id]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar despesas da propriedade"
        });
    }
});
```

---

# 68. Totais financeiros com SUM e COALESCE

Função aprendida:

```sql
SUM(valor)
```

Serve para somar os valores das despesas.

Exemplo:

```sql
SELECT SUM(valor) AS total
FROM despesas
WHERE propriedade_id = $1;
```

Como `SUM` pode retornar `NULL` quando não existem registros, foi introduzido:

```sql
COALESCE(SUM(valor), 0)
```

Exemplo:

```sql
SELECT COALESCE(SUM(valor), 0) AS total
FROM despesas
WHERE propriedade_id = $1;
```

Conceito:

```text
COALESCE(valor, 0)
→ se valor não for NULL, retorna valor
→ se valor for NULL, retorna 0
```

---

# 69. GROUP BY categoria

Objetivo:
- descobrir quanto foi gasto em cada categoria.

Consulta:

```sql
SELECT
    categoria,
    SUM(valor) AS total
FROM despesas
WHERE propriedade_id = $1
GROUP BY categoria
ORDER BY total DESC;
```

Conceito aprendido:

```text
GROUP BY categoria
→ reúne despesas que possuem a mesma categoria
→ permite que SUM calcule o total de cada grupo
```

---

# 70. Funções de agregação aprendidas

Foram estudadas as seguintes funções SQL:

```text
SUM(valor)   → soma dos valores
COUNT(*)     → quantidade de registros
AVG(valor)   → média dos valores
MAX(valor)   → maior valor
MIN(valor)   → menor valor
```

Consulta de resumo:

```sql
SELECT
    COALESCE(SUM(valor), 0) AS total,
    COALESCE(AVG(valor), 0) AS media,
    COALESCE(MAX(valor), 0) AS maior,
    COALESCE(MIN(valor), 0) AS menor,
    COUNT(*) AS quantidade
FROM despesas
WHERE propriedade_id = $1;
```

Quando não há despesas:

```text
SUM → NULL sem COALESCE
AVG → NULL sem COALESCE
MAX → NULL sem COALESCE
MIN → NULL sem COALESCE
COUNT(*) → 0
```

---

# 71. Resumo por categoria mais completo

Consulta estudada:

```sql
SELECT
    categoria,
    SUM(valor) AS total,
    COUNT(*) AS quantidade,
    AVG(valor) AS media
FROM despesas
WHERE propriedade_id = $1
GROUP BY categoria
ORDER BY total DESC;
```

Retorna por categoria:
- total gasto;
- quantidade de despesas;
- valor médio das despesas.

---

# 72. Filtro de período com req.query

Rota exemplo:

```text
GET /propriedades/3/despesas?periodo=mes
```

Interpretação:

```text
3   → req.params
mes → req.query
```

Código:

```javascript
const { id } = req.params;
const { periodo = "todos" } = req.query;
```

Períodos definidos:

```text
hoje
semana
mes
todos
```

Validação:

```javascript
if (!["hoje", "semana", "mes", "todos"].includes(periodo)) {
    return res.status(400).json({
        mensagem: "Período inválido. Use hoje, semana, mes ou todos"
    });
}
```

Filtro de hoje:

```sql
data = CURRENT_DATE
```

Filtro de semana para despesas já ocorridas:

```sql
data BETWEEN CURRENT_DATE - INTERVAL '7 days'
AND CURRENT_DATE
```

Filtro do mês atual:

```sql
data BETWEEN DATE_TRUNC('month', CURRENT_DATE)
AND CURRENT_DATE
```

Todos:

```text
nenhuma condição adicional de data
```

---

# 73. Separação entre lista e resumo financeiro

Decisão tomada:

```text
GET /propriedades/:id/despesas
→ lista de despesas

GET /propriedades/:id/despesas/resumo
→ total e dados agregados
```

Foi preferido separar a listagem do resumo para deixar a API mais organizada.

---

# 74. GET /propriedades/:id/despesas/resumo

Objetivo:
- verificar a propriedade;
- validar período;
- aplicar filtros;
- calcular total;
- calcular categorias;
- futuramente retornar média, maior, menor e quantidade.

Versão estudada:

```javascript
app.get("/propriedades/:id/despesas/resumo", async (req, res) => {
    try {
        const { id } = req.params;
        const { periodo = "todos" } = req.query;

        const propriedadeExiste = await pool.query(
            "SELECT * FROM propriedades WHERE id = $1",
            [id]
        );

        if (propriedadeExiste.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Propriedade não encontrada"
            });
        }

        if (!["hoje", "semana", "mes", "todos"].includes(periodo)) {
            return res.status(400).json({
                mensagem: "Período inválido. Use hoje, semana, mes ou todos"
            });
        }

        let filtro = "";

        if (periodo === "hoje") {
            filtro = "AND data = CURRENT_DATE";
        }

        if (periodo === "semana") {
            filtro = `AND data BETWEEN CURRENT_DATE - INTERVAL '7 days'
                      AND CURRENT_DATE`;
        }

        if (periodo === "mes") {
            filtro = `AND data BETWEEN DATE_TRUNC('month', CURRENT_DATE)
                      AND CURRENT_DATE`;
        }

        const totalResultado = await pool.query(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM despesas
             WHERE propriedade_id = $1
             ${filtro}`,
            [id]
        );

        const categoriasResultado = await pool.query(
            `SELECT
                categoria,
                SUM(valor) AS total
             FROM despesas
             WHERE propriedade_id = $1
             ${filtro}
             GROUP BY categoria
             ORDER BY total DESC`,
            [id]
        );

        res.json({
            periodo,
            total: totalResultado.rows[0].total,
            categorias: categoriasResultado.rows
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar resumo de despesas"
        });
    }
});
```

---

# 75. Filtros opcionais de despesas

Foram planejados filtros adicionais por `req.query`:

```text
categoria
valor_minimo
valor_maximo
data_inicio
data_fim
```

Exemplo:

```text
GET /propriedades/3/despesas?categoria=Ração&valor_minimo=500
```

Todos os valores depois de `?` vêm de `req.query`.

---

# 76. req.query retorna strings

Conceito reforçado:

```text
?valor_minimo=500
```

chega no Node como algo equivalente a:

```javascript
valor_minimo === "500"
```

Por isso, para comparações numéricas foi usado:

```javascript
Number(valor_minimo)
```

---

# 77. Validação de valor_minimo e valor_maximo

Validar se são numéricos:

```javascript
if (valor_minimo && isNaN(Number(valor_minimo))) {
    return res.status(400).json({
        mensagem: "Valor mínimo inválido"
    });
}

if (valor_maximo && isNaN(Number(valor_maximo))) {
    return res.status(400).json({
        mensagem: "Valor máximo inválido"
    });
}
```

Validar negativos:

```javascript
if (valor_minimo && Number(valor_minimo) < 0) {
    return res.status(400).json({
        mensagem: "O valor mínimo não pode ser negativo"
    });
}

if (valor_maximo && Number(valor_maximo) < 0) {
    return res.status(400).json({
        mensagem: "O valor máximo não pode ser negativo"
    });
}
```

Regra importante definida:

```text
valor = 0 no cadastro da despesa → inválido
valor_minimo = 0 em filtro → válido
valor_maximo = 0 em filtro → válido
```

Isso acontece porque filtros apenas restringem a pesquisa e não representam uma nova despesa sendo criada.

Validação mínimo > máximo:

```javascript
if (
    valor_minimo &&
    valor_maximo &&
    Number(valor_minimo) > Number(valor_maximo)
) {
    return res.status(400).json({
        mensagem: "O valor mínimo não pode ser maior que o valor máximo"
    });
}
```

Se os dois forem iguais, o filtro é válido e busca exatamente aquele valor.

---

# 78. Parâmetros SQL dinâmicos

Foi introduzida a ideia de montar filtros opcionais com um array de parâmetros.

Base:

```javascript
const valores = [id];
let filtro = "";
```

Categoria:

```javascript
if (categoria) {
    const parametro = valores.length + 1;

    filtro += ` AND categoria = $${parametro}`;
    valores.push(categoria);
}
```

Valor mínimo:

```javascript
if (valor_minimo) {
    const parametro = valores.length + 1;

    filtro += ` AND valor >= $${parametro}`;
    valores.push(Number(valor_minimo));
}
```

Valor máximo:

```javascript
if (valor_maximo) {
    const parametro = valores.length + 1;

    filtro += ` AND valor <= $${parametro}`;
    valores.push(Number(valor_maximo));
}
```

Exemplo:

```javascript
valores = [3, "Ração", 500, 2000];
```

Significa:

```text
$1 → 3
$2 → "Ração"
$3 → 500
$4 → 2000
```

Conceito aprendido:
- não assumir que categoria será sempre `$2`;
- o número do parâmetro pode ser calculado por `valores.length + 1`;
- `filtro` e `valores` devem ser montados na mesma sequência.

---

# 79. Filtros por data_inicio e data_fim

Exemplo:

```text
/propriedades/3/despesas?data_inicio=2026-08-01&data_fim=2026-08-23
```

Ambos vêm de:

```javascript
req.query
```

Filtro de data inicial:

```javascript
if (data_inicio) {
    const parametro = valores.length + 1;

    filtro += ` AND data >= $${parametro}`;
    valores.push(data_inicio);
}
```

Filtro de data final:

```javascript
if (data_fim) {
    const parametro = valores.length + 1;

    filtro += ` AND data <= $${parametro}`;
    valores.push(data_fim);
}
```

Regra:

```text
data_inicio → data >= início
data_fim    → data <= fim
```

Pode ser enviado apenas `data_inicio` ou apenas `data_fim`.

---

# 80. Validação de datas

Data inválida deve retornar `400`.

Exemplo:

```javascript
if (data_inicio && isNaN(Date.parse(data_inicio))) {
    return res.status(400).json({
        mensagem: "Data inicial inválida"
    });
}

if (data_fim && isNaN(Date.parse(data_fim))) {
    return res.status(400).json({
        mensagem: "Data final inválida"
    });
}
```

Validação da ordem:

```javascript
if (
    data_inicio &&
    data_fim &&
    new Date(data_inicio) > new Date(data_fim)
) {
    return res.status(400).json({
        mensagem: "A data inicial não pode ser posterior à data final"
    });
}
```

---

# 81. Conflito entre periodo e intervalo personalizado

Decisão:
- se `periodo` for diferente de `todos` e também forem enviadas datas personalizadas, retornar `400`.

Exemplo de conflito:

```text
?periodo=mes&data_inicio=2026-08-01&data_fim=2026-08-23
```

Validação:

```javascript
if (
    periodo !== "todos" &&
    (data_inicio || data_fim)
) {
    return res.status(400).json({
        mensagem: "Use periodo ou intervalo de datas, não os dois ao mesmo tempo"
    });
}
```

---

# 82. Ordenação aprendida

Mais recente para mais antiga:

```sql
ORDER BY data DESC
```

Mais antiga para mais recente:

```sql
ORDER BY data ASC
```

Mais recente primeiro e, em empate de data, maior valor primeiro:

```sql
ORDER BY data DESC, valor DESC
```

Categoria com maior gasto total primeiro:

```sql
ORDER BY total DESC
```

Categoria com menor gasto total primeiro:

```sql
ORDER BY total ASC
```

---

# 83. Reutilização de filtro e valores

Decisão:
- montar `filtro` e `valores` apenas uma vez;
- reutilizar em consultas diferentes.

Exemplo:

```javascript
const despesasResultado = await pool.query(
    `SELECT *
     FROM despesas
     WHERE propriedade_id = $1
     ${filtro}
     ORDER BY data DESC`,
    valores
);

const resumoResultado = await pool.query(
    `SELECT
        COALESCE(SUM(valor), 0) AS total,
        COALESCE(AVG(valor), 0) AS media,
        COALESCE(MAX(valor), 0) AS maior,
        COALESCE(MIN(valor), 0) AS menor,
        COUNT(*) AS quantidade
     FROM despesas
     WHERE propriedade_id = $1
     ${filtro}`,
    valores
);
```

Regra importante:
- se o SQL contém `$1`, `$2`, `$3`, o array passado ao `pool.query` precisa conter valores correspondentes para todos esses parâmetros.

---

# 84. Possível função montarFiltrosDespesas

Foi introduzida como refatoração futura a ideia de separar a lógica de filtros em uma função.

Exemplo:

```javascript
function montarFiltrosDespesas({
    id,
    categoria,
    valor_minimo,
    valor_maximo,
    data_inicio,
    data_fim
}) {
    const valores = [id];
    let filtro = "";

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

    return {
        filtro,
        valores
    };
}
```

A ideia é futura; por enquanto o projeto continua propositalmente simples para aprendizado.

---

# 85. Desestruturação de objetos reforçada

Exemplo:

```javascript
const { filtro, valores } = montarFiltrosDespesas(...);
```

Isso é desestruturação de objeto.

Se uma função retornar:

```javascript
{
    filtro: "AND valor >= $2",
    valores: [3, 500]
}
```

então:

```javascript
const { filtro, valores } = resultado;
```

gera:

```text
filtro  → "AND valor >= $2"
valores → [3, 500]
```

Também foi reforçado que é possível pegar apenas uma propriedade:

```javascript
const { filtro } = resultado;
```

---

# 86. pool.query(sql, valores)

Conceito reforçado:

```javascript
const resultado = await pool.query(sql, valores);
```

Significado:

```text
sql      → string da consulta SQL
valores  → array que preenche $1, $2, $3...
resultado.rows → linhas retornadas pelo PostgreSQL
```

Exemplo:

```javascript
valores = [3, "Ração", 500];
```

```text
$1 → 3
$2 → "Ração"
$3 → 500
```

---

# 87. resultado.rows x resultado.rows[0]

Regra reforçada várias vezes:

```text
resultado.rows
→ array de registros
→ usado em listagens

resultado.rows[0]
→ primeiro objeto do array
→ usado quando se espera um único registro
```

Aplicação no CRUD de despesas:

```text
POST /despesas       → resultado.rows[0]
GET /despesas        → resultado.rows
GET /despesas/:id    → resultado.rows[0]
PUT /despesas/:id    → resultado.rows[0]
DELETE /despesas/:id → resultado.rows[0]
```

---

# 88. Regras de status HTTP consolidadas para despesas

```text
200 → busca, atualização ou exclusão bem-sucedida
201 → despesa criada com sucesso
400 → campo inválido, filtro inválido ou regra de negócio inválida
404 → despesa/propriedade específica não encontrada
500 → erro interno do servidor
```

Exemplos:

```text
POST sem categoria → 400
POST com valor = 0 → 400
POST com valor negativo → 400
POST válido → 201
propriedade_id inexistente → 404
GET /despesas vazio → 200 com []
GET /despesas/:id inexistente → 404
PUT inexistente → 404
DELETE inexistente → 404
valor_minimo=abc → 400
propriedade inexistente em listagem relacionada → 404
propriedade existe mas não há despesas → 200 com []
```

---

# 89. RETURNING * revisado

Foi reforçado que `RETURNING *` é útil em:

```text
INSERT
UPDATE
DELETE
```

Porque devolve o registro afetado.

Exemplos:

```text
POST   → devolve a despesa criada
PUT    → devolve a despesa atualizada
DELETE → devolve a despesa removida
```

`SELECT` não precisa de `RETURNING *`, porque ele já retorna os registros buscados.

---

# 90. req.body, req.params e req.query revisados

## req.body

Usado para dados enviados no corpo da requisição.

Exemplo:

```text
POST /despesas
```

Campos:

```text
descricao
categoria
valor
data
propriedade_id
```

## req.params

Usado para valores presentes no caminho da URL.

Exemplo:

```text
GET /despesas/5
```

```text
5 → req.params.id
```

Outro exemplo:

```text
GET /propriedades/3/despesas
```

```text
3 → req.params.id
```

## req.query

Usado para filtros depois de `?`.

Exemplo:

```text
GET /propriedades/3/despesas?periodo=mes&categoria=Ração&valor_minimo=500
```

```text
mes    → req.query.periodo
Ração  → req.query.categoria
500    → req.query.valor_minimo
```

---

# 91. Reutilização do resultado da propriedade

Depois de verificar:

```javascript
const propriedadeExiste = await pool.query(
    "SELECT * FROM propriedades WHERE id = $1",
    [id]
);
```

foi introduzida a forma:

```javascript
const propriedade = propriedadeExiste.rows[0];
```

Depois é possível acessar diretamente:

```javascript
propriedade.id
propriedade.nome
propriedade.cidade
propriedade.estado
propriedade.area
```

Também foi planejado montar:

```javascript
const dadosPropriedade = {
    id: propriedade.id,
    nome: propriedade.nome,
    cidade: propriedade.cidade,
    estado: propriedade.estado,
    area: propriedade.area
};
```

para deixar a resposta do resumo financeiro mais organizada.

---

# 92. Estrutura de resposta planejada para resumo financeiro

Exemplo:

```json
{
  "propriedade": {
    "id": 3,
    "nome": "Fazenda Esperança",
    "cidade": "Uberaba",
    "estado": "MG",
    "area": "450.00"
  },
  "resumo": {
    "total": "5400.00",
    "media": "1080.00",
    "maior": "2000.00",
    "menor": "300.00",
    "quantidade": "5"
  },
  "categorias": []
}
```

Acesso aos campos do resumo:

```javascript
resumoResultado.rows[0].total
resumoResultado.rows[0].media
resumoResultado.rows[0].maior
resumoResultado.rows[0].menor
resumoResultado.rows[0].quantidade
```

Lista de categorias:

```javascript
categoriasResultado.rows
```

---

# 93. Status atual do aprendizado após 23/08/2026

Além dos conceitos anteriores, agora foram estudados/praticados:

- módulo de despesas;
- CRUD de despesas;
- JOIN despesas + propriedades;
- filtros por propriedade;
- `SUM`;
- `COUNT`;
- `AVG`;
- `MAX`;
- `MIN`;
- `GROUP BY`;
- `ORDER BY ASC`;
- `ORDER BY DESC`;
- `COALESCE`;
- filtros financeiros por período;
- filtros opcionais por categoria;
- filtros por valor mínimo e máximo;
- filtros por data inicial e final;
- validação de `req.query`;
- conversão com `Number()`;
- validação com `isNaN()`;
- validação de datas com `Date.parse()`;
- parâmetros SQL dinâmicos;
- arrays dinâmicos de valores;
- `valores.length + 1` para calcular `$2`, `$3`, etc.;
- reutilização de filtros entre consultas;
- desestruturação de objetos;
- função auxiliar futura para montar filtros;
- diferença entre lista vazia e recurso inexistente;
- resposta estruturada para resumo financeiro.

---

# 94. Estado atual do projeto após esta atualização

## Propriedades
CRUD completo.

## Animais
CRUD completo + listagem por propriedade.

## Lotes
CRUD completo.

## Animais ↔ Lotes
Relacionamento N:N implementado conceitualmente e com rotas.

## Vacinas
CRUD completo.

## Vacinações
CRUD completo + JOINs + histórico por animal.

## Alertas de vacinação
Filtros implementados conceitualmente por `req.query`.

## Despesas
Agora possui conceitualmente:
- tabela definida;
- regra `valor > 0`;
- POST;
- GET;
- GET por ID;
- PUT;
- DELETE;
- listagem por propriedade;
- JOIN com propriedade;
- filtros por período;
- filtros opcionais por categoria;
- filtros por valor;
- filtros por datas;
- total financeiro;
- total por categoria;
- quantidade por categoria;
- média por categoria;
- maior despesa;
- menor despesa;
- resumo financeiro;
- uso de `COALESCE` para valores vazios.

## Frontend
Ainda não iniciado.

---

# 95. Próximo ponto exato para continuar

A última pergunta da aula foi:

```text
Se quisermos pegar a lista de categorias retornada por:

const categoriasResultado = await pool.query(...);

qual expressão usamos?

A) categoriasResultado.rows
B) categoriasResultado.rows[0]
C) categoriasResultado.categorias
```

A continuação deve começar a partir dessa pergunta.

Depois disso, próximos passos recomendados:

```text
1. concluir a rota de resumo financeiro com resposta estruturada
2. revisar o módulo de despesas completo
3. atualizar o server.js consolidado com despesas
4. testar as rotas no Postman
5. revisar backend inteiro
6. organizar backend em arquivos separados
7. mover credenciais para .env
8. iniciar frontend React
```

# FIM DA ATUALIZAÇÃO DE 23/08/2026

---

# ATUALIZAÇÃO DA MEMÓRIA — CONTINUAÇÃO DA CONVERSA DE 23/08/2026 — FRONTEND E INTEGRAÇÃO

> Esta seção registra o desenvolvimento realizado após o ponto anterior da memória. A partir deste momento, foi decidido encerrar as perguntas/quiz e acelerar a finalização prática do BoviTrack.

# 96. Mudança de estratégia de desenvolvimento

Decisão tomada:
- interromper perguntas de revisão;
- priorizar finalização rápida do projeto;
- concluir primeiro o backend essencial;
- iniciar imediatamente o frontend React;
- evitar novas funcionalidades não essenciais antes da entrega.

Ordem prática adotada:

```text
1. concluir backend funcional
2. mover credenciais para .env
3. configurar CORS
4. iniciar frontend React
5. integrar frontend + backend
6. criar CRUDs principais no frontend
7. criar Vacinações
8. criar Dashboard
9. depois focar em CSS, revisão e entrega
```

---

# 97. Instalação e configuração do dotenv

Foi instalado no backend:

```bash
npm install dotenv
```

Resultado registrado:

```text
added 1 package
found 0 vulnerabilities
```

Foi criado o arquivo:

```text
.env
```

Estrutura usada:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=agrocontrol
DB_PASSWORD=SUA_SENHA_DO_POSTGRES
DB_PORT=5432
PORT=3000
```

No topo do `server.js` foi adicionado:

```javascript
require("dotenv").config();
```

O `Pool` passou a usar variáveis de ambiente:

```javascript
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
```

A porta do servidor passou a ser carregada do `.env`:

```javascript
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor esta em http://localhost:${PORT}`);
});
```

Teste executado:

```bash
node server.js
```

Resultado:

```text
Servidor esta em http://localhost:3000
```

Conclusão:
- `.env` funcionando;
- credenciais retiradas do código principal;
- backend iniciando corretamente.

---

# 98. .gitignore

Foi orientada a criação de:

```text
.gitignore
```

Conteúdo:

```text
node_modules/
.env
```

Objetivo:
- impedir envio de dependências;
- impedir exposição da senha do PostgreSQL no GitHub.

---

# 99. Início do frontend React

Foi criado o frontend usando Vite + React.

Comandos utilizados:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom
npm run dev
```

O Vite iniciou inicialmente na porta:

```text
http://localhost:5174
```

porque a porta 5173 estava ocupada.

Posteriormente a porta padrão ficou novamente disponível e o frontend passou a executar em:

```text
http://localhost:5173
```

Tecnologias efetivamente usadas nesta etapa:
- React;
- Vite;
- Axios;
- React Router DOM.

---

# 100. Configuração do Axios

Foi criado:

```text
src/services/api.js
```

Conteúdo:

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000"
});

export default api;
```

Fluxo confirmado:

```text
React
   ↓
Axios
   ↓
Express :3000
   ↓
PostgreSQL
```

---

# 101. Problema de CORS e correção

Ao tentar buscar propriedades pelo React, ocorreu:

```text
Erro ao carregar propriedades
```

A causa provável foi diferença de origem entre:

```text
frontend → localhost:5173/5174
backend  → localhost:3000
```

Foi instalado:

```bash
npm install cors
```

No `server.js` foi adicionado:

```javascript
const cors = require("cors");
```

E na configuração do Express:

```javascript
app.use(express.json());
app.use(cors());
```

Após isso, a integração funcionou corretamente.

---

# 102. Estrutura inicial do frontend

Estrutura adotada:

```text
frontend/
└── src/
    ├── components/
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── Propriedades.jsx
    │   ├── Animais.jsx
    │   ├── Lotes.jsx
    │   ├── Vacinas.jsx
    │   ├── Vacinacoes.jsx
    │   └── Despesas.jsx
    ├── services/
    │   └── api.js
    ├── App.jsx
    └── main.jsx
```

---

# 103. Navegação com React Router

Foi criado menu principal com rotas para:

```text
/
/propriedades
/animais
/lotes
/vacinas
/vacinacoes
/despesas
```

O `App.jsx` passou a usar:

```javascript
BrowserRouter
Routes
Route
Link
```

As telas foram testadas e abriram corretamente.

---

# 104. Frontend — Propriedades

Foi implementado CRUD completo de propriedades no React.

Funcionalidades implementadas:
- listar propriedades;
- cadastrar;
- editar;
- cancelar edição;
- excluir;
- exibir mensagens retornadas pelo backend.

Rotas usadas:

```text
GET    /propriedades
POST   /propriedades
PUT    /propriedades/:id
DELETE /propriedades/:id
```

Estado usado no formulário:

```text
nome
cidade
estado
area
editandoId
mensagem
```

Teste realizado:
- cadastro funcionando;
- edição funcionando;
- cancelamento funcionando;
- exclusão funcionando.

---

# 105. Frontend — Animais

Foi implementado CRUD completo de animais no React.

Funcionalidades:
- listar animais;
- cadastrar;
- editar;
- excluir;
- escolher propriedade em `<select>`;
- mostrar nome da propriedade quando disponível.

Campos usados:

```text
nome
especie
raca
sexo
peso
propriedade_id
```

Rotas usadas:

```text
GET    /animais
POST   /animais
PUT    /animais/:id
DELETE /animais/:id
GET    /propriedades
```

Teste realizado:
- cadastro funcionando;
- edição funcionando;
- exclusão funcionando.

---

# 106. Frontend — Lotes

Foi implementado CRUD de lotes no React.

Campos:

```text
nome
descricao
propriedade_id
```

Rotas usadas:

```text
GET    /lotes
POST   /lotes
PUT    /lotes/:id
DELETE /lotes/:id
GET    /propriedades
```

Teste realizado:
- cadastro funcionando;
- edição funcionando;
- exclusão funcionando.

---

# 107. Frontend — Vacinas

Foi implementado CRUD de vacinas no React.

Campos:

```text
nome
descricao
```

Rotas usadas:

```text
GET    /vacinas
POST   /vacinas
PUT    /vacinas/:id
DELETE /vacinas/:id
```

A tela passou a listar, cadastrar, editar e excluir vacinas.

---

# 108. Frontend — Despesas

Foi implementado CRUD de despesas no React.

Campos:

```text
descricao
categoria
valor
data
propriedade_id
```

Rotas usadas:

```text
GET    /despesas
POST   /despesas
PUT    /despesas/:id
DELETE /despesas/:id
GET    /propriedades
```

Detalhes:
- `valor` é convertido usando `Number(valor)`;
- data usa `<input type="date">`;
- propriedade usa `<select>`;
- valores são exibidos com `toFixed(2)`;
- data é formatada com `toLocaleDateString("pt-BR")`.

---

# 109. Bug após excluir registros no frontend

Problema observado:

```text
Após excluir algo de qualquer lista, não era mais possível digitar em nenhum campo.
```

Correções aplicadas:

## Botões Editar/Excluir

Todos passaram a usar explicitamente:

```jsx
<button type="button">...</button>
```

para evitar comportamento inesperado de `submit`.

## Atualização local do estado após DELETE

Em vez de sempre chamar novamente a listagem depois da exclusão, passou a ser usado `filter` no estado local.

Exemplo em despesas:

```javascript
setDespesas((despesasAtuais) =>
    despesasAtuais.filter((despesa) => despesa.id !== id)
);
```

Mesma ideia aplicada em:
- propriedades;
- animais;
- lotes;
- vacinas;
- vacinações.

Após a correção, o comportamento voltou ao normal.

---

# 110. Frontend — Vacinações

Foi criado:

```text
src/pages/Vacinacoes.jsx
```

Campos usados:

```text
animal_id
vacina_id
data_aplicacao
proxima_dose
observacao
```

A tela carrega também:
- animais;
- vacinas.

Isso permite usar `<select>` para escolher animal e vacina.

Rotas usadas:

```text
GET    /vacinacoes
POST   /vacinacoes
PUT    /vacinacoes/:id
DELETE /vacinacoes/:id
GET    /animais
GET    /vacinas
```

Funcionalidades:
- registrar vacinação;
- editar vacinação;
- excluir vacinação;
- listar histórico;
- mostrar nome do animal;
- mostrar nome da vacina;
- mostrar data da aplicação;
- mostrar próxima dose;
- mostrar observação.

Teste realizado:
- cadastro funcionando;
- edição funcionando;
- exclusão funcionando.

---

# 111. Rota de próximas vacinações disponível para o frontend

O backend já possui:

```text
GET /vacinacoes/proximas?periodo=hoje
GET /vacinacoes/proximas?periodo=semana
GET /vacinacoes/proximas?periodo=futuro
GET /vacinacoes/proximas?periodo=todos
```

No frontend, decidiu-se utilizar principalmente:

```text
/vacinacoes/proximas?periodo=semana
```

para alertas do Dashboard.

---

# 112. Dashboard funcional

Foi criado/atualizado:

```text
src/pages/Dashboard.jsx
```

O Dashboard passou a buscar em paralelo:

```text
/propriedades
/animais
/lotes
/vacinas
/despesas
/vacinacoes/proximas?periodo=semana
```

Foi usado:

```javascript
Promise.all([...])
```

Indicadores exibidos:
- quantidade de propriedades;
- quantidade de animais;
- quantidade de lotes;
- quantidade de vacinas;
- total de despesas;
- próximas vacinações da semana.

O total de despesas no frontend é calculado com:

```javascript
const totalDespesas = despesas.reduce(
    (total, despesa) => total + Number(despesa.valor),
    0
);
```

Os alertas de vacinação mostram:
- animal;
- vacina;
- próxima dose.

---

# 113. Status atual do frontend

Funcionando no navegador:

```text
Dashboard
Propriedades
Animais
Lotes
Vacinas
Vacinações
Despesas
```

Funcionalidades já testadas:
- navegação entre páginas;
- integração Axios + Express;
- leitura do PostgreSQL;
- cadastro;
- edição;
- exclusão;
- selects com dados relacionados;
- mensagens de erro/sucesso;
- alertas de vacinação;
- resumo básico no Dashboard.

---

# 114. Status atual do backend

Backend continua em:

```text
http://localhost:3000
```

Possui atualmente, conceitualmente e/ou testado durante o desenvolvimento:

```text
Propriedades → CRUD completo
Animais → CRUD completo
Lotes → CRUD completo
Animais ↔ Lotes → relação N:N
Vacinas → CRUD completo
Vacinações → CRUD completo
Alertas de vacinação → filtros por req.query
Despesas → CRUD completo
Despesas por propriedade → implementado
Resumo financeiro → implementado/testado
Filtros financeiros → implementados conceitualmente
```

Configurações adicionais concluídas:
- dotenv;
- `.env`;
- CORS;
- `.gitignore` recomendado.

---

# 115. Observação sobre o resumo financeiro

O resumo financeiro chegou a retornar corretamente HTTP 200.

Exemplo real registrado na conversa:

```json
{
  "propriedade": {
    "id": 3,
    "nome": "Fazenda do krl",
    "cidade": "bahia",
    "estado": "MG",
    "area": "1000.00"
  },
  "resumo": {
    "total": "850.00",
    "media": "850.0000000000000000",
    "maior": "850.00",
    "menor": "850.00",
    "quantidade": "1"
  },
  "categorias": [
    {
      "categoria": "Ração",
      "total": "850.00",
      "quantidade": "1",
      "media": "850.0000000000000000"
    }
  ]
}
```

Observação:
- o número excessivo de casas decimais em `AVG` é comportamento de tipo numérico do PostgreSQL;
- pode ser formatado posteriormente no backend ou no frontend;
- não foi considerado bloqueador para a finalização do projeto.

---

# 116. Tecnologias efetivamente usadas até agora

## Frontend

```text
React
Vite
Axios
React Router DOM
```

## Backend

```text
Node.js
Express
pg
cors
dotenv
```

## Banco

```text
PostgreSQL 18.4
```

## Ferramentas

```text
VS Code
Postman
psql
npm
```

---

# 117. Estado geral atual do BoviTrack

O projeto deixou de ser apenas uma API testada no Postman e já possui uma interface web funcional integrada ao PostgreSQL.

Fluxo atual:

```text
USUÁRIO
   ↓
REACT + VITE
   ↓
AXIOS
   ↓
API REST
   ↓
NODE.JS + EXPRESS
   ↓
pg
   ↓
POSTGRESQL
```

Principais módulos já utilizáveis pelo frontend:

```text
Propriedades
Animais
Lotes
Vacinas
Vacinações
Despesas
Dashboard
```

---

# 118. Próximo ponto exato para continuar

O projeto funcional principal está praticamente concluído.

A partir daqui, NÃO priorizar novas funcionalidades complexas.

Próximas etapas recomendadas:

```text
1. testar o Dashboard completamente
2. revisar visualmente todas as telas
3. criar CSS/layout profissional
4. melhorar menu/sidebar
5. melhorar cards e formulários
6. exibir mensagens de sucesso/erro de forma visual
7. revisar exclusões com chaves estrangeiras
8. testar fluxo completo do usuário
9. revisar server.js e remover código duplicado
10. garantir .env fora do Git
11. preparar README
12. preparar dados de demonstração
13. preparar apresentação/entrega
```

Se houver tempo extra, funcionalidades opcionais:

```text
- gráficos no Dashboard
- filtros visuais de despesas
- resumo financeiro dentro do frontend
- tela específica de alertas
- relação visual de animais por lote
- clima/API externa
- autenticação/login
```

Mas essas funcionalidades não devem atrasar a entrega principal.

---

# 119. Regra atual de prioridade

> A prioridade agora é entregar um BoviTrack funcional, estável, apresentável e fácil de explicar.

Evitar:
- adicionar bibliotecas sem necessidade;
- refatorações grandes antes da entrega;
- autenticação complexa se faltar tempo;
- APIs externas que não sejam essenciais;
- funcionalidades que não possam ser testadas antes da apresentação.

Priorizar:
- funcionamento;
- estabilidade;
- aparência;
- clareza;
- testes;
- documentação;
- apresentação.

---

# FIM DA ATUALIZAÇÃO — 23/08/2026 — FRONTEND FUNCIONAL

---

# ATUALIZAÇÃO DA MEMÓRIA — 23/08/2026 — AUTENTICAÇÃO, USUÁRIOS E ANIMAIS ↔ LOTES

> Esta seção registra as decisões e os prompts preparados para o Codex após a versão anterior da memória.
> Importante: diferenciar sempre **funcionalidade confirmada como implementada** de **prompt preparado, mas ainda sem confirmação de execução**.

# 120. Nova direção do sistema — autenticação e isolamento por usuário

Foi decidido implementar autenticação com dois níveis de acesso:

```text
ADMIN
→ usuário exclusivo/principal
→ pode visualizar todos os registros do sistema
→ pode administrar dados de todos os usuários

USUÁRIO COMUM
→ visualiza apenas os próprios registros
→ cadastra, edita e exclui apenas dados pertencentes à própria conta
```

Regra de segurança definida:

> O isolamento não pode existir apenas no frontend. O backend deve filtrar e validar os dados com base no usuário autenticado.

Arquitetura desejada:

```text
LOGIN
  ↓
JWT
  ↓
USUÁRIO AUTENTICADO
  ↓
┌─────────────────────────────┐
│                             │
ADMIN                       USUÁRIO
│                             │
↓                             ↓
TODOS OS DADOS          SOMENTE SEUS DADOS
│                             │
└──────────────┬──────────────┘
               ↓
             API
               ↓
          PostgreSQL
```

## Status informado pelo usuário

O usuário informou que o primeiro prompt de autenticação/permissões **fez perfeitamente o que ele queria**.

Portanto, considerar como confirmado conceitualmente que o Codex implementou o sistema solicitado de login/permissões.

Porém, como o código final produzido pelo Codex não foi anexado nesta conversa, uma próxima sessão que precise alterar essa implementação deve primeiro inspecionar os arquivos atuais do projeto em vez de assumir nomes exatos de arquivos, middlewares, rotas ou colunas.

---

# 121. Prompt usado — Login com dois níveis de permissão

## Objetivo do prompt

Implementar autenticação no BoviTrack com:

- JWT;
- bcrypt/bcryptjs;
- tabela de usuários;
- administrador com acesso global;
- usuários comuns limitados aos próprios dados;
- proteção no backend;
- adaptação do Dashboard;
- rotas protegidas no React;
- Axios enviando `Authorization: Bearer TOKEN`;
- logout;
- migração segura dos dados antigos para o administrador, se necessário.

## Regras centrais enviadas ao Codex

```text
1. ADMIN visualiza todos os dados.
2. USUÁRIO COMUM visualiza apenas os dados pertencentes à própria conta.
3. A restrição deve existir no backend.
4. Nunca confiar apenas em botões ocultos no React.
5. Nunca aceitar usuario_id livremente vindo do frontend quando ele puder ser obtido do JWT.
6. Nunca permitir criação livre de perfil admin.
7. Não apagar/recriar o banco existente.
8. Migrar registros antigos com segurança, preferencialmente atribuindo-os ao administrador inicial.
```

## Estrutura de usuário pedida

```text
id
nome
email
senha
perfil
created_at (opcional)
```

Perfis:

```text
admin
usuario
```

## Fluxo de autenticação solicitado

```text
Login
↓
email + senha
↓
backend procura usuário
↓
bcrypt compara senha
↓
credenciais corretas
↓
gera JWT
↓
frontend recebe token
↓
token é enviado nas próximas requisições
↓
backend identifica o usuário autenticado
```

Token conceitual:

```javascript
{
    id: usuario.id,
    perfil: usuario.perfil
}
```

Rotas sugeridas:

```text
POST /auth/login
POST /usuarios
GET  /auth/me
```

## Proteção das rotas existentes

Foi pedido revisar especialmente:

```text
/propriedades
/animais
/lotes
/vacinas
/vacinacoes
/despesas
/dashboard
```

Para usuário comum, as consultas devem possuir filtro por usuário ou por relacionamentos que garantam a propriedade dos dados.

Também foi solicitado proteger GET por ID, PUT e DELETE contra manipulação manual de IDs.

## Testes exigidos no prompt

```text
admin + senha correta → sucesso
usuário + senha correta → sucesso
senha errada → 401
usuário inexistente → 401
sem token → 401
token inválido → 401
```

E:

```text
ADMIN → vê registros de A e B
USUARIO_A → vê apenas registros de A
USUARIO_B → vê apenas registros de B
```

Além de tentativas de GET/PUT/DELETE cruzadas entre usuários.

## Resultado conhecido

Status: **CONFIRMADO PELO USUÁRIO COMO IMPLEMENTADO SATISFATORIAMENTE PELO CODEX.**

---

# 122. Prompt preparado — Administrador criar novos usuários comuns

Depois do login com níveis de permissão, foi preparado um segundo prompt para criar uma área administrativa de usuários.

## Objetivo

Adicionar uma página:

```text
Usuários
```

visível somente para o administrador.

O administrador poderá principalmente:

- listar usuários;
- criar usuários comuns;
- editar nome/email;
- opcionalmente redefinir senha;
- desativar usuários de forma segura.

## Regra central

Todo usuário criado nessa área deve receber automaticamente:

```text
perfil = usuario
```

Nunca permitir que o frontend ou uma requisição manual crie outro administrador por essa rota.

## Rotas sugeridas

```text
GET  /usuarios
POST /usuarios
GET  /usuarios/:id
PUT  /usuarios/:id
```

Opcional:

```text
PUT /usuarios/:id/senha
```

## Exclusão/desativação

Foi recomendado preferir:

```text
ativo = true/false
```

em vez de excluir fisicamente usuários que já possuam propriedades, animais, despesas e outros registros associados.

Exemplo de alteração possível:

```sql
ALTER TABLE usuarios
ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;
```

Somente executar se a coluna ainda não existir e se fizer sentido na implementação atual.

Usuário desativado:

```text
→ não consegue login
→ mantém seus dados no banco
→ administrador continua podendo visualizar os dados
```

## Proteção do administrador principal

Foi pedido impedir:

- autoexclusão acidental do admin;
- autodesativação do único admin;
- alteração do admin principal para perfil `usuario`.

## Frontend solicitado

Página conceitual:

```text
Usuários
────────────────────────────

[ + Novo usuário ]

Nome          Email               Perfil
João Silva    joao@email.com      Usuário
Maria Souza   maria@email.com     Usuário
```

Formulário:

```text
Nome
Email
Senha
Confirmar senha
```

Sem seletor de perfil.

## Segurança

Usuário comum tentando:

```text
GET /usuarios
POST /usuarios
PUT /usuarios/:id
DELETE /usuarios/:id
```

deve receber bloqueio, preferencialmente `403 Forbidden`.

## Status

Status: **PROMPT PREPARADO. NÃO HÁ CONFIRMAÇÃO NESTA CONVERSA DE QUE O CODEX JÁ CONCLUIU ESSA IMPLEMENTAÇÃO.**

---

# 123. Mudança de requisito — cadastro público de produtores

Depois foi decidido que o BoviTrack será um **site público**, de fácil acesso para produtores rurais comuns.

Por isso, não depender apenas do administrador para criar contas.

Novo requisito:

```text
PÁGINA PÚBLICA
      ↓
    LOGIN
      ↓
┌───────────────────────┐
│ Entrar                │
│ Criar uma conta       │
└───────────────────────┘
```

O visitante deve conseguir criar sua própria conta.

---

# 124. Prompt preparado — Cadastro público na tela de login

## Objetivo

Permitir que qualquer produtor crie conta no BoviTrack sem precisar pedir ao administrador.

Fluxo desejado:

```text
PRODUTOR
   ↓
ACESSA BOVITRACK
   ↓
LOGIN
   ↓
Não possui conta?
   ↓
CRIAR CONTA
   ↓
Nome
Email
Senha
Confirmar senha
   ↓
CADASTRAR
   ↓
BACKEND
   ↓
VALIDAÇÃO
   ↓
BCRYPT
   ↓
perfil = usuario
   ↓
POSTGRESQL
   ↓
CONTA CRIADA
   ↓
LOGIN
   ↓
DASHBOARD
```

## Rotas públicas desejadas no React

```text
/login
/cadastro
```

Páginas internas continuam protegidas.

## Rota pública de API sugerida

```text
POST /auth/cadastro
```

ou:

```text
POST /auth/register
```

A escolha deve seguir o padrão já adotado no projeto.

## Campos mínimos

```text
nome
email
senha
confirmar senha
```

O cadastro deve permanecer simples.

Não tornar obrigatório neste momento:

- CPF;
- CNPJ;
- telefone;
- endereço;
- outros dados burocráticos.

## Segurança mais importante

O cadastro público **NUNCA** pode criar administrador.

O backend deve definir diretamente:

```javascript
const perfil = "usuario";
```

Não usar o valor de perfil vindo de `req.body` para decidir permissão.

Tentativa:

```json
{
    "nome": "Admin Fake",
    "email": "fake@email.com",
    "senha": "12345678",
    "perfil": "admin"
}
```

Resultado obrigatório:

```text
NÃO criar admin
```

## Email e senha

- email deve ser único;
- email duplicado → erro apropriado, preferencialmente 409;
- senha deve continuar armazenada com bcrypt;
- nunca retornar senha/hash.

## Pós-cadastro

Preferência definida:

```text
Conta criada com sucesso
↓
redirecionar para /login
↓
usuário entra normalmente
```

## Primeiro acesso

Conta recém-criada deve funcionar normalmente com:

```text
0 propriedades
0 animais
0 lotes
0 vacinações
0 despesas
```

Dashboard não pode quebrar com listas vazias.

## Associação automática ao usuário

Quando o usuário cadastrar uma propriedade, o backend deve usar o usuário do JWT.

Conceitualmente:

```javascript
const usuarioId = req.usuario.id;
```

Não permitir que o frontend escolha livremente `usuario_id`.

## Dois fluxos de criação de usuário

Se a área administrativa também existir, passam a existir:

```text
FLUXO PÚBLICO
Visitante → Criar conta → usuario
```

E:

```text
FLUXO ADMIN
Administrador → Usuários → Criar usuário → usuario
```

Ambos criam somente perfil comum.

## Status

Status: **PROMPT PREPARADO. NÃO HÁ CONFIRMAÇÃO NESTA CONVERSA DE QUE O CODEX JÁ CONCLUIU ESSA IMPLEMENTAÇÃO.**

---

# 125. Verificação da funcionalidade Animais ↔ Lotes

Foi observado pelo usuário que a parte de vincular animais a lotes aparentemente ainda não estava disponível de forma utilizável.

A memória antiga já continha a modelagem conceitual N:N:

```text
ANIMAL N:N LOTE
```

por meio de:

```text
animais_lotes
```

Também já haviam sido planejadas/registradas rotas conceituais para:

```text
POST   /lotes/:id/animais
GET    /lotes/:id/animais
DELETE /lotes/:id/animais/:animal_id
GET    /animais/:id/lotes
```

Porém, não havia confirmação de que a funcionalidade estava integrada e utilizável no frontend atual.

---

# 126. Prompt preparado — Vincular animais aos lotes

## Objetivo

Concluir a funcionalidade visual e de backend para:

- abrir um lote;
- visualizar seus animais;
- adicionar animais ao lote;
- remover animais do lote;
- manter o animal cadastrado ao remover apenas a associação;
- respeitar propriedade e usuário.

## Regra do relacionamento

Manter relacionamento N:N usando tabela intermediária.

Estrutura esperada conceitualmente:

```sql
CREATE TABLE animais_lotes (
    animal_id INTEGER NOT NULL,
    lote_id INTEGER NOT NULL,

    PRIMARY KEY (animal_id, lote_id),

    FOREIGN KEY (animal_id)
        REFERENCES animais(id),

    FOREIGN KEY (lote_id)
        REFERENCES lotes(id)
);
```

Antes de executar qualquer SQL, o Codex deve verificar se a tabela já existe.

Nunca recriar ou apagar associações existentes desnecessariamente.

## Regra de propriedade

Animal só pode entrar em lote da mesma propriedade:

```text
animal.propriedade_id
=
lote.propriedade_id
```

Exemplo permitido:

```text
Animal Mimosa → propriedade 3
Lote Bezerros → propriedade 3
→ permitido
```

Exemplo proibido:

```text
Animal Mimosa → propriedade 3
Lote B → propriedade 8
→ bloqueado
```

Essa validação precisa existir no backend.

## Regra de usuários

Considerando o novo sistema de autenticação:

```text
ADMIN
→ pode administrar dados globalmente

USUÁRIO COMUM
→ somente animais e lotes dentro dos próprios dados
```

Manipular IDs manualmente não pode permitir cruzar usuários.

## Rotas a procurar/revisar

```text
POST   /lotes/:id/animais
GET    /lotes/:id/animais
DELETE /lotes/:id/animais/:animal_id
GET    /animais/:id/lotes
```

Se já existirem, adaptar em vez de duplicar.

## Validações para adicionar animal ao lote

Antes do INSERT:

```text
1. usuário autenticado
2. lote existe
3. usuário possui acesso ao lote
4. animal existe
5. usuário possui acesso ao animal
6. animal e lote pertencem à mesma propriedade
7. associação ainda não existe
```

## Duplicação

Não permitir a mesma combinação:

```text
animal_id + lote_id
```

mais de uma vez.

Mensagem amigável desejada:

```text
Este animal já pertence a este lote
```

## Remoção

Ao executar:

```text
DELETE /lotes/:id/animais/:animal_id
```

deve remover apenas a linha de `animais_lotes`.

Não apagar animal.

Não apagar lote.

## Frontend desejado

Na tela de lotes, adicionar ação semelhante a:

```text
Gerenciar animais
```

Interface conceitual:

```text
Lote: Bezerros
Propriedade: Fazenda Boa Vista

ANIMAIS DO LOTE

Mimosa
Nelore • F • 420 kg
[ Remover ]

Estrela
Nelore • F • 390 kg
[ Remover ]

────────────────────────

ADICIONAR ANIMAL

[Selecione um animal ▼]

[ Adicionar ao lote ]
```

## Select de animais

O produtor não deve digitar `animal_id` manualmente.

Usar seleção pelo nome.

Preferencialmente mostrar apenas:

- animais da mesma propriedade do lote;
- animais ainda não associados ao lote.

## Contagem opcional

Se simples, mostrar:

```text
Animais: 3
```

na listagem de lotes.

## Bug antigo a evitar

Já existiu um bug em que, após DELETE, os campos do frontend deixavam de aceitar digitação.

Manter:

```jsx
<button type="button">
```

para botões que não devem submeter formulários.

Evitar `window.location.reload()`.

## Exclusões e FKs

Revisar o que ocorre quando:

- um lote com relações é excluído;
- um animal com relações é excluído.

Não deixar erros inesperados de chave estrangeira.

Não alterar `ON DELETE` cegamente; analisar o banco atual primeiro.

## Testes exigidos

```text
1. adicionar Mimosa ao lote Bezerros
2. confirmar sucesso
3. listar animais de Bezerros
4. confirmar Mimosa na lista
5. tentar adicionar Mimosa novamente
6. confirmar bloqueio de duplicação
7. adicionar Estrela
8. confirmar dois animais no lote
9. remover Mimosa
10. confirmar que Mimosa continua existindo em Animais
11. confirmar que somente a relação foi removida
```

Também testar propriedades diferentes e usuários diferentes.

## Status

Status: **PROMPT PREPARADO. NÃO HÁ CONFIRMAÇÃO NESTA CONVERSA DE QUE O CODEX JÁ CONCLUIU ESSA IMPLEMENTAÇÃO.**

---

# 127. Estado atualizado das decisões de autenticação

## Confirmado por relato do usuário

```text
Sistema de login com dois níveis de permissão
→ Codex executou o primeiro prompt satisfatoriamente
```

Regra esperada como implementada:

```text
ADMIN → acesso global
USUÁRIO → somente próprios dados
```

## Preparado, mas sem confirmação de conclusão

```text
1. área administrativa para criar usuários comuns
2. cadastro público de produtores em /cadastro ou equivalente
3. gerenciamento visual de animais dentro dos lotes
```

Uma próxima conversa deve confirmar no código quais desses itens já foram efetivamente executados pelo Codex antes de continuar.

---

# 128. Próximo procedimento recomendado ao retomar o projeto

Antes de novas alterações:

```text
1. abrir o projeto atual produzido após os prompts do Codex
2. localizar implementação de autenticação
3. conferir tabela usuarios
4. conferir colunas/relacionamentos de usuario_id
5. conferir middleware JWT
6. conferir middleware de admin
7. conferir tela de login
8. verificar se /cadastro já existe
9. verificar se área /usuarios já existe
10. verificar se animais_lotes está presente no PostgreSQL
11. verificar se as rotas animais ↔ lotes estão no backend
12. verificar se a tela Lotes possui gerenciamento de animais
```

Não assumir que um prompt foi executado apenas porque ele existe nesta memória.

---

# 129. Regra de continuidade para futuras sessões

> Sempre distinguir **planejado**, **pedido ao Codex** e **confirmado funcionando**.

Se o usuário trouxer o código atualizado ou um novo arquivo de memória após o Codex executar os prompts, atualizar esta seção com:

- arquivos criados;
- arquivos alterados;
- SQL executado;
- novas dependências;
- rotas criadas;
- middlewares;
- estrutura atual da tabela `usuarios`;
- funcionamento do cadastro público;
- funcionamento da área administrativa;
- funcionamento real de `animais_lotes` no frontend;
- testes realizados e seus resultados.

---

# FIM DA ATUALIZAÇÃO — 23/08/2026 — PROMPTS CODEX E NOVOS REQUISITOS
