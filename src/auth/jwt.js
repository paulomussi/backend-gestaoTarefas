//(opcional - gerar token)
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

function gerarToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "1d" });
}

function verificarToken(token) {
  return jwt.verify(token, secret);
}

module.exports = {
  gerarToken,
  verificarToken,
};
