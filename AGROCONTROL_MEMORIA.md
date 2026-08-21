# MEMÓRIA DO PROJETO — AGROCONTROL

> Arquivo de referência do sistema AgroControl.
> Contém decisões de projeto, arquitetura, banco de dados, códigos, rotas, validações, conceitos aprendidos e status atual do desenvolvimento.

---

# 1. Visão geral do projeto

## Nome
**AgroControl**

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
O AgroControl não deve ser apenas um CRUD simples. O objetivo é transformá-lo em um sistema de gestão rural que:
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
    res.send("ola agrocontrol!");
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
Projeto: AgroControl
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
    res.send("ola agrocontrol!");
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

# FIM DA MEMÓRIA ATUAL DO AGROCONTROL
