var Admin = require('../models/Admin');
var Etiqueta = require('../models/Etiqueta');
var Variedad = require('../models/Variedad');
var Inventario = require('../models/Inventario');
var Producto = require('../models/Producto');
var Cliente = require('../models/Cliente');
var Producto_etiqueta = require('../models/Producto_etiqueta');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');

var path = require('path');
var fs = require('fs');

const login_admin = async function (req, res) {
    var data = req.body;
    var admin_arr = [];

    admin_arr = await Admin.find({ email: data.email });

    if (admin_arr.length == 0) {
        res.status(200).send({ message: 'El correo electrónico no existe', data: undefined });
    } else {
        //LOGIN
        let user = admin_arr[0];

        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {
                res.status(200).send({
                    data: user,
                    token: jwt.createToken(user)
                });
            } else {
                res.status(200).send({ message: 'Las credenciales no coinciden', data: undefined });
            }
        });
    }
}

listar_admins_tienda = async function (req, res) {
    if (req.user) {
        var admins = await Admin.find();
        res.status(200).send({ data: admins });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_estado_cliente = async function(req, res) {
    if(req.user) {
        let id = req.params['id'];
        let estado = req.body.activo;

        let cliente = await Cliente.findByIdAndUpdate(id, { activo: estado });
        res.status(200).send({data: cliente});
    } else {
        res.status(500).send({message: 'NoAccess'});
    }
}

const actualizar_estado_admin = async function(req, res) {
    if(req.user) {
        let id = req.params['id'];
        let estado = req.body.activo;

        let admin = await Admin.findByIdAndUpdate(id, { activo: estado });
        res.status(200).send({data: admin});
    } else {
        res.status(500).send({message: 'NoAccess'});
    }
}

registro_admin_tienda = async function (req, res) {
    let data = req.body;
    var admins_arr = [];

    admins_arr = await Admin.find({ email: data.email });

    if (admins_arr.length == 0) {
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    data.password = hash;
                    var reg = await Admin.create(data);
                    res.status(200).send({ data: reg });
                } else {
                    res.status(200).send({ message: 'ErrorServer', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay una contraseña', data: undefined });
        }


    } else {
        res.status(200).send({ message: 'El correo ya existe, intente con otro.', data: undefined });
    }
}

const listar_etiquetas_admin = async function (req, res) {
    if (req.user) {
        var reg = await Etiqueta.find();
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_etiqueta_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let reg = await Etiqueta.findByIdAndRemove({ _id: id });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const agregar_etiqueta_admin = async function (req, res) {
    if (req.user) {
        try {
            let data = req.body;

            data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');;
            var reg = await Etiqueta.create(data);
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined, message: 'Etiqueta ya existente' });

        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_skus = async function (req, res) {
    if (req.user) {
        try {
            let productos = await Producto.find({}, 'sku');
            let skus = productos.map(producto => producto.sku);
            res.status(200).send({ skus: skus });
        } catch (error) {
            res.status(500).send({ message: 'Error en el servidor', error: error.message });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const registro_producto_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;

        let productos = await Producto.find({ titulo: data.titulo });

        let arr_etiquetas = JSON.parse(data.etiquetas);

        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('/');
            var portada_name = name[2];

            data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            data.portada = portada_name;
            let reg = await Producto.create(data);

            if (arr_etiquetas.length >= 1) {
                for (var item of arr_etiquetas) {
                    await Producto_etiqueta.create({
                        etiqueta: item.etiqueta,
                        producto: reg._id,
                    });
                }
            }

            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El título del producto ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

listar_productos_admin = async function (req, res) {
    if (req.user) {
        var productos = await Producto.find();
        res.status(200).send({ data: productos });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

listar_variedades_productos_admin = async function (req, res) {
    if (req.user) {
        var productos = await Variedad.find().populate('producto');
        res.status(200).send({ data: productos });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        try {
            var reg = await Producto.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_etiquetas_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var etiquetas = await Producto_etiqueta.find({ producto: id }).populate('etiqueta');
        res.status(200).send({ data: etiquetas });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_etiqueta_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        console.log(id);
        let reg = await Producto_etiqueta.findByIdAndRemove({ _id: id });
        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const agregar_etiqueta_producto_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;

        var reg = await Producto_etiqueta.create(data);
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_portada = async function (req, res) {
    var img = req.params['img'];


    fs.stat('./uploads/productos/' + img, function (err) {
        if (!err) {
            let path_img = './uploads/productos/' + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    })
}

const actualizar_producto_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('/');
            var portada_name = name[2];

            let reg = await Producto.findByIdAndUpdate({ _id: id }, {
                titulo: data.titulo,
                stock: data.stock,
                precio_antes: data.precio_antes,
                precio: data.precio,
                peso: data.peso,
                sku: data.sku,
                categoria: data.categoria,
                visibilidad: data.visibilidad,
                descripcion: data.descripcion,
                contenido: data.contenido,
                portada: portada_name
            });

            fs.stat('./uploads/productos/' + reg.portada, function (err) {
                if (!err) {
                    fs.unlink('./uploads/productos/' + reg.portada, (err) => {
                        if (err) throw err;
                    });
                }
            })

            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            let reg = await Producto.findByIdAndUpdate({ _id: id }, {
                titulo: data.titulo,
                stock: data.stock,
                precio_antes: data.precio_antes,
                precio: data.precio,
                peso: data.peso,
                sku: data.sku,
                categoria: data.categoria,
                visibilidad: data.visibilidad,
                descripcion: data.descripcion,
                contenido: data.contenido,
            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_variedades_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let data = await Variedad.find({ producto: id });
        res.status(200).send({ data: data });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_producto_variedades_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        console.log(data.titulo_variedad);
        let reg = await Producto.findByIdAndUpdate({ _id: id }, {
            titulo_variedad: data.titulo_variedad,
        });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_variedad_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let reg = await Variedad.findByIdAndRemove({ _id: id });
        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const agregar_nueva_variedad_admin = async function (req, res) {
    if (req.user) {
        var data = req.body;

        console.log(data);
        let reg = await Variedad.create(data);

        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const listar_inventario_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        var reg = await Inventario.find({ producto: id }).populate('variedad').sort({ createdAt: -1 });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const registro_inventario_producto_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;

        let reg = await Inventario.create(data);

        //OBTENER EL REGISTRO DE PRODUCTO
        let prod = await Producto.findById({ _id: reg.producto });
        let varie = await Variedad.findById({ _id: reg.variedad });

        //CALCULAR EL NUEVO STOCK        
        //STOCK ACTUAL         
        //STOCK A AUMENTAR
        let nuevo_stock = parseInt(prod.stock) + parseInt(reg.cantidad);

        let nuevo_stock_vari = parseInt(varie.stock) + parseInt(reg.cantidad);

        //ACTUALICACION DEL NUEVO STOCK AL PRODUCTO
        let producto = await Producto.findByIdAndUpdate({ _id: reg.producto }, {
            stock: nuevo_stock
        });

        let variedad = await Variedad.findByIdAndUpdate({ _id: reg.variedad }, {
            stock: nuevo_stock_vari
        });

        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const agregar_imagen_galeria_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        var img_path = req.files.imagen.path;
        var name = img_path.split('/');
        var imagen_name = name[2];

        let reg = await Producto.findByIdAndUpdate({ _id: id }, {
            $push: {
                galeria: {
                    imagen: imagen_name,
                    _id: data._id
                }
            }
        });

        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_imagen_galeria_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;


        let reg = await Producto.findByIdAndUpdate({ _id: id }, { $pull: { galeria: { _id: data._id } } });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const verificar_token = async function (req, res) {
    console.log(req.user);
    if (req.user) {
        res.status(200).send({ data: req.user });
    } else {
        console.log(2);
        res.status(500).send({ message: 'NoAccess' });
    }
}

const cambiar_vs_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var estado = req.params['estado'];

        try {
            if (estado == 'Edicion') {
                await Producto.findByIdAndUpdate({ _id: id }, { estado: 'Publicado' });
                res.status(200).send({ data: true });
            } else if (estado == 'Publicado') {
                await Producto.findByIdAndUpdate({ _id: id }, { estado: 'Edicion' });
                res.status(200).send({ data: true });
            }
        } catch (error) {
            res.status(200).send({ data: undefined });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


module.exports = {
    listar_admins_tienda,
    actualizar_estado_cliente,
    actualizar_estado_admin,
    registro_admin_tienda,
    obtener_skus,
    login_admin,
    eliminar_etiqueta_admin,
    listar_etiquetas_admin,
    agregar_etiqueta_admin,
    registro_producto_admin,
    listar_productos_admin,
    obtener_producto_admin,
    listar_etiquetas_producto_admin,
    eliminar_etiqueta_producto_admin,
    agregar_etiqueta_producto_admin,
    obtener_portada,
    actualizar_producto_admin,
    listar_variedades_admin,
    actualizar_producto_variedades_admin,
    agregar_nueva_variedad_admin,
    eliminar_variedad_admin,
    listar_inventario_producto_admin,
    registro_inventario_producto_admin,
    agregar_imagen_galeria_admin,
    eliminar_imagen_galeria_admin,
    verificar_token,
    cambiar_vs_producto_admin,
    listar_variedades_productos_admin
}