const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool
const login = require('../middleware/login')

router.get('/', (req, res, next) => {
	mysql.getConnection((error, conn) => {
		if (error) { return res.status(500).send({ error: error }) }
		conn.query(
			'select * from comment',
			(error, result, fields) => {
				if (error) { return res.status(500).send({ error: error }) }
				const response = {
					quantidade: result.length,
					comment: result.map(comment => {
						return {
							id: comment.id,
							user_id: comment.user_id,
							post_id: comment.post_id,
							description: comment.description,
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
		const usuario = req.usuario
		if (error) { return res.status(500).send({ error: error }) }
			conn.query('select * from post where id = ?',
			[req.body.post_id],
			(error, result, fields) => {
				if (error) { return res.status(500).send({ error: error }) }
				if (result.length == 0) {
					return res.status(404).send({
						mensagem: 'Não foi encontrado postagem com esta ID'
					})
				}
					conn.query(
						'insert into comment (user_id, post_id, description) values (?, ?, ?)',
						[req.usuario.id, req.body.post_id, req.body.description],
						(error, result, field) => {
							conn.release()
							if (error) { return res.status(500).send({ error: error }) }
							const response = {
								mensagem: 'Comentário inserido com sucesso'
							}
							return res.status(201).send(response)
						}
					)
		})
	})
})

router.patch('/:id', login, (req, res, next) => {
	mysql.getConnection((error, conn) => {
		const usuario = req.usuario
		if (error) { return res.status(500).send({ error: error }) }
			conn.query('select * from comment where id = ?',
			[req.params.id],
			(error, result, fields) => {
				if (error) { return res.status(500).send({ error: error }) }
				if (result.length == 0) {
					return res.status(404).send({
						mensagem: 'Não foi encontrado comentário com esta ID'
					})
				}
				if (usuario.id == result[0].user_id) {
					conn.query(
						'update comment set description = ? where id = ?',
						[req.body.description, req.params.id],
						(error, result, field) => {
							conn.release()
							if (error) { return res.status(500).send({ error: error }) }
							const response = {
								mensagem: 'Comentário atualizado com sucesso',
								comentarioAtualizado: {
									description: req.body.description
								}
							} 
							return res.status(200).send(response)
						} 
					)
				} else {
					return res.status(404).send({
						mensagem: 'Você não é o usuário dono desse comentário!'
					})
				}
			})
	})
})

router.delete('/:id', login, (req, res, next) => {
	mysql.getConnection((error, conn) => {
		const usuario = req.usuario
		if (error) { return res.status(500).send({ error: error }) }
			conn.query('select * from comment where id = ?',
			[req.params.id],
			(error, result, fields) => {
				if (error) { return res.status(500).send({ error: error }) }
				if (result.length == 0) {
					return res.status(404).send({
						mensagem: 'Não foi encontrado comentário com esta ID'
					})
				}
				if (usuario.id == result[0].user_id) {
					conn.query(
						'delete from comment where id = ?',
						[req.params.id],
						(error, result, field) => {
							conn.release()
							if (error) { return res.status(500).send({ error: error }) }
							const response = {
								mensagem: 'Comentário removido com sucesso'
							} 
							return res.status(200).send(response)
						} 
					)
				} else {
					return res.status(404).send({
						mensagem: 'Você não é o usuário dono desse comentário!'
					})
				}
			})
	})
})

module.exports = router