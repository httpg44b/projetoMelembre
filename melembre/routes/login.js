const express = require('express');
const router = express.Router();
const dataConection = require('../dataConection').pool;
const jwt = require('jsonwebtoken');

router.post('/', (req, res, next) => {
    dataConection.getConnection((error, conn) => {
        const {user_name, pass_wd} = req.body;

        if(error) {
            return res.status(500).send({error: error})}
        
        const query = `SELECT * FROM users WHERE user_name = ? AND pass_wd = ? AND user_status = 'A'`;

        conn.query(query,[user_name, pass_wd], (error, result, field) => {
            conn.release();
            if (error) {return res.status(500).send({error: error})}
            if (result.length < 1) {
                return res.status(200).send({msg: 'Falha na autenticação'})
            }

            let token = jwt.sign({
                id_user: result[0].id_user,
                user_name: result[0].user_name,
                full_name: result[0].full_name
            }, process.env.KEY,
            {
                expiresIn: 70 * 7
            });

            return res.status(200).send({msg: `Usuário logado`,
                                              token,
                                        });
            
        })
    })
});

module.exports = router;