const db = require("../dataBase/connection.js");

module.exports = {
  //----------------------LISTAR FUNCIONÁRIOS--------------------------------
  async listarFuncionarios(request, response) {
    try {
      const { setor_id, ativo } = request.query; // vem da URL: /funcionarios?setor_id=3

      let sql = `
      SELECT 
        func_id,
        func_setor_id, 
        func_crg_id, 
        func_nome, 
        func_email,             
        CAST(func_ativo AS UNSIGNED) AS func_ativo,
        func_data_criacao 
      FROM FUNCIONARIOS
      WHERE 1 = 1
    `;

      const values = [];

      if (setor_id) {
        sql += ` AND func_setor_id = ?`;
        values.push(setor_id);
      }

      if (ativo !== undefined && ativo !== "") {
        sql += ` AND func_ativo = ?`;
        values.push(Number(ativo));
      }

      sql += ` ORDER BY func_id DESC`;

      const [funcionarios] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: "Lista de Funcionários obtida com sucesso",
        items: funcionarios.length,
        dados: funcionarios,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro ao listar Funcionários: ${error.message}`,
        dados: null,
      });
    }
  },

  //---------------------CADASTRAR FUNCIONÁRIOS------------------------------
  async cadastrarFuncionarios(request, response) {
    try {
      const { setor, cargo, nome, email, ativo } = request.body;

      if (!setor || !cargo || !nome || !email || ativo === undefined) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "Campos obrigatórios: setor, cargo, nome, email e ativo.",
          dados: null,
        });
      }

      const sql = `
      INSERT INTO FUNCIONARIOS 
        (func_setor_id, func_crg_id, func_nome, func_email, func_ativo, func_data_criacao) 
      VALUES 
        (?, ?, ?, ?, ?, NOW());
    `;

      const values = [setor, cargo, nome, email, ativo];

      const [result] = await db.query(sql, values);

      const dados = {
        id: result.insertId,
        nome,
        email,
        setor,
        cargo,
        ativo,
        data_criacao: new Date(),
      };

      return response.status(201).json({
        sucesso: true,
        mensagem: "Cadastro de funcionário realizado com sucesso!",
        dados: {
          id: result.insertId,
          nome,
          email,
          setor,
          cargo,
          ativo,
        },
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao cadastrar Funcionários.",
        dados: error.message,
      });
    }
  },

  //-----------------------EDITAR FUNCIONÁRIOS-------------------------------
  async editarFuncionarios(request, response) {
    try {
      const {
        // nomes novos vindos do front
        setorId,
        cargoId,

        // nomes antigos, caso alguma tela ainda use
        setor,
        cargo,

        nome,
        email,
        ativo,
      } = request.body;

      const { id } = request.params;

      const setorFinal = setorId || setor;
      const cargoFinal = cargoId || cargo;

      if (
        !setorFinal ||
        !cargoFinal ||
        !nome ||
        !email ||
        ativo === undefined
      ) {
        return response.status(400).json({
          sucesso: false,
          mensagem:
            "Campos obrigatórios: setorId/setor, cargoId/cargo, nome, email e ativo.",
          dados: {
            setorFinal,
            cargoFinal,
            nome,
            email,
            ativo,
          },
        });
      }

      const sql = `
      UPDATE FUNCIONARIOS SET
        func_setor_id = ?,
        func_crg_id = ?,
        func_nome = ?,
        func_email = ?,
        func_ativo = ?
      WHERE
        func_id = ?;
    `;

      const values = [setorFinal, cargoFinal, nome, email, ativo, id];

      const [result] = await db.query(sql, values);

      const sqlAtualizarUsuario = `
        UPDATE USUARIOS
        SET usu_ativo = ?
        WHERE usu_func_id = ?;
      `;

      await db.query(sqlAtualizarUsuario, [ativo, id]);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Funcionário ${id} não encontrado!`,
          dados: null,
        });
      }

      const dados = {
        id,
        nome,
        email,
        setor: setorFinal,
        cargo: cargoFinal,
        ativo,
      };

      return response.status(200).json({
        sucesso: true,
        mensagem: `Funcionário ${id} atualizado com sucesso!`,
        dados,
      });
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);

      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar Funcionários.",
        dados: error.message,
      });
    }
  },

  //-----------------------EXCLUIR FUNCIONÁRIOS------------------------------
  async apagarFuncionarios(request, response) {
    try {
      const { id } = request.params;

      const sql = `
                DELETE FROM funcionarios
                WHERE func_id = ?
                `;

      const values = [id];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Funcionário ${id} não encontrado!`,
          dados: null,
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Funcionário ${id} excluído com sucesso`,
        dados: null,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro na requisição ${error.mensage}`,
        dados: error.message,
      });
    }
  },
  //-----------------------OCULTAR FUNCIONÁRIOS------------------------------
  async ocultarFuncionarios(request, response) {
    try {
      const ativo = false;
      const { id } = request.params;
      const sql = `
            UPDATE funcionarios SET
                func_ativo = ?
            WHERE 
                func_id = ?
            `;

      const values = [ativo, id];
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Funcionário ${id} não encontrado!`,
          dados: null,
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Funcionário ${id} excluído com sucesso`,
        dados: null,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro na requisição ${error.mensage}`,
        dados: null,
      });
    }
  },
};
