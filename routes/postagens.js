const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool
const login = require('../middleware/login')

router.get('/', (req, res, next) => {
	mysql.getConnection((error, conn) => {
		if (error) { return res.status(500).send({ error: error }) }
		conn.query(
			'select * from post',
			(error, result, fields) => {
				if (error) { return res.status(500).send({ error: error }) }
				const response = {
					quantidade: result.length,
					post: result.map(post => {
						return {
							id: post.id,
							user_id: post.user_id,
							title: post.title,
							description: post.description,
							request: {
								tipo: 'GET',
								descricao: 'Retorna os detalhes de uma postagem específica',
								url: 'http://localhost:3000/post/' + post.id
							}
						}
					})
				}
				return res.status(200).send(response)
			}
		)
	})
})


router.post('/', login, (req, res, next) => {
	mysql.getConnection((error, conn) => {
		console.log(req.usuario)
		if (error) { return res.status(500).send({ error: error }) }
		conn.query(
			'insert into post (title, description, user_id) values (?, ?, ?)',
			[req.body.title, req.body.description, req.usuario.id],
			(error, result, field) => {
				conn.release()
				if (error) { return res.status(500).send({ error: error }) }
				const response = {
					mensagem: 'Postagem inserida com sucesso',
					postagensCriada: {
						user_id: req.body.user_id,
						title: req.body.title,
						description: req.body.descriptions,
						request: {
							tipo: 'GET',
							descricao: 'Retorna todos as postagens',
							url: 'http://localhost:3000/post'
						}						
					}
				}
				return res.status(201).send(response)
			}
		)
	})
})

router.get('/:id', login, (req, res, next) => {
	mysql.getConnection((error, conn) => {
		console.log(req.usuario)
		const usuario = req.usuario
		if (error) { return res.status(500).send({ error: error }) }
		conn.query(
			'select * from post where id = ?',
			[req.params.id],
			(error, result, fields) => {
				if (error) { return res.status(500).send({ error: error }) }

				if (result.length == 0) {
					return res.status(404).send({
						mensagem: 'Não foi encontrado postagem com esta ID'
					})
				}
				const response = {
					postagem: {
						id: result[0].id,
						user_id: result[0].user_id,
						title: result[0].title,
						description: result[0].description,
						request: {
							tipo: 'GET',
							descricao: 'Retorna todos os produtos',
							url: 'http://localhost:3000/postagens',
							teste: usuario.id,
							teste2: result[0].user_id/*,
							if (usuario.id == result[0].user_id) {
								return res.status(404).send({
									mensagem: 'Igual'
								})*/
							/*} else if {
								mensagem: 'Diferente'
							}*/
						}						
					}
				}
				return res.status(200).send(response)
			}
		)
	})
})

router.patch('/:id', login, (req, res, next) => {
	mysql.getConnection((error, conn) => {
		const usuario = req.usuario
		if (error) { return res.status(500).send({ error: error }) }
			conn.query('select * from post where id = ?',
			[req.params.id],
			(error, result, fields) => {
				if (error) { return res.status(500).send({ error: error }) }
				if (result.length == 0) {
					return res.status(404).send({
						mensagem: 'Não foi encontrado postagem com esta ID'
					})
				}
				if (usuario.id == result[0].user_id) {
					conn.query(
						'update post set title = ?, description = ? where id = ?',
						[req.body.title, req.body.description, req.params.id],
						(error, result, field) => {
							conn.release()
							if (error) { return res.status(500).send({ error: error }) }
							const response = {
								mensagem: 'Postagem atualizada com sucesso',
								postagemAtualizada: {
									title: req.body.title,
									description: req.body.description,
									request: {
										tipo: 'GET',
										descricao: 'Retorna os detalhes de uma postagem específica',
										url: 'http://localhost:3000/postagens/' + req.params.id
									}
								}
							} 
							return res.status(200).send(response)
						} 
					)
				} else {
					return res.status(404).send({
						mensagem: 'Você não é o usuário dono dessa postagem!'
					})
				}
			})
	})
})

router.delete('/:id', login, (req, res, next) => {
	mysql.getConnection((error, conn) => {
		const usuario = req.usuario
		if (error) { return res.status(500).send({ error: error }) }
			conn.query('select * from post where id = ?',
			[req.params.id],
			(error, result, fields) => {
				if (error) { return res.status(500).send({ error: error }) }
				if (result.length == 0) {
					return res.status(404).send({
						mensagem: 'Não foi encontrado postagem com esta ID'
					})
				}
				if (usuario.id == result[0].user_id) {
					conn.query(
						'delete from post where id = ?',
						[req.params.id],
						(error, result, field) => {
							conn.release()
							if (error) { return res.status(500).send({ error: error }) }
							const response = {
								mensagem: 'Postagem removida com sucesso'
							} 
							return res.status(200).send(response)
						} 
					)
				} else {
					return res.status(404).send({
						mensagem: 'Você não é o usuário dono dessa postagem!'
					})
				}
			})
	})
})

module.exports = router