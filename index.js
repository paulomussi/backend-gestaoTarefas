require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const router = require("./src/routes/routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

// tornar a pasta public acessível externamente
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "src", "uploads")),
);

const porta = process.env.PORT || 3333;

app.listen(porta, "0.0.0.0",() => {
  console.log(`Servidor iniciado em http://${process.env.SERVER}:${porta}`);
});

app.get("/", (request, response) => {
  response.send("Hello World");
});
