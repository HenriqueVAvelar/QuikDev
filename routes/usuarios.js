const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/cadastro', (req, res, next) => {
	mysql.getConnection((error, conn) => {
		if (error) { return res.status(500).send({ error: error}) }
		bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
			if (errBcrypt) {return res.status(500).send({ error: errBcrypt }) }
			conn.query('insert into user (name, email, senha) values (?, ?, ?)',
				[req.body.name, req.body.email, hash],
				(error, results) => {
					conn.release()
					if (error) { return res.status(500).send({ error: error}) }
					response = {
						mensagem: 'Usuário criado com sucesso',
						usuarioCriado: {
							id: results.insertId,
							name: req.body.name,
							email: req.body.email
						}
					}
					return res.status(201).send(response)
				})
		})
	})
})

router.post('/login', (req, res, next) => {
	mysql.getConnection((error, conn) => {
		if (error) { return res.status(500).send({ error: error }) }
		const query = 'select * from user where email = ?'
		conn.query(query, [req.body.email], (error, results, fields) => {
			conn.release()
			if (error) { return res.status(500).send({ error: error }) }
			if (results.length < 1) {
				return res.status(401).send({ mensagem: 'Falha na autenticação' })
			}
			bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
				if (err) {
					return res.status(401).send({ mensagem: 'Falha na autenticação' })		
				}
				if (result) {
					const token = jwt.sign({
						id: results[0].id,
						name: results[0].name,
						email: results[0].email
					}, 
					process.env.JWT_KEY,
					{
						expiresIn: "1h"
					})
					return res.status(200).send({ 
						mensagem: 'Autenticado com sucesso',
						token: token
					})
				}
				return res.status(401).send({ mensagem: 'Falha na autenticação' })		
			})
		})
	})
})

module.exports = router