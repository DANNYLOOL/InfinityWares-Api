'use strict'

var express = require('express');
var clienteController = require('../controllers/ClienteController');

var api = express.Router();
var auth = require('../middlewares/authenticate');

api.post('/registro_cliente_tienda',clienteController.registro_cliente_tienda);
api.get('/listar_clientes_tienda',auth.auth,clienteController.listar_clientes_tienda);

api.get('/listar_productos_destacados_publico',clienteController.listar_productos_destacados_publico);
api.get('/listar_productos_nuevos_publico',clienteController.listar_productos_nuevos_publico);
api.post('/registro_cliente',clienteController.registro_cliente);
api.post('/login_cliente',clienteController.login_cliente);
api.get('/obtener_cliente_guest/:id',auth.auth,clienteController.obtener_cliente_guest);
api.put('/actualizar_perfil_cliente_guest/:id',auth.auth,clienteController.actualizar_perfil_cliente_guest);

api.get('/listar_productos_publico',clienteController.listar_productos_publico);
api.get('/obtener_variedades_productos_cliente/:id',clienteController.obtener_variedades_productos_cliente);
api.get('/obtener_productos_slug_publico/:slug',clienteController.obtener_productos_slug_publico);
api.get('/listar_productos_recomendados_publico/:categoria',clienteController.listar_productos_recomendados_publico);

api.post('/verificar_codigo', clienteController.comprobar_codigo);
api.post('/reenviar_codigo', clienteController.reenviar_codigo);
api.post('/recuperar_pass', clienteController.recuperar_pass);

api.post('/agregar_carrito_cliente',auth.auth,clienteController.agregar_carrito_cliente);
api.get('/obtener_carrito_cliente/:id',auth.auth,clienteController.obtener_carrito_cliente);
api.delete('/eliminar_carrito_cliente/:id',auth.auth,clienteController.eliminar_carrito_cliente);

module.exports = api;