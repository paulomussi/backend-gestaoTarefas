-- =========================
-- DROP TABLES na ordem correta (filhas antes das pais)
-- =========================
DROP TABLE IF EXISTS TAREFA_FOTOS;
DROP TABLE IF EXISTS ATRIBUICAO_TAREFAS;
DROP TABLE IF EXISTS TAREFAS;
DROP TABLE IF EXISTS CARGO_PERMISSOES;
DROP TABLE IF EXISTS USUARIOS;
DROP TABLE IF EXISTS FUNCIONARIOS;
DROP TABLE IF EXISTS SETORES;
DROP TABLE IF EXISTS CARGOS;
DROP TABLE IF EXISTS PERMISSOES;


CREATE TABLE CARGOS (
    crg_id INT AUTO_INCREMENT PRIMARY KEY,
    crg_nome VARCHAR(60) NOT NULL
);

CREATE TABLE PERMISSOES (
    prm_id INT AUTO_INCREMENT PRIMARY KEY,
    prm_nome VARCHAR(60) NOT NULL
);

CREATE TABLE SETORES (
    set_id INT AUTO_INCREMENT PRIMARY KEY,
    set_nome VARCHAR(60) NOT NULL
);

CREATE TABLE FUNCIONARIOS (
    func_id INT AUTO_INCREMENT PRIMARY KEY,
    func_setor_id INT NOT NULL,
    func_crg_id INT NOT NULL,
    func_nome VARCHAR(60) NOT NULL,
    func_email VARCHAR(80) UNIQUE NOT NULL,
    func_foto VARCHAR(255) DEFAULT NULL,
    func_ativo BIT NOT NULL,
    func_data_criacao DATETIME NOT NULL,
    FOREIGN KEY (func_setor_id) REFERENCES SETORES(set_id),
    FOREIGN KEY (func_crg_id) REFERENCES CARGOS(crg_id)
);

CREATE TABLE USUARIOS (
    usu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_func_id INT NOT NULL UNIQUE,
    usu_login VARCHAR(80) NOT NULL UNIQUE,
    usu_senha VARCHAR(255) NOT NULL,
    usu_ativo BIT NOT NULL,
    FOREIGN KEY (usu_func_id) REFERENCES FUNCIONARIOS(func_id)
);

CREATE TABLE CARGO_PERMISSOES (
    crg_id INT,
    prm_id INT,
    crg_prm_cadastrar BIT NOT NULL,
    crg_prm_editar BIT NOT NULL,
    crg_prm_consultar BIT NOT NULL,
    PRIMARY KEY (crg_id, prm_id),
    FOREIGN KEY (crg_id) REFERENCES CARGOS(crg_id),
    FOREIGN KEY (prm_id) REFERENCES PERMISSOES(prm_id)
);

CREATE TABLE TAREFAS (
    tar_id INT AUTO_INCREMENT PRIMARY KEY,
    tar_setor_id INT NOT NULL,
    tar_criado_por INT NOT NULL,
    tar_titulo VARCHAR(100) NOT NULL,
    tar_descricao VARCHAR(300) NOT NULL,
    tar_prioridade TINYINT NOT NULL,  
    tar_estimativa_minutos INT NOT NULL,
    tar_data_criacao DATETIME NOT NULL,
    tar_exige_foto BIT,
    FOREIGN KEY (tar_setor_id) REFERENCES SETORES(set_id),
    FOREIGN KEY (tar_criado_por) REFERENCES FUNCIONARIOS(func_id)
);

CREATE TABLE ATRIBUICAO_TAREFAS (
    atr_id INT AUTO_INCREMENT PRIMARY KEY,
    atr_tarefa_id INT NOT NULL,
    atr_funcionario_id INT NOT NULL,
    atr_data_atribuicao DATETIME NOT NULL, 
    atr_status TINYINT NOT NULL,
    FOREIGN KEY (atr_tarefa_id) REFERENCES TAREFAS(tar_id),
    FOREIGN KEY (atr_funcionario_id) REFERENCES FUNCIONARIOS(func_id)
);

CREATE TABLE TAREFA_FOTOS (
    fot_id INT AUTO_INCREMENT PRIMARY KEY,
    fot_tarefa_id INT NOT NULL,
    fot_nome VARCHAR(60) NOT NULL,
    fot_descricao VARCHAR(255) NOT NULL,
    fot_data_envio DATETIME NOT NULL,
    FOREIGN KEY (fot_tarefa_id) REFERENCES TAREFAS(tar_id)
);



-- =========================
-- 1. CARGOS
-- =========================
INSERT INTO CARGOS (crg_nome) VALUES
('Gerente'),
('Supervisor'),
('Caixa'),
('Repositor'),
('Auxiliar de Limpeza');

-- =========================
-- 2. PERMISSOES
-- =========================
INSERT INTO PERMISSOES (prm_nome) VALUES
('Funcionários'),
('Setores'),
('Tarefas'),
('Relatórios'),
('Estoque');

-- =========================
-- 3. SETORES
-- =========================
INSERT INTO SETORES (set_nome) VALUES
('Administrativo'),
('Financeiro'),
('Operacional'),
('Atendimento'),
('Limpeza'),
('Estoque'),
('Logística');

-- =========================
-- 4. FUNCIONÁRIOS (20 funcionários)
-- =========================
INSERT INTO FUNCIONARIOS 
(func_setor_id, func_crg_id, func_nome, func_email, func_foto, func_ativo, func_data_criacao)
VALUES
(1, 1, 'Carlos Silva', 'carlos.silva@mercadobom.com', NULL, 1, NOW()),
(2, 2, 'Fernanda Costa', 'fernanda.costa@mercadobom.com', NULL, 1, NOW()),
(4, 3, 'João Pereira', 'joao.pereira@mercadobom.com', NULL, 1, NOW()),
(3, 4, 'Lucas Andrade', 'lucas.andrade@mercadobom.com', NULL, 1, NOW()),
(5, 5, 'Mariana Lima', 'mariana.lima@mercadobom.com', NULL, 1, NOW()),
(3, 4, 'Rafaela Souza', 'rafaela.souza@mercadobom.com', NULL, 1, NOW()),
(4, 3, 'Paulo Henrique', 'paulo.henrique@mercadobom.com', NULL, 1, NOW()),
(6, 4, 'Diego Martins', 'diego.martins@mercadobom.com', NULL, 1, NOW()),
(7, 4, 'Juliana Ramos', 'juliana.ramos@mercadobom.com', NULL, 1, NOW()),
(5, 5, 'Amanda Torres', 'amanda.torres@mercadobom.com', NULL, 1, NOW()),
(4, 3, 'Eduardo Nunes', 'eduardo.nunes@mercadobom.com', NULL, 1, NOW()),
(3, 4, 'Ricardo Gomes', 'ricardo.gomes@mercadobom.com', NULL, 1, NOW()),
(6, 4, 'Beatriz Santos', 'beatriz.santos@mercadobom.com', NULL, 1, NOW()),
(2, 2, 'Tatiane Rocha', 'tatiane.rocha@mercadobom.com', NULL, 1, NOW()),
(7, 4, 'Guilherme Araújo', 'guilherme.araujo@mercadobom.com', NULL, 1, NOW()),
(1, 2, 'Patrícia Mendes', 'patricia.mendes@mercadobom.com', NULL, 1, NOW()),
(6, 4, 'Henrique Duarte', 'henrique.duarte@mercadobom.com', NULL, 1, NOW()),
(5, 5, 'Larissa Teixeira', 'larissa.teixeira@mercadobom.com', NULL, 1, NOW()),
(3, 4, 'Matheus Lima', 'matheus.lima@mercadobom.com', NULL, 1, NOW()),
(7, 4, 'Bruna Cardoso', 'bruna.cardoso@mercadobom.com', NULL, 1, NOW());

--===========================
-- INSERT USUARIOS
--===========================
INSERT INTO USUARIOS
(usu_func_id, usu_login, usu_senha, usu_ativo)
VALUES
(1, 'Carlos', 'Silva', 1),
(2, 'Fernanda', 'Costa', 1),
(3, 'João', 'Pereira', 1),
(4, 'Lucas', 'Andrade', 1),
(5, 'Mariana', 'Lima', 1),
(6,'Rafaela', 'Souza', 1),
(7,'Paulo', 'Henrique', 1),
(8, 'Diego', 'Martins', 1),
(9, 'Juliana', 'Ramos', 1),
(10, 'Amanda', 'Torres', 1),
(11, 'Eduardo', 'Nunes', 1),
(12, 'Ricardo', 'Gomes', 1),
(13, 'Beatriz', 'Santos', 1),
(14, 'Tatiane', 'Rocha', 1),
(15, 'Guilherme', 'Araújo', 1),
(16, 'Patrícia', 'Mendes', 1),
(17, 'Henrique', 'Duarte', 1),
(18, 'Larissa', 'Teixeira', 1),
(19, 'Matheus', 'Lima', 1),
(20, 'Bruna', 'Cardoso', 1);

-- =========================
-- 5. CARGO_PERMISSOES
-- =========================
-- Gerente: todas as permissões
INSERT INTO CARGO_PERMISSOES (crg_id, prm_id, crg_prm_cadastrar, crg_prm_editar, crg_prm_consultar) VALUES
(1, 1, 1, 1, 1),
(1, 2, 1, 1, 1),
(1, 3, 1, 1, 1),
(1, 4, 1, 1, 1),
(1, 5, 1, 1, 1);

-- Supervisor
INSERT INTO CARGO_PERMISSOES VALUES
(2, 1, 1, 0, 1),
(2, 2, 1, 0, 1),
(2, 3, 1, 1, 1),
(2, 4, 0, 0, 1),
(2, 5, 1, 0, 1);

-- Caixa
INSERT INTO CARGO_PERMISSOES VALUES
(3, 3, 0, 0, 1),
(3, 5, 0, 0, 1);

-- Repositor
INSERT INTO CARGO_PERMISSOES VALUES
(4, 3, 0, 0, 1),
(4, 5, 0, 0, 1);

-- Limpeza
INSERT INTO CARGO_PERMISSOES VALUES
(5, 3, 0, 0, 1);

-- =========================
-- 6. TAREFAS (20 tarefas)
-- =========================
INSERT INTO TAREFAS (tar_setor_id, tar_criado_por, tar_titulo, tar_descricao, tar_prioridade,  tar_estimativa_minutos, tar_data_criacao, tar_exige_foto)
VALUES
(3, 1, 'Reposição de produtos de higiene', 'Repor prateleiras de sabonetes e shampoos.', 2,  60, NOW(), 0),
(4, 2, 'Atendimento VIP', 'Atendimento diferenciado a clientes fidelizados.', 3,  90, NOW(), 0),
(5, 1, 'Limpeza do depósito', 'Organizar e limpar depósito de produtos perecíveis.', 1,  120, NOW(), 1),
(3, 2, 'Verificação de validade', 'Checar validade na seção de frios.', 3,  45, NOW(), 1),
(2, 1, 'Conferência de notas fiscais', 'Verificar notas e lançar no sistema.', 2,  75, NOW(), 0),
(6, 2, 'Organizar estoque de bebidas', 'Reorganizar caixas e atualizar planilha.', 2,  80, NOW(), 1),
(3, 1, 'Montar exposição de Natal', 'Criar display de produtos natalinos na entrada.', 3,  180, NOW(), 1),
(7, 1, 'Agendar entrega com fornecedores', 'Confirmar horários de entrega de novos produtos.', 2,  60, NOW(), 0),
(4, 16, 'Treinamento de novos caixas', 'Treinar novos colaboradores no sistema PDV.', 3,  120, NOW(), 0),
(3, 14, 'Organizar setor de hortifrúti', 'Reorganizar frutas e verduras conforme padrão visual.', 2,  90, NOW(), 1),
(6, 13, 'Contagem de estoque geral', 'Inventário mensal completo do estoque.', 3,  240, NOW(), 1),
(5, 10, 'Limpeza das câmaras frias', 'Higienizar câmaras frias com produtos adequados.', 3,  180, NOW(), 1),
(4, 2, 'Atualizar tabela de preços', 'Atualizar valores de acordo com novo reajuste.', 2,  70, NOW(), 0),
(3, 12, 'Verificar etiquetas de preço', 'Conferir etiquetas nas gôndolas.', 1,  40, NOW(), 0),
(7, 9, 'Conferência de entrega pendente', 'Verificar entregas que não foram recebidas.', 2,  90, NOW(), 0),
(5, 18, 'Limpeza do estacionamento', 'Varredura completa do estacionamento.', 1,  120, NOW(), 1),
(6, 8, 'Reposição de estoque noturno', 'Abastecimento noturno do setor de bebidas.', 3, 150, NOW(), 1),
(4, 11, 'Controle de fila nos caixas', 'Reduzir tempo médio de espera.', 2,  60, NOW(), 0),
(2, 14, 'Revisar relatórios financeiros', 'Checar lançamentos e saldos bancários.', 3,  180, NOW(), 0),
(1, 1, 'Auditoria interna mensal', 'Auditoria de processos e conferência de documentos.', 3,  300, NOW(), 0);

-- =========================
-- 7. ATRIBUICAO_TAREFAS
-- =========================
INSERT INTO ATRIBUICAO_TAREFAS (atr_tarefa_id, atr_funcionario_id, atr_data_atribuicao, atr_status)
VALUES
(1, 4, NOW(), 0),
(2, 3, NOW(), 0),
(3, 5, NOW(), 0),
(4, 6, NOW(), 0),
(5, 14, NOW(), 0),
(6, 8, NOW(), 0),
(7, 9, NOW(), 0),
(8, 15, NOW(), 0),
(9, 3, NOW(), 0),
(10, 12, NOW(), 0),
(11, 13, NOW(), 0),
(12, 10, NOW(), 0),
(13, 11, NOW(), 0),
(14, 4, NOW(), 0),
(15, 9, NOW(), 0),
(16, 18, NOW(), 0),
(17, 17, NOW(), 0),
(18, 7, NOW(), 0),
(19, 14, NOW(), 0),
(20, 16, NOW(), 0);

-- =========================
-- 8. TAREFA_FOTOS
-- =========================
INSERT INTO TAREFA_FOTOS (fot_tarefa_id, fot_nome, fot_descricao, fot_data_envio)
VALUES
(3, 'deposito_limpo.jpg', 'Depósito limpo e organizado após limpeza geral.', NOW()),
(4, 'frios_validade.jpg', 'Foto da seção de frios com etiquetas atualizadas.', NOW()),
(6, 'estoque_bebidas.jpg', 'Organização das caixas de bebidas.', NOW()),
(7, 'exposicao_natal.jpg', 'Display de produtos natalinos montado.', NOW()),
(10, 'hortifruti.jpg', 'Setor de frutas e verduras reorganizado.', NOW()),
(11, 'estoque_geral.jpg', 'Contagem de estoque registrada.', NOW()),
(12, 'camara_fria.jpg', 'Câmara fria higienizada.', NOW()),
(16, 'estacionamento_limpo.jpg', 'Área de estacionamento limpa.', NOW()),
(17, 'estoque_noturno.jpg', 'Reabastecimento do setor noturno concluído.', NOW());



-- =========================
-- SELECTs listando todos os campos de cada tabela (sem usar *)
-- =========================
SELECT crg_id, crg_nome FROM CARGOS;
SELECT prm_id, prm_nome FROM PERMISSOES;
SELECT set_id, set_nome FROM SETORES;
SELECT func_id, func_setor_id, func_crg_id, func_nome, func_email, func_foto, func_ativo, func_data_criacao FROM FUNCIONARIOS;
SELECT usu_id, usu_func_id, usu_login, usu_senha, usu_ativo FROM USUARIOS;
SELECT crg_id, prm_id, crg_prm_cadastrar, crg_prm_editar, crg_prm_consultar FROM CARGO_PERMISSOES;
SELECT tar_id, tar_setor_id, tar_criado_por, tar_titulo, tar_descricao, tar_prioridade, tar_estimativa_minutos, tar_data_criacao, tar_exige_foto FROM TAREFAS;
SELECT atr_id, atr_tarefa_id, atr_funcionario_id, atr_data_atribuicao, atr_status FROM ATRIBUICAO_TAREFAS;
SELECT fot_id, fot_nome, fot_descricao, fot_data_envio FROM TAREFA_FOTOS;




DELIMITER $$

CREATE TRIGGER trg_usu_ativo
AFTER UPDATE ON FUNCIONARIOS
FOR EACH ROW
BEGIN
    UPDATE USUARIOS
    SET usu_ativo = NEW.func_ativo
    WHERE usu_func_id = NEW.func_id;
END $$

DELIMITER ;