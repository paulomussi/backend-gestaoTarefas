const db = require("../dataBase/connection");

module.exports = {
  //------------ Listar Tarefas -------------
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
        a.atr_funcionario_id,

        s.set_nome,

        criador.func_nome AS usu_nome,
        responsavel.func_nome AS responsavel_nome

      FROM TAREFAS t

      LEFT JOIN ATRIBUICAO_TAREFAS a 
        ON a.atr_tarefa_id = t.tar_id

      LEFT JOIN SETORES s
        ON s.set_id = t.tar_setor_id

      LEFT JOIN FUNCIONARIOS criador
        ON criador.func_id = t.tar_criado_por

      LEFT JOIN FUNCIONARIOS responsavel
        ON responsavel.func_id = a.atr_funcionario_id

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

      sql += " ORDER BY t.tar_id DESC ";

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
        mensagem: `Erro ao listar tarefas: ${error.message}`,
        dados: null,
      });
    }
  },

  // ------------ Cadastrar Tarefas -------------
  async cadastrarTarefas(request, response) {
    try {
      console.log("======== POST /tarefas ========");
      console.log("BODY RECEBIDO:", request.body);

      const {
        // nomes antigos, caso alguma tela antiga use
        setor,
        criado,
        estimativa,
        foto,

        // nomes novos vindos da Home
        setorId,
        criadoPor,
        funcionarioId,
        titulo,
        descricao,
        prioridade,
        estimativaMinutos,
        status,
      } = request.body;

      const setorFinal = setorId || setor;
      const criadoFinal = criadoPor || criado;
      const estimativaFinal = estimativaMinutos || estimativa || null;
      const fotoFinal = foto || 0;
      const statusFinal = status ?? 0;
      const funcionarioFinal = funcionarioId || criadoFinal;

      console.log("setorId:", setorId);
      console.log("setor:", setor);
      console.log("setorFinal:", setorFinal);

      console.log("criadoPor:", criadoPor);
      console.log("criado:", criado);
      console.log("criadoFinal:", criadoFinal);

      console.log("prioridade:", prioridade);
      console.log("titulo:", titulo);
      console.log("estimativaFinal:", estimativaFinal);

      if (!setorFinal || !criadoFinal || !titulo || !prioridade) {
        return response.status(400).json({
          sucesso: false,
          mensagem:
            "Campos obrigatórios: setorId/setor, criadoPor/criado, titulo e prioridade.",
          dados: null,
        });
      }

      const sqlTarefa = `
      INSERT INTO TAREFAS 
        (
          tar_setor_id,
          tar_criado_por,
          tar_titulo,
          tar_descricao,
          tar_prioridade,
          tar_prazo,
          tar_estimativa_minutos,
          tar_data_criacao,
          tar_exige_foto
        )
      VALUES
        (?, ?, ?, ?, ?, NULL, ?, NOW(), ?);
    `;

      const valuesTarefa = [
        setorFinal,
        criadoFinal,
        titulo,
        descricao || null,
        prioridade,
        estimativaFinal,
        fotoFinal,
      ];

      const [result] = await db.query(sqlTarefa, valuesTarefa);

      const tarefaId = result.insertId;

      const sqlAtribuicao = `
      INSERT INTO ATRIBUICAO_TAREFAS
        (
          atr_tarefa_id,
          atr_funcionario_id,
          atr_data_atribuicao,
          atr_status
        )
      VALUES
        (?, ?, NOW(), ?);
    `;

      const valuesAtribuicao = [tarefaId, funcionarioFinal, statusFinal];

      await db.query(sqlAtribuicao, valuesAtribuicao);

      const dados = {
        id: tarefaId,
        titulo,
        descricao,
        prioridade,
        setor: setorFinal,
        criado: criadoFinal,
        funcionario: funcionarioFinal,
        estimativa: estimativaFinal,
        status: statusFinal,
      };

      return response.status(201).json({
        sucesso: true,
        mensagem: "Cadastro de tarefa realizado com sucesso",
        dados,
      });
    } catch (error) {
      console.error("Erro ao cadastrar tarefa:", error);

      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao cadastrar tarefa.",
        dados: error.message,
      });
    }
  },

  // ------------ Editar Tarefas -------------
  async editarTarefas(request, response) {
    try {
      const {
        // nomes novos vindos da Home
        setorId,
        criadoPor,
        titulo,
        descricao,
        prioridade,
        estimativaMinutos,
        status,
        funcionarioId,

        // nomes antigos, se alguma tela antiga ainda usar
        setor,
        criado,
        estimativa,
        foto,
      } = request.body;

      const { id } = request.params;

      const setorFinal = setorId || setor;
      const criadoFinal = criadoPor || criado;
      const estimativaFinal = estimativaMinutos || estimativa || null;
      const fotoFinal = foto || 0;
      const statusFinal = status ?? 0;
      const funcionarioFinal = funcionarioId || criadoFinal;

      if (!setorFinal || !criadoFinal || !titulo || !prioridade) {
        return response.status(400).json({
          sucesso: false,
          mensagem:
            "Campos obrigatórios: setorId/setor, criadoPor/criado, titulo e prioridade.",
          dados: {
            setorFinal,
            criadoFinal,
            titulo,
            prioridade,
          },
        });
      }

      const sqlTarefa = `
      UPDATE TAREFAS SET
        tar_setor_id = ?,
        tar_criado_por = ?,
        tar_titulo = ?,
        tar_descricao = ?,
        tar_prioridade = ?,
        tar_estimativa_minutos = ?,
        tar_exige_foto = ?
      WHERE
        tar_id = ?;
    `;

      const valuesTarefa = [
        setorFinal,
        criadoFinal,
        titulo,
        descricao || null,
        prioridade,
        estimativaFinal,
        fotoFinal,
        id,
      ];

      const [resultTarefa] = await db.query(sqlTarefa, valuesTarefa);

      if (resultTarefa.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Tarefa ${id} não encontrada!`,
          dados: null,
        });
      }

      const sqlVerificaAtribuicao = `
      SELECT atr_id
      FROM ATRIBUICAO_TAREFAS
      WHERE atr_tarefa_id = ?;
    `;

      const [atribuicao] = await db.query(sqlVerificaAtribuicao, [id]);

      if (atribuicao.length > 0) {
        const sqlAtualizarAtribuicao = `
        UPDATE ATRIBUICAO_TAREFAS SET
          atr_status = ?,
          atr_funcionario_id = ?
        WHERE
          atr_tarefa_id = ?;
      `;

        await db.query(sqlAtualizarAtribuicao, [
          statusFinal,
          funcionarioFinal,
          id,
        ]);
      } else {
        const sqlCriarAtribuicao = `
        INSERT INTO ATRIBUICAO_TAREFAS
          (
            atr_tarefa_id,
            atr_funcionario_id,
            atr_data_atribuicao,
            atr_status
          )
        VALUES
          (?, ?, NOW(), ?);
      `;

        await db.query(sqlCriarAtribuicao, [id, funcionarioFinal, statusFinal]);
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Tarefa ${id} atualizada com sucesso!`,
        dados: {
          id,
          titulo,
          descricao,
          prioridade,
          setor: setorFinal,
          criado: criadoFinal,
          estimativa: estimativaFinal,
          status: statusFinal,
        },
      });
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);

      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao editar tarefa.",
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
      const [result] = await db.query(sql, values);

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
