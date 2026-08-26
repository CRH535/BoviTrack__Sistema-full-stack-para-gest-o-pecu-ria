# Deploy do BoviTrack na Vercel

O repositório deve ser importado duas vezes na Vercel: uma como projeto do
backend e outra como projeto do frontend. Os dois projetos usam o mesmo
repositório GitHub, mas possuem diretórios raiz e variáveis diferentes.

## 1. Antes de começar

Envie as alterações para o GitHub. Os arquivos `backend/.env` e `frontend/.env`
são locais, estão ignorados pelo Git e não serão enviados à Vercel.

Não coloque no frontend `DATABASE_URL`, `JWT_SECRET`, senha do PostgreSQL ou
qualquer chave privada. A única variável do frontend é `VITE_API_URL`.

## 2. Publicar o backend primeiro

1. Na Vercel, selecione **Add New > Project** e importe o repositório.
2. Use um nome como `bovitrack-api`.
3. Em **Root Directory**, selecione `backend`.
4. Mantenha a detecção automática do Express.
5. Não configure Output Directory.
6. Antes do primeiro deploy, cadastre em **Environment Variables**:

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
COOKIE_SAME_SITE
COOKIE_SECURE
APP_TIMEZONE
DB_POOL_MAX
DB_CONNECTION_TIMEOUT_MS
```

Valores não secretos recomendados:

```env
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
APP_TIMEZONE=America/Sao_Paulo
DB_POOL_MAX=2
DB_CONNECTION_TIMEOUT_MS=10000
```

Use em `DATABASE_URL` a conexão PostgreSQL fornecida pelo Supabase. Para uma
função serverless, prefira o Transaction pooler indicado no painel do Supabase.
Se a URL já contiver `sslmode`, não cadastre `DB_SSL`. Se não contiver, cadastre
também `DB_SSL=require`.

`JWT_SECRET` deve ser uma chave longa, aleatória e permanente. Não gere uma nova
chave a cada deploy.

7. Faça o deploy e copie a URL final, por exemplo:

```text
https://bovitrack-api.vercel.app
```

8. Abra essa URL. A resposta esperada na raiz é `ola bovitrack!`.

## 3. Publicar o frontend

1. Importe o mesmo repositório novamente como outro projeto.
2. Use um nome como `bovitrack`.
3. Em **Root Directory**, selecione `frontend`.
4. Selecione o framework **Vite**.
5. Confirme:

```text
Build Command: npm run build
Output Directory: dist
```

6. Cadastre a variável:

```env
VITE_API_URL=https://URL-REAL-DO-BACKEND.vercel.app
```

7. Faça o deploy e copie a URL final do frontend.

## 4. Autorizar o frontend no backend

Volte ao projeto do backend e cadastre:

```env
FRONTEND_URL=https://URL-REAL-DO-FRONTEND.vercel.app
```

Use a origem sem caminho, por exemplo `https://bovitrack.vercel.app`, e faça um
novo deploy do backend para aplicar a variável.

Se precisar autorizar mais de uma origem fixa, separe-as por vírgula:

```env
FRONTEND_URL=https://bovitrack.vercel.app,https://preview-autorizado.vercel.app
```

## 5. Escopos das variáveis

Para o primeiro deploy, configure as URLs e segredos em **Production**. Só copie
para **Preview** quando também autorizar a URL exata do preview no CORS. Não use
curingas amplos para aceitar qualquer domínio Vercel.

O `frontend/.env` e o `backend/.env` continuam sendo usados apenas localmente.
Alterar esses arquivos não atualiza a Vercel; mudanças de produção devem ser
feitas em **Project > Settings > Environment Variables**, seguidas de redeploy.

## 6. Conferência após o deploy

1. Abra o frontend em uma janela anônima.
2. Crie uma conta ou faça login.
3. Atualize uma rota interna para validar o React Router.
4. Teste Dashboard, propriedades, animais, lotes, vacinações e despesas.
5. Aguarde ou force uma renovação de sessão para validar o refresh cookie.
6. No navegador, confira se as chamadas vão para a URL do backend e não para
   `localhost:3000`.
7. Se houver erro de CORS, confirme que `FRONTEND_URL` corresponde exatamente à
   origem mostrada no navegador e faça redeploy do backend.

## Referências oficiais

- [Express na Vercel](https://vercel.com/docs/frameworks/backend/express)
- [Fallback de rotas para SPA](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404)
