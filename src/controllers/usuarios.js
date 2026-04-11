const db = require("../dataBase/connection.js");
const bcrypt = require("bcrypt");
module.exports = {
  async listarUsuarios(request, response) {
    try {
      const sql = `SELECT 
                usu_id,
                usu_func_id,
                usu_login,
                usu_senha, 
                usu_ativo = 1 AS usu_ativo
            FROM USUARIOS
            WHERE usu_ativo = 1;`;

      const [usuarios] = await db.query(sql);

      return response.status(200).json({
        sucesso: true,
        mensagem: "Listagem de Usuários realizada",
        items: usuarios.length,
        dados: usuarios,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro ao listar Usuários ${error.mensage}`,
        dados: null,
      });
    }
  },

  async cadastrarUsuarios(request, response) {
    try {
      const { funcionario, login, senha, ativo } = request.body;

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(senha, saltRounds);

      const sql = `INSERT INTO USUARIOS 
                (usu_func_id,
                 usu_login, 
                 usu_senha,
                 usu_ativo) 
            VALUES 
                (?, ?, ?, ? )`;

      const values = [funcionario, login, hashedPassword, ativo];

      const [result] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: "Cadastro de Usúario realizado!",
        dados: {
          id: result.insertId,
          login,
          hashedPassword,
          ativo,
        },
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro ao cadastrar Usúario.`,
        dados: error.message,
      });
    }
  },
  async editarUsuarios(request, response) {
    try {
      const { login, senha, ativo } = request.body;

      const { id } = request.params;

      const sql = `
                UPDATE USUARIOS SET
                    usu_login = ?, usu_senha = ?, usu_ativo = ?
                WHERE 
                    usu_id = ?
            `;

      const values = [login, senha, ativo, id];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Usuário ${id} não encontrado!`,
          dados: null,
        });
      }

      const dados = {
        id,
        login,
        senha,
        ativo,
      };

      return response.status(200).json({
        sucesso: true,
        mensagem: `Usuário ${id} atualizado!`,
        dados,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro ao editar Usuário.`,
        dados: error.message,
      });
    }
  },
};
