const jwt = require("jsonwebtoken");

/**
 * Middleware de autenticação JWT
 *
 * Valida o token JWT extraído do header Authorization
 * Se válido, adiciona os dados do usuário em req.usuario
 * Se inválido ou ausente, retorna erro apropriado
 *
 * @param {Object} req - Objeto da requisição Express
 * @param {Object} res - Objeto da resposta Express
 * @param {Function} next - Função para passar para o próximo middleware
 *
 * @returns {void} Chama next() se autenticado, ou envia erro se não
 */
function autenticarJWT(req, res, next) {
  try {
    // Extrair o header Authorization
    const authHeader = req.headers["authorization"];

    // Verificar se o header existe
    if (!authHeader) {
      return res.status(401).json({
        erro: "Token não fornecido",
        mensagem: "Header Authorization é obrigatório",
      });
    }

    // Validar formato "Bearer TOKEN"
    const partes = authHeader.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
      return res.status(401).json({
        erro: "Formato de token inválido",
        mensagem: "Formato esperado: Bearer TOKEN",
      });
    }

    const token = partes[1];

    // Validar se o token está vazio
    if (!token || token.trim() === "") {
      return res.status(401).json({
        erro: "Token vazio",
        mensagem: "Token não pode estar vazio",
      });
    }

    // Obter a SECRET do arquivo .env
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "ERRO: JWT_SECRET não configurado em variáveis de ambiente",
      );
      return res.status(500).json({
        erro: "Erro interno do servidor",
        mensagem: "Configuração de autenticação incompleta",
      });
    }

    // Verificar e decodificar o token
    const usuarioData = jwt.verify(token, secret, {
      algorithms: ["HS256"], // Aceita apenas algoritmos seguros
    });

    // Adicionar os dados do usuário na requisição para uso nas rotas
    req.usuario = usuarioData;

    // Chamar o próximo middleware
    next();
  } catch (erro) {
    // Tratamento de erros específicos de JWT

    if (erro.name === "TokenExpiredError") {
      // Token expirado
      return res.status(401).json({
        erro: "Token expirado",
        mensagem: "Faça login novamente para gerar um novo token",
      });
    }

    if (erro.name === "JsonWebTokenError") {
      // Token inválido ou malformado
      return res.status(403).json({
        erro: "Token inválido",
        mensagem: "Token não pôde ser verificado",
      });
    }

    if (erro.name === "NotBeforeError") {
      // Token ainda não é válido
      return res.status(403).json({
        erro: "Token não é válido ainda",
        mensagem: "Aguarde o tempo de ativação do token",
      });
    }

    // Erro genérico desconhecido
    console.error("Erro na autenticação:", erro.message);
    return res.status(403).json({
      erro: "Erro na autenticação",
      mensagem: "Não foi possível autenticar a requisição",
    });
  }
}

/**
 * Middleware alternativo com roles/permissões
 * Permite validar também se o usuário tem uma função específica
 *
 * @param {Array<string>} rolesPermitidas - Array de roles que podem acessar
 * @returns {Function} Middleware que valida JWT e role
 *
 * @example
 * router.get('/admin', autenticarComRole(['admin']), controlador.dashboard);
 */
function autenticarComRole(rolesPermitidas = []) {
  return (req, res, next) => {
    try {
      // Primeiro, autenticar o JWT
      autenticarJWT(req, res, () => {
        // Se chegou aqui, o JWT é válido

        // Verificar se o usuário tem um role
        if (!req.usuario.role) {
          return res.status(403).json({
            erro: "Permissão negada",
            mensagem: "Usuário não possui role definido",
          });
        }

        // Verificar se o role do usuário está na lista de roles permitidas
        if (!rolesPermitidas.includes(req.usuario.role)) {
          return res.status(403).json({
            erro: "Acesso proibido",
            mensagem: "Seu perfil não tem permissão para acessar este recurso",
          });
        }

        // Se chegou aqui, usuário autenticado e autorizado
        next();
      });
    } catch (erro) {
      return res.status(403).json({
        erro: "Erro na autorização",
        mensagem: "Não foi possível verificar permissões",
      });
    }
  };
}

// Exportar como módulos CommonJS
module.exports = {
  autenticarJWT,
  autenticarComRole,
};
