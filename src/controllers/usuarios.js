const db = require('../dataBase/connection.js');

module.exports = {
    //----------------------LISTAR FUNCIONÁRIOS--------------------------------
    // async listarUsuarios(request, response) {
    //     try {

    //         const { setor_id } = request.query; // vem da URL: /funcionarios?setor_id=3

    //         let sql = `
    //         SELECT 
    //             func_id,
    //             func_setor_id, 
    //             func_crg_id, 
    //             func_nome, 
    //             func_email,             
    //             func_ativo = 1 AS func_ativo, 
    //             func_data_criacao 
    //         FROM FUNCIONARIOS
    //         WHERE func_ativo = 1
    //     `;

    //         const values = [];


    //         if (setor_id) {
    //             sql += ` AND func_setor_id = ?`;
    //             values.push(setor_id);
    //         }

    //         const [funcionarios] = await db.query(sql, values);

    //         return response.status(200).json({
    //             sucesso: true,
    //             mensagem: 'Lista de Funcionários obtida com sucesso',
    //             items: funcionarios.length,
    //             dados: funcionarios
    //         });

    //     } catch (error) {
    //         return response.status(500).json({
    //             sucesso: false,
    //             mensagem: `Erro ao listar Funcionários: ${error.message}`,
    //             dados: null
    //         });
    //     }
    // },
    //---------------------CADASTRAR FUNCIONÁRIOS------------------------------
    async cadastrarUsuarios(request, response) {
        try {
            const { funcionario, login, senha } = request.body;

            const sql = `INSERT INTO USUARIOS 
                (usu_func_id, usu_login, usu_senha) 
            VALUES 
                (?, ?, ?)`;

            const values = [ funcionario, login, senha];
            const [result] = await db.query(sql, values);

            const dados = {
                id: result.insertId,
                login,
                senha
            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de Usúario realizado!',
                    dados: dados
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar Usúario.`,
                    dados: error.message
                }
            );
        }
    },
    //-----------------------EDITAR FUNCIONÁRIOS-------------------------------
    // async editarUsuarios(request, response) {
    //     try {
    //         const { setor, cargo, nome, email, login, senha, ativo, data } = request.body;

    //         const { id } = request.params;

    //         const sql = `
    //             UPDATE FUNCIONARIOS SET
    //                 func_setor_id = ?, func_crg_id = ?, func_nome = ?, func_email = ?, func_ativo =?, func_data_criacao = ?
    //             WHERE
    //                 func_id = ?;
    //         `;

    //         const values = [setor, cargo, nome, email, ativo, data, id];

    //         const [result] = await db.query(sql, values);

    //         if (result.affectedRows === 0) {
    //             return response.status(404).json({
    //                 sucesso: false,
    //                 mensagem: `Usuário ${id} não encontrado!`,
    //                 dados: null
    //             });
    //         }

    //         const dados = {
    //             id,
    //             nome,
    //             email,
    //             ativo
    //         };

    //         return response.status(200).json(
    //             {
    //                 sucesso: true,
    //                 mensagem: `Funcionário ${id} atualizado com sucesso!`,
    //                 dados
    //             });

    //     } catch (error) {
    //         return response.status(500).json(
    //             {
    //                 sucesso: false,
    //                 mensagem: `Erro ao atualizar Funcionários.`,
    //                 dados: error.message
    //             }
    //         );
    //     }
    // },
    // //-----------------------OCULTAR FUNCIONÁRIOS------------------------------
    // async ocultarUsuarios(request, response) {
    //     try {
    //         const ativo = false;
    //         const { id } = request.params;
    //         const sql = `
    //         UPDATE funcionarios SET
    //             func_ativo = ?
    //         WHERE 
    //             func_id = ?
    //         `;

    //         const values = [ativo, id];
    //         const [result] = await db.query(sql, values);

    //         if (result.affectedRows === 0) {
    //             return response.status(404).json({
    //                 sucesso: false,
    //                 mensagem: `Funcionário ${id} não encontrado!`,
    //                 dados: null
    //             });
    //         }


    //         return response.status(200).json(
    //             {
    //                 sucesso: true,
    //                 mensagem: `Funcionário ${id} excluído com sucesso`,
    //                 dados: null
    //             }
    //         );

    //     } catch (error) {
    //         return response.status(500).json(
    //             {
    //                 sucesso: false,
    //                 mensagem: `Erro na requisição ${error.mensage}`,
    //                 dados: null
    //             }
    //         );
    //     }
    // },
}

