# 🔐 Middleware de Autenticação JWT - Documentação

## Resumo

Middleware seguro e pronto para produção que implementa autenticação JWT em uma API Node.js/Express.

---

## ✅ Requisitos Atendidos

### Obrigatórios

- ✅ Usa biblioteca `jsonwebtoken`
- ✅ Lê token do header `Authorization: Bearer TOKEN`
- ✅ Valida com `JWT_SECRET` de variável de ambiente
- ✅ Tratamento de erros com status codes corretos:
  - 401: Token ausente ou expirado
  - 403: Token inválido ou sem permissão
- ✅ Try/catch para evitar quebra da aplicação
- ✅ Extrai dados em `req.usuario`
- ✅ Não expõe informações sensíveis
- ✅ Código limpo e bem organizado

### Segurança

- ✅ Valida formato "Bearer "
- ✅ Rejeita tokens malformados
- ✅ Usa algoritmo HS256 (seguro)
- ✅ Pronto para produção

### Extras

- ✅ Função reutilizável (module.exports)
- ✅ Comentários em cada seção
- ✅ Exemplo de uso em rotas protegidas
- ✅ Suporte a roles/permissões

---

## 📦 Instalação

### 1. Verificar dependências no `package.json`

```bash
npm install jsonwebtoken
```

### 2. Configurar variáveis de ambiente

Criar arquivo `.env` na raiz do projeto:

```env
JWT_SECRET=sua_chave_secreta_super_segura_min_32_caracteres
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANTE:** A `JWT_SECRET` deve ter:

- Mínimo 32 caracteres em produção
- Ser única e aleatória
- Nunca ser compartilhada

Exemplo de gerador seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Como Usar

### Opção 1: Autenticação Básica

```javascript
const { autenticarJWT } = require("./src/auth/authMiddleware");

// Proteger uma rota
router.get("/dashboard", autenticarJWT, (req, res) => {
  console.log(req.usuario); // { id, email, role, iat, exp }
  res.json({ mensagem: "Dados protegidos", usuario: req.usuario });
});
```

### Opção 2: Autenticação com Role/Permissão

```javascript
const { autenticarComRole } = require("./src/auth/authMiddleware");

// Apenas admins podem acessar
router.get("/admin", autenticarComRole(["admin"]), (req, res) => {
  res.json({ mensagem: "Área administrativa" });
});

// Múltiplos roles
router.get(
  "/usuarios",
  autenticarComRole(["admin", "gerenciador"]),
  (req, res) => {
    res.json({ mensagem: "Lista de usuários" });
  },
);
```

### Opção 3: Sem Autenticação (Rotas Públicas)

```javascript
router.post("/login", (req, res) => {
  // Lógica de autenticação
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d", algorithm: "HS256" },
  );
  res.json({ token });
});
```

---

## 📋 Estrutura do Token

O middleware espera um token JWT com esta estrutura:

```json
{
  "id": 1,
  "email": "usuario@email.com",
  "role": "usuario",
  "iat": 1640000000,
  "exp": 1640086400
}
```

**Campos obrigatórios:**

- `id`: Identificador do usuário
- `email`: Email do usuário

**Campos opcionais:**

- `role`: Função/permissão do usuário
- `iat`: Timestamp de emissão (automático)
- `exp`: Timestamp de expiração (automático)

---

## 🧪 Testando com Postman

### 1. Obter Token (Login)

```
POST http://localhost:3000/api/login
Content-Type: application/json

Response:
{
  "mensagem": "Login bem-sucedido",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Acessar Rota Protegida

```
GET http://localhost:3000/api/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "mensagem": "Bem-vindo ao dashboard",
  "usuarioId": 1,
  "email": "usuario@email.com"
}
```

### 3. Token Expirado

```
GET http://localhost:3000/api/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (token vencido)

Response: 401
{
  "erro": "Token expirado",
  "mensagem": "Faça login novamente para gerar um novo token"
}
```

### 4. Sem Token

```
GET http://localhost:3000/api/dashboard

Response: 401
{
  "erro": "Token não fornecido",
  "mensagem": "Header Authorization é obrigatório"
}
```

### 5. Token Inválido

```
GET http://localhost:3000/api/dashboard
Authorization: Bearer tokeninvalido123xyz

Response: 403
{
  "erro": "Token inválido",
  "mensagem": "Token não pôde ser verificado"
}
```

### 6. Sem Permissão (Role Inválido)

```
GET http://localhost:3000/api/admin
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (usuário comum)

Response: 403
{
  "erro": "Acesso proibido",
  "mensagem": "Seu perfil não tem permissão para acessar este recurso"
}
```

---

## 🔒 Status Codes de Resposta

| Status | Erro                | Significado                             |
| ------ | ------------------- | --------------------------------------- |
| 200    | -                   | Sucesso                                 |
| 401    | Token não fornecido | Header Authorization ausente            |
| 401    | Formato inválido    | Não começa com "Bearer "                |
| 401    | Token vazio         | Token após "Bearer " está vazio         |
| 401    | Token expirado      | Token passou da data de expiração       |
| 403    | Token inválido      | Token malformado ou assinatura inválida |
| 403    | Acesso proibido     | Role do usuário não permitido           |
| 500    | Erro interno        | JWT_SECRET não configurado              |

---

## 📝 Exemplo Completo de Integração

```javascript
// index.js
const express = require("express");
const dotenv = require("dotenv");
const {
  autenticarJWT,
  autenticarComRole,
} = require("./src/auth/authMiddleware");

dotenv.config();
const app = express();

app.use(express.json());

// Rota pública
app.post("/login", (req, res) => {
  const token = require("jsonwebtoken").sign(
    { id: 1, email: "user@email.com", role: "usuario" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({ token });
});

// Rota protegida
app.get("/dashboard", autenticarJWT, (req, res) => {
  res.json({ mensagem: "Dashboard", usuario: req.usuario });
});

// Rota protegida com role
app.get("/admin", autenticarComRole(["admin"]), (req, res) => {
  res.json({ mensagem: "Painel administrativo" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor em porta ${PORT}`));
```

---

## 🛡️ Boas Práticas de Segurança

1. **Armazenar JWT_SECRET em .env** (nunca no código)
2. **Usar HTTPS em produção** (não HTTP)
3. **Definir tempo de expiração curto** (15-30 min para tokens de acesso)
4. **Usar Refresh Tokens** para renovar sessão sem novo login
5. **Validar sempre o token** mesmo em rotas aparentemente públicas
6. **Não expor detalhes de erro** em produção
7. **Usar algoritmo HS256 ou melhor** (RS256 para sistemas distribuídos)
8. **Renovar JWT_SECRET periodicamente** em produção
9. **Logar tentativas de autenticação falhadas** para detecção de ataques
10. **Usar CORS apropriadamente** para limitar origem das requisições

---

## ⚙️ Configuração Avançada

### Definir tempo de expiração customizado

```javascript
jwt.sign(usuarioData, process.env.JWT_SECRET, {
  expiresIn: "1h", // 1 hora
  algorithm: "HS256",
});

// Opções: '7d', '24h', '30d', '365d', 3600 (em segundos), etc
```

### Usar claims customizadas

```javascript
const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: ["read", "write"], // Permissões específicas
    departamento: "TI", // Informação adicional
  },
  process.env.JWT_SECRET,
);
```

### Adicionar informações no req.usuario

As informações do token são automaticamente adicionadas em `req.usuario`, permitindo acessá-las:

```javascript
router.get("/info", autenticarJWT, (req, res) => {
  console.log(req.usuario.id);
  console.log(req.usuario.email);
  console.log(req.usuario.role);
  console.log(req.usuario.permissions);
});
```

---

## 🐛 Troubleshooting

### Erro: "JWT_SECRET não configurado"

**Solução:** Criar arquivo `.env` com `JWT_SECRET=...`

### Erro: "Token inválido"

**Possíveis causas:**

- Token foi modificado
- JWT_SECRET diferente da que gerou o token
- Token corrompido

### Erro: "Token expirado"

**Solução:** Fazer novo login para obter novo token com expiração futura

### Middleware não funciona nas rotas

**Verificar:**

- Middleware está importado corretamente
- Middleware está aplicado ANTES do controlador
- Header Authorization está sendo enviado

---

## 📚 Referências

- [jsonwebtoken - npm](https://www.npmjs.com/package/jsonwebtoken)
- [JWT.io - Debugger](https://jwt.io)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [OWASP - JWT](https://owasp.org/www-community/attacks/jwt)
