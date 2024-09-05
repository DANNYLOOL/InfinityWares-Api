'use strict'

var express = require('express');
var AdminController = require('../controllers/AdminController');

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});

api.post('/login_admin',AdminController.login_admin);
api.get('/listar_admins_tienda',auth.auth,AdminController.listar_admins_tienda);
api.get('/listar_etiquetas_admin',auth.auth,AdminController.listar_etiquetas_admin);
api.delete('/eliminar_etiqueta_admin/:id',auth.auth,AdminController.eliminar_etiqueta_admin);
api.post('/agregar_etiqueta_admin',auth.auth,AdminController.agregar_etiqueta_admin);
api.post('/registro_producto_admin',[auth.auth,path],AdminController.registro_producto_admin);
api.get('/listar_productos_admin',auth.auth,AdminController.listar_productos_admin);
api.get('/listar_variedades_productos_admin',auth.auth,AdminController.listar_variedades_productos_admin);

api.put('/actualizar_estado_cliente/:id', auth.auth, AdminController.actualizar_estado_cliente);
api.put('/actualizar_estado_admin/:id', auth.auth, AdminController.actualizar_estado_admin);
api.get('/obtener_skus', auth.auth, AdminController.obtener_skus);
api.get('/obtener_producto_admin/:id',auth.auth,AdminController.obtener_producto_admin);
api.get('/listar_etiquetas_producto_admin/:id',auth.auth,AdminController.listar_etiquetas_producto_admin);
api.delete('/eliminar_etiqueta_producto_admin/:id',auth.auth,AdminController.eliminar_etiqueta_producto_admin);
api.post('/agregar_etiqueta_producto_admin',auth.auth,AdminController.agregar_etiqueta_producto_admin);
api.put('/actualizar_producto_admin/:id',[auth.auth,path],AdminController.actualizar_producto_admin);
api.get('/listar_variedades_admin/:id',auth.auth,AdminController.listar_variedades_admin);
api.put('/actualizar_producto_variedades_admin/:id',auth.auth,AdminController.actualizar_producto_variedades_admin);
api.delete('/eliminar_variedad_admin/:id',auth.auth,AdminController.eliminar_variedad_admin);
api.post('/agregar_nueva_variedad_admin',auth.auth,AdminController.agregar_nueva_variedad_admin);

api.get('/listar_inventario_producto_admin/:id',auth.auth,AdminController.listar_inventario_producto_admin);
api.post('/registro_inventario_producto_admin',auth.auth,AdminController.registro_inventario_producto_admin);
api.put('/agregar_imagen_galeria_admin/:id',[auth.auth,path],AdminController.agregar_imagen_galeria_admin);
api.put('/eliminar_imagen_galeria_admin/:id',auth.auth,AdminController.eliminar_imagen_galeria_admin);
api.get('/verificar_token',auth.auth,AdminController.verificar_token);
api.get('/cambiar_vs_producto_admin/:id/:estado',auth.auth,AdminController.cambiar_vs_producto_admin);

module.exports = api;