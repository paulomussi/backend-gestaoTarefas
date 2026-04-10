const express = require("express");
const router = express.Router();

const TarefasController = require("../controllers/tarefas");
const SetoresController = require("../controllers/setores");
const UsuariosController = require("../controllers/usuarios");

const LoginController = require("../auth/login");

router.get("/tarefas", TarefasController.listarTarefas);
router.post("/tarefas", TarefasController.cadastrarTarefas);
router.patch("/tarefas/:id", TarefasController.editarTarefas);
router.delete("/tarefas/:id", TarefasController.apagarTarefas);

router.get("/setores", SetoresController.listarSetores);
router.post("/setores", SetoresController.cadastrarSetores);
router.patch("/setores/:id", SetoresController.editarSetores);
router.delete("/setores/:id", SetoresController.apagarSetores);

router.get("/usuarios", UsuariosController.listarUsuarios);
router.post("/usuarios", UsuariosController.cadastrarUsuarios);
router.patch("/usuarios/:id", UsuariosController.editarUsuarios);

router.post("/login", LoginController.login);

module.exports = router;
