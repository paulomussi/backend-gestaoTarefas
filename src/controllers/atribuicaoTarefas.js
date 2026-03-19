const db = require('../dataBase/connection');

module.exports = {
    async listarAtribuicaoTarefas(request, response) {
        try {

            const sql = `
            SELECT 
                atr_id, atr_tarefa_id, atr_funcionario_id, atr_status, atr_data_atribuicao 
            FROM ATRIBUICAO_TAREFAS;
            `;

            const [atribuicaoTarefas] = await db.query(sql);


            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Lista de atribuição de tarefas feita com sucesso',
                    itens: atribuicaoTarefas.length,
                    dados: atribuicaoTarefas
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `erro ao listar atribuição de tarefas: ${error.message} `,
                    dados: null
                }
            );
        }
    },
    async cadastrarAtribuicaoTarefas(request, response) {
        try {
            const { status, tarefaId, funcId } = request.body;

            const sql = `INSERT INTO ATRIBUICAO_TAREFAS 
                (atr_tarefa_id, atr_funcionario_id, atr_status, atr_data_atribuicao)
            VALUES
                (?, ?, ?, NOW());`;

            const values = [tarefaId, funcId, status];

            const [result] = await db.query(sql, values);

            const dados = {
                id: result.insertId
            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de tarefas feita com sucesso',
                    dados: dados
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `erro ao cadastrar tarefas.`,
                    dados: error.message
                }
            );
        }
    },
    async editarAtribuicaoTarefas(request, response) {
        try {

            const { status, data_atribuicao } = request.body;

            const { id } = request.params;

            const sql = `
                UPDATE atribuicao_tarefas SET 
                    atr_status = ?,    
                    atr_data_atribuicao = ?
                WHERE 
                    atr_id = ?
            `;

            const values = [status, data_atribuicao, id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Atribuição de tarefas ${id} não encontrado!`,
                    dados: null
                });
            }

            const dados = {
                id,
                status,
                data_atribuicao

            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Editar atribuição de tarefas feita com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `erro ao editar atribuição de tarefas: ${error.message} `,
                    dados: null
                }
            );
        }
    },
    async apagarAtribuicaoTarefas(request, response) {
        try {

            const { id } = request.params;

            const sql = `
                DELETE FROM atribuicao_tarefas
                WHERE atr_id = ?
                `;

            const values = [id];
            const [result] = await db.query(sql, [values]);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Atribuição ${id} não encontrada`
                });
            }
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Apagar atribuição de tarefas feito com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `erro ao apagar atribuição de tarefas: ${error.message} `,
                    dados: null
                }
            );
        }
    },
}