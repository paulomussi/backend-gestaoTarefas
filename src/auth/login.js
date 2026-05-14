const db = require("../database/connection");
const bcrypt = require("bcrypt");
const { gerarToken } = require("./jwt");

async function login(req, res) {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Login e senha são obrigatórios.",
        dados: null,
      });
    }

    const sqlUsuario = `
      SELECT 
        u.usu_id,
        u.usu_func_id,
        u.usu_login,
        u.usu_senha,
        CAST(u.usu_ativo AS UNSIGNED) AS usu_ativo,

        f.func_id,
        f.func_setor_id,
        f.func_nome,
        f.func_email,
        f.func_foto,
        f.func_crg_id,

<<<<<<< Updated upstream
        c.crg_nome,
        s.set_nome
=======
        s.set_nome AS func_setor_nome,
        c.crg_nome
>>>>>>> Stashed changes
      FROM USUARIOS u
      INNER JOIN FUNCIONARIOS f
        ON f.func_id = u.usu_func_id
      INNER JOIN SETORES s
        ON s.set_id = f.func_setor_id
      INNER JOIN CARGOS c
        ON c.crg_id = f.func_crg_id
        INNER JOIN SETORES s
        ON s.set_id = f.func_setor_id
      WHERE u.usu_login = ?
      LIMIT 1;
    `;

    const [rows] = await db.query(sqlUsuario, [login]);

    if (rows.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não encontrado.",
        dados: null,
      });
    }

    const usuarioBanco = rows[0];

    if (Number(usuarioBanco.usu_ativo) !== 1) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Usuário inativo.",
        dados: null,
      });
    }

    const isHashedPassword = /^\$2[aby]\$\d{2}\$/.test(usuarioBanco.usu_senha);

    let senhaValida = false;

    if (isHashedPassword) {
      senhaValida = await bcrypt.compare(senha, usuarioBanco.usu_senha);
    } else {
      senhaValida = senha === usuarioBanco.usu_senha;

      if (senhaValida) {
        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.query("UPDATE USUARIOS SET usu_senha = ? WHERE usu_id = ?", [
          hashedPassword,
          usuarioBanco.usu_id,
        ]);
      }
    }

    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Senha inválida.",
        dados: null,
      });
    }

    const sqlPermissoes = `
      SELECT
        cp.crg_id,
        cp.prm_id,
        CAST(cp.crg_prm_cadastrar AS UNSIGNED) AS crg_prm_cadastrar,
        CAST(cp.crg_prm_editar AS UNSIGNED) AS crg_prm_editar,
        CAST(cp.crg_prm_consultar AS UNSIGNED) AS crg_prm_consultar
      FROM CARGO_PERMISSOES cp
      WHERE cp.crg_id = ?;
    `;

    const [permissoes] = await db.query(sqlPermissoes, [
      usuarioBanco.func_crg_id,
    ]);

    const podeAdministrar = permissoes.some(
      (permissao) =>
        Number(permissao.crg_prm_cadastrar) === 1 ||
        Number(permissao.crg_prm_editar) === 1,
    );

    const podeConsultar = permissoes.some(
      (permissao) => Number(permissao.crg_prm_consultar) === 1,
    );

    const tipo = podeAdministrar ? "admin" : "funcionario";

    const usuario = {
      id: usuarioBanco.usu_id,
      funcionarioId: usuarioBanco.func_id,

      nome: usuarioBanco.func_nome,
      login: usuarioBanco.usu_login,
      email: usuarioBanco.func_email,
<<<<<<< Updated upstream

      setorId: usuarioBanco.func_setor_id,
      setor: usuarioBanco.set_nome,

      cargoId: usuarioBanco.func_crg_id,
      cargo: usuarioBanco.crg_nome,

=======
      setorId: usuarioBanco.func_setor_id,
      setor: usuarioBanco.func_setor_nome,
      cargoId: usuarioBanco.func_crg_id,
      cargo: usuarioBanco.crg_nome,
      avatar: usuarioBanco.func_foto
        ? `${req.protocol}://${req.get("host")}/uploads/usuarios/${usuarioBanco.func_foto}`
        : null,
>>>>>>> Stashed changes
      tipo,
      podeAdministrar,
      podeConsultar,
      permissoes,
    };

    const token = gerarToken({
      id: usuario.id,
      funcionarioId: usuario.funcionarioId,
      login: usuario.login,
      tipo: usuario.tipo,
      cargoId: usuario.cargoId,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      dados: {
        usuario,
        token,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro no login.",
      dados: error.message,
    });
  }
}

async function verificarSessao(req, res) {
  try {
    const { funcionarioId } = req.usuario;

    if (!funcionarioId) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token inválido.",
        dados: null,
      });
    }

    const sql = `
      SELECT 
        f.func_id,
        CAST(f.func_ativo AS UNSIGNED) AS func_ativo,
        CAST(u.usu_ativo AS UNSIGNED) AS usu_ativo
      FROM FUNCIONARIOS f
      INNER JOIN USUARIOS u
        ON u.usu_func_id = f.func_id
      WHERE f.func_id = ?
      LIMIT 1;
    `;

    const [rows] = await db.query(sql, [funcionarioId]);

    if (rows.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não encontrado.",
        dados: null,
      });
    }

    const usuario = rows[0];

    const ativo =
      Number(usuario.func_ativo) === 1 && Number(usuario.usu_ativo) === 1;

    if (!ativo) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Usuário inativo.",
        dados: null,
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Sessão válida.",
      dados: {
        ativo: true,
      },
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao verificar sessão.",
      dados: error.message,
    });
  }
}

module.exports = { login, verificarSessao };

