const bcrypt = require("bcrypt");

(async () => {
  const senhaDigitada = "123456";
  const hashBanco = "123456";

  const resultado = await bcrypt.compare(senhaDigitada, hashBanco);

  console.log("Senha correta?", resultado);
})();
