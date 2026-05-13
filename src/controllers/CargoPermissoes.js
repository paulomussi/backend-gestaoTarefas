const db = require('../dataBase/connection')

module.exports = {
    async listarCargoPermissoes(request, response) {
        try {
            const sql = `
      SELECT
        cp.crg_id,
        c.crg_nome,
        cp.prm_id,
        p.prm_nome,
        cp.crg_prm_cadastrar,
        cp.crg_prm_editar,
        cp.crg_prm_consultar
      FROM CARGO_PERMISSOES cp
      INNER JOIN CARGOS c
        ON c.crg_id = cp.crg_id
      INNER JOIN PERMISSOES p
        ON p.prm_id = cp.prm_id
      ORDER BY cp.crg_id, cp.prm_id;
    `;

            const [cargopermissoes] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: "Lista de Permissões de Cargos obtida com sucesso",
                itens: cargopermissoes.length,
                dados: cargopermissoes,
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: `Erro ao listar Permissões dos Cargos: ${error.message}`,
                dados: null,
            });
        }
    },
    
    // ------------ Cadastrar Permissões de Cargo -------------

    async cadastrarCargoPermissoes(request, response) {
        try {
            const { cargo, permissao, cadastrar, editar, consultar } = request.body;

            const sql = `INSERT INTO CARGO_PERMISSOES 
                (crg_id, prm_id, crg_prm_cadastrar, crg_prm_editar, crg_prm_consultar) 
            VALUES
                (?, ?, ?, ?, ?);`;

            const values = [cargo, permissao, cadastrar, editar, consultar];

            const [result] = await db.query(sql, values);

            const dados = {
                id: result.insertId,
                cadastrar,
                editar,
                consultar
            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de Permissões de Cargos efetuada com sucesso',
                    dados: dados
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao Cadastrar Permissoes de Cargos.`,
                    dados: error.message
                }
            );
        }
    },
    // ------------ Editar Permissões de Cargo -------------
    async editarCargoPermissoes(request, response) {
        try {

            const { cadastrar, editar, consultar } = request.body;
            const { crg_id, prm_id } = request.params;

            const sql = `
                UPDATE CARGO_PERMISSOES SET
                    crg_prm_cadastrar = ?,
                    crg_prm_editar = ?,
                    crg_prm_consultar = ?
                WHERE
                    crg_id = ?
                    AND prm_id = ?
                `;

            const values = [cadastrar, editar, consultar, crg_id, prm_id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Cargo permissão crg_id${id} e prm_id${id} não encontrado!`,
                    dados: null
                });
            }

            const dados = {
                crg_id,
                prm_id,
                cadastrar,
                editar,
                consultar
            }

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Atualização de Permissões de Cargos efetuada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao Editar Permissoes de Cargos: ${error.message}`,
                    dados: null
                }
            );
        }
    },

    // ------------ Excluir Permissões de Cargo -------------
    async apagarCargoPermissoes(request, response) {
        try {
            const { crg_id, prm_id } = request.params;

            const sql = `
                DELETE FROM cargo_permissoes
                WHERE 
                    crg_id = ?
                AND 
                    prm_id = ?
                `;

            const [result] = await db.query(sql, [crg_id, prm_id]);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Permissão não encontrada para esse cargo`
                });
            }
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Exclusão de Permissões de Cargos efetuada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao Excluir Permissoes de C argos: ${error.message}`,
                    dados: null
                }
            );
        }
    },
}

