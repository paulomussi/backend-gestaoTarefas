const db = require("../dataBase/connection.js");
const bcrypt = require("bcrypt");
module.exports = {
  async listarUsuarios(request, response) {
    try {
      const sql = `
      SELECT 
        usu_id,
        usu_func_id,
        usu_login,
        usu_ativo
      FROM USUARIOS
      WHERE usu_ativo = 1;
    `;

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
        mensagem: `Erro ao listar Usuários: ${error.message}`,
        dados: null,
      });
    }
  },

  async cadastrarUsuarios(request, response) {
    try {
      const { funcionario, login, senha, ativo } = request.body;

      if (!funcionario || !login || !senha || ativo === undefined) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "Campos obrigatórios: funcionario, login, senha e ativo.",
          dados: null,
        });
      }

      const sqlVerificarLogin = `
      SELECT usu_id
      FROM USUARIOS
      WHERE usu_login = ?
      LIMIT 1;
      `;

      const [loginExistente] = await db.query(sqlVerificarLogin, [login]);

      if (loginExistente.length > 0) {
        return response.status(409).json({
          sucesso: false,
          mensagem: "Este login já está em uso.",
          dados: null,
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(senha, 10);

      const sql = `
      INSERT INTO USUARIOS 
        (
          usu_func_id,
          usu_login, 
          usu_senha,
          usu_ativo
        ) 
      VALUES 
        (?, ?, ?, ?);
    `;

      const values = [funcionario, login, hashedPassword, ativo];

      const [result] = await db.query(sql, values);

      return response.status(201).json({
        sucesso: true,
        mensagem: "Cadastro de usuário realizado!",
        dados: {
          id: result.insertId,
          funcionario,
          login,
          ativo,
        },
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao cadastrar usuário.",
        dados: error.message,
      });
    }
  },

  async editarUsuarios(request, response) {
    try {
      const { login, senha, ativo } = request.body;
      const { id } = request.params;

      if (!login || ativo === undefined) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "Campos obrigatórios: login e ativo.",
          dados: null,
        });
      }

      let sql;
      let values;

      /*
        Se veio uma nova senha, criptografa e atualiza a senha.
        Se não veio senha, mantém a senha antiga.
      */
      if (senha && senha.trim() !== "") {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        sql = `
        UPDATE USUARIOS SET
          usu_login = ?,
          usu_senha = ?,
          usu_ativo = ?
        WHERE 
          usu_id = ?;
      `;

        values = [login, hashedPassword, ativo, id];
      } else {
        sql = `
        UPDATE USUARIOS SET
          usu_login = ?,
          usu_ativo = ?
        WHERE 
          usu_id = ?;
      `;

        values = [login, ativo, id];
      }

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Usuário ${id} não encontrado!`,
          dados: null,
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Usuário ${id} atualizado!`,
        dados: {
          id,
          login,
          ativo,
        },
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao editar usuário.",
        dados: error.message,
      });
    }
  },
};
