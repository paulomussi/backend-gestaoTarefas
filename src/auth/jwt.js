//(opcional - gerar token)
const jwt = require("jsonwebtoken");

const SECRET = "SEGREDO_SUPER_SECRETO";

function gerarToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

function verificarToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = {
  gerarToken,
  verificarToken,
};
