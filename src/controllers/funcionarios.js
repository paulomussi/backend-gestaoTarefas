const db = require('../dataBase/connection.js');

module.exports = {
    //----------------------LISTAR FUNCIONÁRIOS--------------------------------
    async listarFuncionarios(request, response) {
    try {

        const { setor_id } = request.query; // vem da URL: /funcionarios?setor_id=3

        let sql = `
            SELECT 
                func_id,
                func_setor_id, 
                func_crg_id, 
                func_nome, 
                func_email, 
                func_login,
                func_senha, 
                func_ativo = 1 AS func_ativo, 
                func_data_criacao 
            FROM FUNCIONARIOS
            WHERE func_ativo = 1
        `;

        const values = [];

       
        if (setor_id) {
            sql += ` AND func_setor_id = ?`;
            values.push(setor_id);
        }

        const [funcionarios] = await db.query(sql, values);

        return response.status(200).json({
            sucesso: true,
            mensagem: 'Lista de Funcionários obtida com sucesso',
            items: funcionarios.length,
            dados: funcionarios
        });

    } catch (error) {
        return response.status(500).json({
            sucesso: false,
            mensagem: `Erro ao listar Funcionários: ${error.message}`,
            dados: null
        });
    }
},

    //---------------------CADASTRAR FUNCIONÁRIOS------------------------------
    async cadastrarFuncionarios(request, response) {
        try {
            const { setor, cargo, nome, email, login, senha, ativo, data } = request.body;

            const sql = `INSERT INTO FUNCIONARIOS 
                (func_setor_id, func_crg_id, func_nome, func_email, func_login, func_senha, func_ativo, func_data_criacao) 
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, NOW());`;

            const values = [setor, cargo, nome, email, login, senha, ativo, data];
            const [result] = await db.query(sql, values);

            const dados = {
                id: result.insertId,
                nome,
                email,
                login,
                ativo,
                data_criacao: new Date()
            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de funcionários realizada!',
                    dados: dados
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar Funcionários.`,
                    dados: error.message
                }
            );
        }
    },
    //-----------------------EDITAR FUNCIONÁRIOS-------------------------------
    async editarFuncionarios(request, response) {
        try {
            const { setor, cargo, nome, email, login, senha, ativo, data } = request.body;

            const { id } = request.params;

            const sql = `
                UPDATE FUNCIONARIOS SET
                    func_setor_id = ?, func_crg_id = ?, func_nome = ?, func_email = ?, func_login = ?, func_senha = ?, func_ativo =?, func_data_criacao = ?
                WHERE
                    func_id = ?;
            `;

            const values = [setor, cargo, nome, email, login, senha, ativo, data, id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            const dados = {
                id,
                nome,
                email,
                login,
                ativo
            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: `Funcionário ${id} atualizado com sucesso!`,
                    dados
                });

        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao atualizar Funcionários.`,
                    dados: error.message
                }
            );
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
                    dados: null
                });
            }


            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: `Funcionário ${id} excluído com sucesso`,
                    dados: null
                }
            );

        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro na requisição ${error.mensage}`,
                    dados: error.message
                }
            );
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
                    dados: null
                });
            }


            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: `Funcionário ${id} excluído com sucesso`,
                    dados: null
                }
            );

        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro na requisição ${error.mensage}`,
                    dados: null
                }
            );
        }
    },
} 

