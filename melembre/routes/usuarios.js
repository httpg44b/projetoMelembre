const express = require('express');
const router = express.Router();
const dataConection = require('../dataConection').pool;
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const {cpf} = require('cpf-cnpj-validator');
const sendEmail = require('./helpers/sendEmail');

//Lista dados do usuário logado
router.get('/consultar', (req, res, next) => {
    dataConection.getConnection((error, conn) => {
        const resHeader = req.headers.authorization;
        const decode = jwt.decode(resHeader);
        const user = decode.id_user;

        if (error) {
            return res.status(500).send({ error: error })
        }
        conn.query(
            'SELECT * FROM users WHERE id_user = ?',
            [
                user
            ],
            (error, result, field) => {
                conn.release();

                if (error) {
                    return res.status(500).send({ 
                        error: error
                    })
                }
                return res.status(200).send({
                    user_data: result
                })
            }
        )
    })
});


//Insire um usuario
router.post('/cadastrar',
     [body('email').isEmail().withMessage("Digite um email valido"),
     body('cpf').custom((cpfInput) => {
        const checkCPF = cpf.isValid(cpfInput);
        if(!checkCPF) return Promise.reject('CPF informado é invalido.');
        return true;
     }),
    ],
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(200).json({ erros: errors.array() });
    }
    dataConection.getConnection((error, conn) => {

        const {user_name, full_name, cpf, bth_date, gender, email, pass_wd, phone, type_user} = req.body;

        if (user_name === ''){
            return res.status(200).send({
                msg: 'Favor digitar o nome de usuário.'
            })
        }if (full_name === ''){
            return res.status(200).send({
                msg: 'Favor digitar o nome.'
            })
        }else if (bth_date === ''){
            return res.status(200).send({
                msg: 'Favor informar a sua data de nascimento.'
            })
        }else if (pass_wd === ''){
            return res.status(200).send({
                msg: 'Favor digitar uma senha.'
            })
        }else if (pass_wd.length < 6){
            return res.status(200).send({
                msg: 'A senha deve conter no mínimo 6 caractéres, por faovor.'
            })
        }else {
        conn.query(
            'INSERT INTO users (user_name, full_name, cpf, bth_date, gender, email, pass_wd, phone, type_user, user_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "A")',
            [user_name, full_name, cpf, bth_date, gender, email, pass_wd, phone, type_user],
            (error) => {
                conn.release();

                if (error.sqlState === "23000") {
                    return res.status(200).send({
                        error: "Usuário já cadastrado. Por favor digite um novo usuário"
                    });
                }else if (error) {
                    return res.status(200).send({
                        error: error
                    });
                }else {
                
                res.status(503).send({
                    msg: 'Usuário: ' +user_name+ ' cadastrado com sucesso status 503'
                });
                res.status(200).send({
                    msg: 'Usuário: ' +user_name+ ' cadastrado com sucesso'
                });
            }})
        }
    })
});

// Alterar dados do usuário
router.put('/alterar', 
    [body('email').isEmail().withMessage("Digite um email valido"),
     body('cpf').custom((cpfInput) => {
        const checkCPF = cpf.isValid(cpfInput);
        if(!checkCPF) return Promise.reject('CPF informado é invalido.');
        return true;
     }),
    ],
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).json({ erros: errors.array() });
    }

    dataConection.getConnection((error, conn) => {
        const {user_name, full_name, cpf, bth_date, gender, email, pass_wd, phone, type_user} = req.body;
        const resHeader = req.headers.authorization;
        const decode = jwt.decode(resHeader);
        const user = decode.id_user;
        

        if (error) {return res.status(500).send({ 
            erro: error
        })}

        if (user_name === ''){
            return res.status(401).send({
                msg: 'Favor digitar o nome de usuário.'
            })
        }else if (full_name === ''){
            return res.status(401).send({
                msg: 'Favor digitar o nome.'
            })
        }else if (bth_date === ''){
            return res.status(401).send({
                msg: 'Favor informar a sua data de nascimento.'
            })
        }else if (email === ''){
            return res.status(401).send({
                msg: 'Favor digitar o seu email.'
            })
        }else if (pass_wd === ''){
            return res.status(401).send({
                msg: 'Favor digitar uma senha.'
            })
        }else if (pass_wd.length < 6){
            return res.status(401).send({
                msg: 'A senha deve conter no mínimo 6 caractéres, por faovor.'
            })
        }else {
            conn.query(
                `UPDATE users
                  SET   user_name = ?,
                        full_name = ?,
                        cpf       = ?,
                        bth_date  = ?,
                        gender    = ?,
                        email     = ?,
                        pass_wd   = ?,
                        phone     = ?,
                        type_user = ?
                        WHERE    id_user = ${user}`,
                [
                    user_name,
                    full_name,
                    cpf,
                    bth_date,
                    gender,
                    email,
                    pass_wd,
                    phone,
                    type_user
                ],
                (error, result, field) => {
                    conn.release();

                    if (error) {return res.status(500).send({ erro: error})
                    }else {
                     res.status(201).send({
                        msg: `Usuário ${user_name} alterado com sucesso.`
                     })}
                })
        }
    })
})

//Desativar usuário 
router.delete('/desativar', (req, res, next) => {
    dataConection.getConnection((error, conn) => {

        const resHeader = req.headers.authorization;
        const decode = jwt.decode(resHeader);
        const user = decode.id_user;

        if (error) {return res.status(500).send({
            error: error 
        })}
        conn.query(
            `UPDATE users
              SET user_status = "D"
              WHERE id_user = ?`,
            [
                user
            ],
            (error, result, field) => {
                conn.release();
                
                if(error) {return res.status(500).send({ 
                    erro: error
                })}
                
                res.status(201).send({
                    msg: `Usuário desativado com sucesso.`
                })}
        )
    })
});


//envio de email
router.get('/sendEmail', (req, res, next) => {
    dataConection.getConnection((error, conn) => {
        const {email} = req.body;

        if (email === ''){
            return res.status(500).send({message: 'Digite um email.'})
        }

        if (error) {
            return res.status(500).send({ error: error })
        }

         conn.query(
             'SELECT * FROM users WHERE email = ?',
             [
                 email
             ],
             (error, result) => {
                 conn.release();

                 if(result[0] === undefined){
                    return res.status(200).send({ 
                        msg: 'Enviado com sucesso.'
                    })
                 }else{

                   const emailOnly = result[0].email;
                   const nameOnly = result[0].full_name;
                   const passOnly = result[0].pass_wd;
  
                   sendEmail(emailOnly, nameOnly, passOnly);
  
                   if (error) {
                       return res.status(500).send({ 
                           error: error
                       })
                   }
                   return res.status(200).send({
                       message: `Email eviado para ${emailOnly}`
                   })
                 }
             }
         )
    })
});

module.exports = router;