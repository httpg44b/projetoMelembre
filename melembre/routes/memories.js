const express = require('express');
const router = express.Router();
const dataConection = require('../dataConection').pool;
const jwt = require('jsonwebtoken');

//Lista as lembranças de hoje
router.get('/consultarMT', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const resHeader = req.headers.authorization;
        const decode = jwt.decode(resHeader);
        const user_creator = decode.id_user;

        if (error) {
            return res.status(200).send({
                error: error
            })
        }
        conn.query(
            `SELECT * FROM memories where FK_id_user = ${user_creator}`,
            (error, result) => {
                conn.release();
                
                if(error){
                    return res.status(200).send({
                        error: error
                    })
                }
                return res.status(200).send({
                    your_memories_today: result
                })}
        )
    })
});


//Lista as futuras lembranças
router.get('/consultarMF', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const resHeader = req.headers.authorization;
        const decode = jwt.decode(resHeader);
        const user_creator = decode.id_user;

        if (error) {
            return res.status(200).send({
                error: error
            })
        }
        conn.query(
            `SELECT * FROM SELECT_MEMORIES_FUTURE where FK_id_user = ${user_creator}`,
            (error, result) => {
                conn.release();
                
                if(error){
                    return res.status(200).send({
                        error: error
                    })
                }
                return res.status(200).send({
                    your_memories_futures: result
                })}
        )
    })
});


//Cadastrar uma nova lembraça
router.post('/cadastrar', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const {title_memory, desc_memory, dt_memory, horary} = req.body;
        const resHeader = req.headers.authorization;
        const decode = jwt.decode(resHeader);
        const user_creator = decode.id_user;

        if (title_memory.length > 20){
            return res.status(401).send({
                msg: 'Título muito grande.'
            })}

        if (error) {
            return res.status(200).send({
                error: error
            })}

        conn.query(
            `INSERT INTO memories(title_memory, desc_memory, dt_memory, horary, FK_id_user) VALUES(?, ?, ?, ?, ${user_creator})`,
            [
                title_memory,
                desc_memory, 
                dt_memory, 
                horary
            ],
            (error, result, field) => {
                conn.release();

                if(error){
                    return res.status(200).send({
                        error: error
                    })
                }
                return res.status(200).send({
                    msg: 'Lembrança criada com sucesso. '
                })}
        )
    })
});


//Alterando uma determinada lembrança
router.put('/alterar/:id_memory', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const {title_memory, desc_memory, dt_memory, horary} = req.body;
        const {id_memory} = req.params;
        

        if (title_memory.length > 20){
            return res.status(401).send({
                msg: 'Título muito grande.'
            })}

        if (error) {
            return res.status(500).send({
                error: error
            })}
    
        conn.query(
            `UPDATE memories
              SET title_memory   = ?,
                 desc_memory     = ?,
                 dt_memory       = ?,
                 horary          = ?
                 WHERE id_memory = ${id_memory}`,
            [
                title_memory,
                desc_memory, 
                dt_memory,
                horary
            ],
            (error, result, field) => {
                conn.release();

                if (error) {
                    return res.status(500).send({
                        error: error
                    })}

                res.status(201).send({
                    msg: 'Lembrança alterada com sucesso.'
                })}
        )
    })
});


//Dando um softdelete em uma lembranca
router.delete('/desativar/:id_memory', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const {id_memory} = req.params;

        if (error) {
            return res.status(500).send({
                error: error
            })}
        
        conn.query(
            `UPDATE memories
              SET memory_status = "D"
              WHERE id_memory = ${id_memory}`,

            (error) => {
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error
                    })
                }

                res.status(201).send({
                    msg: 'Lembrança excluida'
                })}
        )
    })
})

module.exports = router;