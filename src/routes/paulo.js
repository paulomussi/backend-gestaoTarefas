const express = require("express");
const router = express.Router();

const TarefasController = require("../controllers/tarefas");
const SetoresController = require("../controllers/setores");
const UsuariosController = require("../controllers/usuarios");
const LoginController = require("../auth/login");
const { autenticarJWT } = require("../auth/authMiddleware");
const uploadImage = require("../middleware/uploadHelper");
const upload = uploadImage("usuarios");

router.get("/tarefas", TarefasController.listarTarefas);
router.post("/tarefas", TarefasController.cadastrarTarefas);
router.patch("/tarefas/:id", TarefasController.editarTarefas);
router.delete("/tarefas/:id", TarefasController.apagarTarefas);

router.get(
  "/minhas-tarefas/verificar",
  autenticarJWT,
  TarefasController.verificarTarefasFuncionario
);

router.get("/setores", SetoresController.listarSetores);
router.post("/setores", SetoresController.cadastrarSetores);
router.patch("/setores/:id", SetoresController.editarSetores);
router.delete("/setores/:id", SetoresController.apagarSetores);

router.get("/usuarios", UsuariosController.listarUsuarios);
router.post("/usuarios", UsuariosController.cadastrarUsuarios);
router.patch("/usuarios/:id", UsuariosController.editarUsuarios);


router.post("/login", LoginController.login);

router.get(
  "/auth/verificar-sessao",
  autenticarJWT,
  LoginController.verificarSessao,
);

router.post(
  "/usuario/foto",
  autenticarJWT,
  upload.single("foto"),
  UsuariosController.uploadFotoPerfil,
);

router.get("/usuario/me",
   autenticarJWT, 
   UsuariosController.obterUsuarioLogado);

router.get("/teste", autenticarJWT, (req, res) => {
  res.json({ ok: true, usuario: req.usuario });
});

router.post("/tarefas/:id/aceitar", TarefasController.aceitarTarefa);

module.exports = router;
