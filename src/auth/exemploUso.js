/**
 * EXEMPLO DE USO DO MIDDLEWARE JWT
 * Este arquivo mostra como usar o middleware em rotas protegidas
 */

const express = require("express");
const { autenticarJWT, autenticarComRole } = require("./authMiddleware");

const router = express.Router();

// ============================================
// EXEMPLO 1: Rota protegida básica
// ============================================
router.get("/dashboard", autenticarJWT, (req, res) => {
  // req.usuario contém os dados do token decodificado
  // Ex: { id: 1, email: 'user@email.com', role: 'usuario' }

  return res.status(200).json({
    mensagem: "Bem-vindo ao dashboard",
    usuarioId: req.usuario.id,
    email: req.usuario.email,
  });
});

// ============================================
// EXEMPLO 2: Rota protegida com validação de role
// ============================================
router.get("/admin", autenticarComRole(["admin"]), (req, res) => {
  return res.status(200).json({
    mensagem: "Área administrativa",
    usuario: req.usuario,
  });
});

// ============================================
// EXEMPLO 3: Rota que permite múltiplas roles
// ============================================
router.get(
  "/usuarios",
  autenticarComRole(["admin", "gerenciador"]),
  (req, res) => {
    return res.status(200).json({
      mensagem: "Lista de usuários",
      usuarioAutenticado: req.usuario.email,
    });
  },
);

// ============================================
// EXEMPLO 4: Rota pública (SEM autenticação)
// ============================================
router.post("/login", (req, res) => {
  // Lógica de login que gera o token JWT
  const token = require("jsonwebtoken").sign(
    {
      id: 1,
      email: "usuario@email.com",
      role: "usuario",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d", algorithm: "HS256" },
  );

  return res.status(200).json({
    mensagem: "Login bem-sucedido",
    token: token,
  });
});

// ============================================
// EXEMPLO 5: Rota para perfil do usuário
// ============================================
router.get("/perfil", autenticarJWT, (req, res) => {
  // Aqui você pode buscar dados adicionais do banco de dados
  // usando o req.usuario.id

  return res.status(200).json({
    id: req.usuario.id,
    email: req.usuario.email,
    role: req.usuario.role,
    dataCriacao: req.usuario.iat * 1000, // Converter timestamp para ms
    dataExpiracao: req.usuario.exp * 1000, // Converter timestamp para ms
  });
});

module.exports = router;

// ============================================
// COMO TESTAR NO POSTMAN OU SIMILAR
// ============================================

/*
1. OBTER TOKEN (POST /login)
   - Body: vazio ou { email: "...", senha: "..." }
   - Resposta: { token: "eyJhbGc..." }

2. USAR O TOKEN (GET /dashboard)
   - Header: Authorization: Bearer eyJhbGc...
   - Resposta: { mensagem: "Bem-vindo ao dashboard", usuarioId: 1, ... }

3. TOKEN EXPIRADO
   - Usar um token com expiração passada
   - Resposta: 401 { erro: "Token expirado", mensagem: "Faça login novamente..." }

4. TOKEN INVÁLIDO
   - Header: Authorization: Bearer tokeninvalido123
   - Resposta: 403 { erro: "Token inválido", mensagem: "Token não pôde ser verificado" }

5. SEM TOKEN
   - Requisição sem header Authorization
   - Resposta: 401 { erro: "Token não fornecido", mensagem: "Header Authorization é obrigatório" }

6. FORMATO INCORRETO
   - Header: Authorization: eyJhbGc... (sem "Bearer ")
   - Resposta: 401 { erro: "Formato de token inválido", mensagem: "Formato esperado: Bearer TOKEN" }
*/

// ============================================
// CONFIGURAÇÃO NO index.js
// ============================================

/*
const express = require('express');
const dotenv = require('dotenv');

dotenv.config(); // Carrega variáveis de .env

const app = express();
app.use(express.json());

const rotasExemplo = require('./src/auth/exemploUso');
app.use('/api', rotasExemplo);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em porta ${PORT}`);
});

// ============================================
// ARQUIVO .env (NECESSÁRIO)
// ============================================

// JWT_SECRET=sua_chave_secreta_muito_segura_aqui_12345
// PORT=3000
// NODE_ENV=development
*/
