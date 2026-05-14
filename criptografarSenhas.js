const db = require("./src/dataBase/connection.js");
const bcrypt = require("bcrypt");

async function criptografarSenhas() {
  try {
    console.log("Buscando usuários...");

    const [usuarios] = await db.query(`
      SELECT 
        usu_id,
        usu_login,
        usu_senha
      FROM USUARIOS;
    `);

    if (usuarios.length === 0) {
      console.log("Nenhum usuário encontrado.");
      process.exit(0);
    }

    for (const usuario of usuarios) {
      const senhaAtual = usuario.usu_senha;

      if (!senhaAtual) {
        console.log(`Usuário ${usuario.usu_login} está sem senha. Ignorado.`);
        continue;
      }

      // Evita criptografar de novo uma senha que já está criptografada
      if (senhaAtual.startsWith("$2a$") || senhaAtual.startsWith("$2b$")) {
        console.log(`Usuário ${usuario.usu_login} já possui senha criptografada.`);
        continue;
      }

      const senhaCriptografada = await bcrypt.hash(senhaAtual, 10);

      await db.query(
        `
        UPDATE USUARIOS
        SET usu_senha = ?
        WHERE usu_id = ?;
        `,
        [senhaCriptografada, usuario.usu_id]
      );

      console.log(`Senha do usuário ${usuario.usu_login} criptografada.`);
    }

    console.log("Todas as senhas foram verificadas.");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao criptografar senhas:", error);
    process.exit(1);
  }
}

criptografarSenhas();