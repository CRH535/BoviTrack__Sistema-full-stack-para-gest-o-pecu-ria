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
