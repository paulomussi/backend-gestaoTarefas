const bcrypt = require("bcrypt");

(async () => {
  const senhaDigitada = "123456";
  const hashBanco =
    "$2b$10$OlwrB7EerWqmdzbynFopM.fVLXk9OFIB2V/oyuccqYB2.wtLvMHi6";

  const resultado = await bcrypt.compare(senhaDigitada, hashBanco);

  console.log("Senha correta?", resultado);
})();
