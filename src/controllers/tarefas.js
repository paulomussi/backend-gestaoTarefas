const db = require("../dataBase/connection");

module.exports = {
  //------------ Listar Tarefas -------------
  async listarTarefas(request, response) {
    try {
      const { setor, prioridade, exige_foto, responsavel, status, atrasadas } =
        request.query;

      let sql = `
                SELECT 
                    t.tar_id,
                    t.tar_setor_id,
                    t.tar_criado_por,
                    t.tar_titulo,
                    t.tar_descricao,
                    t.tar_prioridade,
                    t.tar_prazo,
                    t.tar_estimativa_minutos,
                    t.tar_data_criacao,
                    t.tar_exige_foto,
                    a.atr_status,
                    a.atr_funcionario_id
                FROM TAREFAS t
                LEFT JOIN ATRIBUICAO_TAREFAS a ON a.atr_tarefa_id = t.tar_id
                WHERE 1 = 1
            `;

      const values = [];

      if (setor) {
        sql += " AND t.tar_setor_id = ? ";
        values.push(setor);
      }

      if (prioridade) {
        sql += " AND t.tar_prioridade = ? ";
        values.push(prioridade);
      }

      if (exige_foto) {
        sql += " AND t.tar_exige_foto = ? ";
        values.push(exige_foto);
      }

      if (responsavel) {
        sql += " AND a.atr_funcionario_id = ? ";
        values.push(responsavel);
      }

      if (status) {
        sql += " AND a.atr_status = ? ";
        values.push(status);
      }

      if (atrasadas == "1") {
        sql += " AND t.tar_prazo < NOW() ";
      }

      const [tarefas] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: "Lista de tarefas filtrada com sucesso",
        items: tarefas.length,
        dados: tarefas,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro ao listar tarefas: ${error.message} `,
        dados: null,
      });
    }
  },

  // ------------ Cadastrar Tarefas -------------
  async cadastrarTarefas(request, response) {
    try {
      const {
        setor,
        criado,
        titulo,
        descricao,
        prioridade,
        prazo,
        estimativa,
        foto,
      } = request.body;

      const sql = `INSERT INTO TAREFAS 
                    (tar_setor_id, tar_criado_por, tar_titulo, tar_descricao, tar_prioridade, tar_prazo, tar_estimativa_minutos, tar_data_criacao, tar_exige_foto)
                VALUES
                    (?,?,?,?,?,?,?,NOW(), 0);`;

      const values = [
        setor,
        criado,
        titulo,
        descricao,
        prioridade,
        prazo,
        estimativa,
        foto,
      ];

      const [result] = await db.query(sql, values);

      const dados = {
        id: result.insertId,
        titulo,
        descricao,
        prioridade,
        prazo,
        estimativa,
      };

      return response.status(200).json({
        sucesso: true,
        mensagem: "Cadastro de tarefas realizado com sucesso",
        dados: dados,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro ao cadastrar tarefas. `,
        dados: error.message,
      });
    }
  },

  // ------------ Editar Tarefas -------------
  async editarTarefas(request, response) {
    try {
      const {
        setor,
        criado,
        titulo,
        descricao,
        prioridade,
        prazo,
        estimativa,
        data,
        foto,
      } = request.body;

      const { id } = request.params;

      const sql = `
                UPDATE TAREFAS SET
                    tar_setor_id = ?, tar_criado_por = ?, tar_titulo = ?, 
                    tar_descricao = ?, tar_prioridade = ?, tar_prazo = ?, 
                    tar_estimativa_minutos = ?, tar_data_criacao = ?, tar_exige_foto = ?
                WHERE
                    tar_id = ?;
            `;

      const values = [
        setor,
        criado,
        titulo,
        descricao,
        prioridade,
        prazo,
        estimativa,
        data,
        foto,
        id,
      ];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Tarefa ${id} não encontrado!`,
          dados: null,
        });
      }

      const dados = {
        id,
        titulo,
        descricao,
        prioridade,
        prazo,
        estimativa,
        data,
        foto,
      };

      return response.status(200).json({
        sucesso: true,
        mensagem: `Tarefa ${id} atualizada com sucesso`,
        dados,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro ao editar tarefas.`,
        dados: error.message,
      });
    }
  },

  // ------------ Apagar Tarefas -------------
  async apagarTarefas(request, response) {
    try {
      const { id } = request.params;

      // Apagar imagens tarefa
      const sqlVerificaTarefaFoto = `
                SELECT COUNT(*) AS quantidade FROM tarefa_fotos WHERE atr_tarefa_id = ?
            `;

      const [verificaTarefaFoto] = await db.query(sqlVerificaTarefaFoto, [id]);

      if (verificaTarefaFoto[0].quantidade > 0) {
        const sqlApagarFotosTarefa = `
                    DELETE FROM tarefa_fotos WHERE atr_tarefa_id = ?
                `;
        await db.query(sqlApagarFotosTarefa, [id]);
      }

      // Apagar atribuição da tarefa
      const sqlVerificaTarefaAtribuicao = `
                SELECT COUNT(*) AS quantidade FROM atribuicao_tarefas WHERE atr_tarefa_id = ?
            `;

      const [verificaTarefaAtribuicao] = await db.query(
        sqlVerificaTarefaAtribuicao,
        [id],
      );
      if (verificaTarefaAtribuicao[0].quantidade > 0) {
        const sqlApagarAtribuicaoTarefa = `
                    DELETE FROM atribuicao_tarefas WHERE atr_tarefa_id = ?
                `;
        await db.query(sqlApagarAtribuicaoTarefa, [id]);
      }

      const sql = `
                DELETE FROM tarefas
                WHERE tar_id = ?
            `;

      const values = [id];
      const [result] = await db.query(sql, [values]);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Tarefa não encontrada!`,
        });
      }
      return response.status(200).json({
        sucesso: true,
        mensagem: "Exclusão de tarefas realizada com sucesso",
        dados: null,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: `Erro ao remover tarefas: ${error.message} `,
        dados: null,
      });
    }
  },

  async aceitarTarefa(request, response) {
    try {
      const { id } = request.params;
      const { funcionario_id } = request.body;

      if (!funcionario_id) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "ID do funcionário é obrigatório",
          dados: null,
        });
      }

      // Verificar se a tarefa existe
      const sqlVerificaTarefa = `
      SELECT tar_id FROM tarefas WHERE tar_id = ?
    `;
      const [tarefa] = await db.query(sqlVerificaTarefa, [id]);

      if (tarefa.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Tarefa ${id} não encontrada`,
          dados: null,
        });
      }

      // Verificar se já existe uma atribuição
      const sqlVerificaAtribuicao = `
      SELECT atr_id FROM atribuicao_tarefas WHERE atr_tarefa_id = ?
    `;
      const [atribuicaoExistente] = await db.query(sqlVerificaAtribuicao, [id]);

      let sqlAtribuicao;
      let valuesAtribuicao;

      if (atribuicaoExistente.length > 0) {
        // Atualizar atribuição existente
        sqlAtribuicao = `
        UPDATE atribuicao_tarefas 
        SET atr_status = 1, atr_funcionario_id = ?
        WHERE atr_tarefa_id = ?
      `;
        valuesAtribuicao = [funcionario_id, id];
      } else {
        // Criar nova atribuição
        sqlAtribuicao = `
        INSERT INTO atribuicao_tarefas (atr_tarefa_id, atr_status, atr_funcionario_id)
        VALUES (?, 1, ?)
      `;
        valuesAtribuicao = [id, funcionario_id];
      }

      const [result] = await db.query(sqlAtribuicao, valuesAtribuicao);

      const dados = {
        tarefa_id: id,
        funcionario_id: funcionario_id,
        status: 1,
        mensagem:
          atribuicaoExistente.length > 0
            ? "Atribuição atualizada"
            : "Tarefa atribuída",
      };

      return response.status(200).json({
        sucesso: true,
        mensagem: "Tarefa aceita com sucesso",
        dados,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao aceitar tarefa.",
        dados: error.message,
      });
    }
  },
};
