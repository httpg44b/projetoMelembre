const express = require('express');
const router = express.Router();
const dataConection = require('../dataConection').pool;
const jwt = require('jsonwebtoken');

//Lista as lembranças de hoje
router.get('/consultarMed', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const resHeader = req.headers.authorization;
        const decode = jwt.decode(resHeader);
        const user_creator = decode.id_user;

        if (error) {
            return res.status(500).send({
                error: error
            })
        }
        conn.query(
            `SELECT * FROM MEDICAMENT_NOTAKEN WHERE FK_id_user_medicament = ${user_creator}`,
            (error, result) => {
                conn.release();
                
                if(error){
                    return res.status(500).send({
                        error: error
                    })
                }
                return res.status(201).send({
                    your_medicament_to_br_taken: result
                })}
        )
    })
});

//Cadastrar uma nova lembraça
router.post('/cadastrarMed', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const {name_medicament, quant_medicament, horary} = req.body;
        const resHeader = req.headers.authorization;
        const decode = jwt.decode(resHeader);
        const user_creator = decode.id_user;

        if (error) {
            return res.status(500).send({
                error: error
            })}

        conn.query(
            `INSERT INTO medicament(name_medicament, quant_medicament, horary, medicament_taken, FK_id_user_medicament) VALUES(?, ?, ?, default, ${user_creator})`,
            [
                name_medicament,
                quant_medicament, 
                horary
            ],
            (error, result, field) => {
                conn.release();

                if(error){
                    return res.status(500).send({
                        error: error
                    })
                }
                return res.status(201).send({
                    msg: 'Lembrança de remédio criada com sucessos.'
                })}
        )
    })
});


//Alterando uma determinada lembrança
router.put('/alterarMed/:id_med', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const {name_medicament, quant_medicament, horary} = req.body;
        const {id_med} = req.params;
        

        if (error) {
            return res.status(500).send({
                error: error
            })}
    
        conn.query(
            `UPDATE medicament
              SET name_medicament  = ?,
                 quant_medicament  = ?,
                 horary            = ?
                 WHERE id_medicament = ${id_med}`,
            [
                name_medicament,
                quant_medicament,
                horary
            ],
            (error, result, field) => {
                conn.release();

                if (error) {
                    return res.status(500).send({
                        error: error
                    })}

                res.status(201).send({
                    msg: 'Lembrança de remédio alterada com sucesso.'
                })}
        )
    })
});


//Dando um softdelete em uma lembranca
router.delete('/desativarMed/:id_med', (req, res) => {
    dataConection.getConnection((error, conn) => {
        const {id_med} = req.params;

        if (error) {
            return res.status(500).send({
                error: error
            })}
        
        conn.query(
            `UPDATE medicament
              SET medicament_taken = 1
              WHERE id_medicament = ${id_med}`,

            (error) => {
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error
                    })
                }

                res.status(201).send({
                    msg: 'Lembrança de medicament excluida'
                })}
        )
    })
})

module.exports = router;