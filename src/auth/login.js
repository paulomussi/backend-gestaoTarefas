const db = require('../database/connection');
const bcrypt = require('bcrypt');

async function login(req, res) {
  try {
    const { login, senha } = req.body;

    const sql = `SELECT * FROM USUARIOS WHERE usu_login = ?`;
    const [rows] = await db.query(sql, [login]);

    if (rows.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não encontrado"
      });
    }

    const usuario = rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.usu_senha);

    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Senha inválida"
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Login realizado com sucesso",
      dados: {
        id: usuario.usu_id,
        login: usuario.usu_login
      }
    });

  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro no login",
      dados: error.message
    });
  }
}

module.exports = { login };