# Guia de Hospedagem do Backend (Render.com)

Como o Netlify suporta apenas sites estáticos, você precisa de outro serviço para rodar o seu `server.js`. Recomendamos o **Render.com** por ser gratuito e fácil de usar.

## Passos para o Render:

1.  Crie uma conta em [render.com](https://render.com/).
2.  Clique em **"New +"** e selecione **"Web Service"**.
3.  Conecte o seu repositório GitHub `magias-e-feiti-os`.
4.  Configure os detalhes:
    *   **Name**: `cozinha-magica-api`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Importante (SQLite)**: Para que as pontuações e usuários não sumam, vá em **"Disk"** no painel do Render e adicione um disco persistente (ou mude para um banco de dados na nuvem como MongoDB/Supabase no futuro).

## Após o Deploy:

1.  O Render te dará uma URL (ex: `https://cozinha-magica-api.onrender.com`).
2.  Abra o arquivo `game.js` no seu VS Code.
3.  Procure pela linha que diz `'Sua_URL_do_Backend_Aqui'`.
4.  Substitua pelo link que o Render te deu.
5.  Salve e envie para o GitHub (`git add .`, `git commit ...`, `git push`).

Pronto! O Netlify atualizará o jogo automaticamente e ele passará a usar o novo servidor.
