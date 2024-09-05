var Cliente = require('../models/Cliente');
var Carrito = require('../models/Carrito');
var Variedad = require('../models/Variedad');
var Producto_etiqueta = require('../models/Producto_etiqueta');
var bcrypt = require('bcrypt-nodejs');
var Producto = require('../models/Producto');
var jwt = require('../helpers/jwt');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

function generarClave(length) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let clave = '';
    for (let i = 0; i < length; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        clave += caracteres[indice];
    }
    return clave;
}

function generarPass(length) {
    const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz';
    const letrasMayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    const caracteresEspeciales = '!@#$%^&*()_+[]{}|;:,.<>?';
    const todosLosCaracteres = letrasMinusculas + letrasMayusculas + numeros + caracteresEspeciales;

    let clave = '';
    clave += letrasMinusculas[Math.floor(Math.random() * letrasMinusculas.length)];
    clave += letrasMayusculas[Math.floor(Math.random() * letrasMayusculas.length)];
    clave += numeros[Math.floor(Math.random() * numeros.length)];
    clave += caracteresEspeciales[Math.floor(Math.random() * caracteresEspeciales.length)];

    for (let i = 4; i < length; i++) {
        const indice = Math.floor(Math.random() * todosLosCaracteres.length);
        clave += todosLosCaracteres[indice];
    }

    return clave.split('').sort(() => Math.random() - 0.5).join('');
}

const comprobar_codigo = async function (req, res) {
    try {
        let data = req.body;
        const cliente = await Cliente.findOne({ email: data.email }).select('codigo');

        if (cliente.codigo == data.codigo.toString().trim()) {
            // Generar y devolver el token
            const token = jwt.createToken(cliente);
            res.status(200).send({ claveRespuesta: 1, token: token });
        } else {
            res.status(400).send({ claveRespuesta: 0 });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ claveRespuesta: 0 });
    }
}

registro_cliente_tienda = async function (req, res) {
    let data = req.body;
    var clientes_arr = [];

    clientes_arr = await Cliente.find({ email: data.email });

    if (clientes_arr.length == 0) {
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    data.dni = '';
                    data.password = hash;
                    var reg = await Cliente.create(data);
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

listar_clientes_tienda = async function (req, res) {
    if (req.user) {
        var clientes = await Cliente.find();
        res.status(200).send({ data: clientes });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/**** */

const listar_productos_destacados_publico = async function (req, res) {
    let reg = await Producto_etiqueta.find({ etiqueta: "61a390d39b40d02e0cb9d789" }).populate('producto');
    res.status(200).send({ data: reg });
}

const listar_productos_nuevos_publico = async function (req, res) {
    let reg = await Producto.find({ estado: 'Publicado' }).sort({ createdAt: -1 }).limit(8);
    res.status(200).send({ data: reg });
}

const registro_cliente = async function (req, res) {
    //
    var data = req.body;
    var clientes_arr = [];

    clientes_arr = await Cliente.find({ email: data.email });
    console.log(data);
    if (clientes_arr.length == 0) {
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    data.dni = '';
                    data.password = hash;
                    var reg = await Cliente.create(data);
                    res.status(200).send({ data: reg });
                } else {
                    res.status(200).send({ message: 'ErrorServer', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay una contraseña', data: undefined });
        }


    } else {
        res.status(200).send({ message: 'El correo ya existe en la base de datos', data: undefined });
    }
}

const enviar_codigo = async function (codigo, email) {
    try {
        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'infinitywares640@gmail.com',
                pass: 'jxgdpgyyknrxwmlq'
            }
        }));

        const htmlContent = `
            <html>
            <body>
                <h1>Tu Código de Autenticación</h1>
                <p>Por favor, usa el siguiente código para completar tu proceso de autenticación:</p>
                <h2>{{codigo}}</h2>
                <p>Si no solicitaste este código, por favor ignora este correo.</p>
            </body>
            </html>
        `;

        // Se inserta el código en el HTML
        const htmlWithCode = htmlContent.replace('{{codigo}}', codigo);

        var mailOptions = {
            from: 'infinitywares640@gmail.com',
            to: email,
            subject: 'Código de Autenticación (2FA) para tu Cuenta',
            html: htmlWithCode
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log('Error in enviar_codigo:', error);
    }
};

const enviar_pass = async function (codigo, email) {
    try {
        const transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'infinitywares640@gmail.com',
                pass: 'jxgdpgyyknrxwmlq'
            }
        }));

        const htmlContent = `
            <html>
            <body>
                <h1>Tu Contraseña Temporal</h1>
                <p>Por favor, usa la siguiente contraseña para completar tu proceso de autenticación:</p>
                <h2>${codigo}</h2>
                <p>Si no solicitaste esta contraseña, por favor ignora este correo.</p>
            </body>
            </html>
        `;

        const mailOptions = {
            from: 'infinitywares640@gmail.com',
            to: email,
            subject: 'Contraseña Temporal para tu Cuenta',
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + email);
    } catch (error) {
        console.log('Error in enviar_pass:', error);
        throw new Error('Error sending email');
    }
};

async function reenviar_codigo(req, res) {
    try {
        const { email } = req.body;

        const cliente_arr = await Cliente.find({ email });

        if (cliente_arr.length === 0) {
            res.status(404).send({ message: 'No se encontró el correo', data: undefined });
        } else {
            const filtro = { email };
            const claveGenerada = generarClave(8);

            await Cliente.updateOne(filtro, { $set: { codigo: claveGenerada } });

            enviar_codigo(claveGenerada, email);

            res.status(200).send({ message: 'Código reenviado, verifica tu correo', data: cliente_arr[0] });
        }
    } catch (error) {
        console.log('Error in reenviarCodigo:', error);
        res.status(500).send({ message: 'Error al reenviar el código de verificación' });
    }
}

const login_cliente = async function (req, res) {
    var data = req.body;
    var cliente_arr = [];

    cliente_arr = await Cliente.find({ email: data.email });

    if (cliente_arr.length === 0) {
        res.status(200).send({ message: 'No se encontró el correo', data: undefined });
    } else {
        let user = cliente_arr[0];

        // Verificar si el cliente está activo
        if (!user.activo) {
            res.status(200).send({ message: 'El cliente no está activo', data: undefined });
            return;
        }

        // Comparar contraseñas
        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {
                if (data.carrito.length >= 1) {
                    for (var item of data.carrito) {
                        await Carrito.create({
                            cantidad: item.cantidad,
                            producto: item.producto._id,
                            variedad: item.variedad.id,
                            cliente: user._id
                        });
                    }
                }
                // Se almacena la clave (codigo) en la base de datos
                const filtro = { email: data.email };
                const claveGenerada = generarClave(8);
                const actualizacion = { $set: { codigo: claveGenerada } };
                await Cliente.updateOne(filtro, actualizacion);

                enviar_codigo(claveGenerada, data.email)

                res.status(200).send({
                    data: user,
                    message: 'Código enviado, verifica tu correo'
                });
            } else {
                res.status(200).send({ message: 'La contraseña no coincide', data: undefined });
            }
        });
    }
}

const recuperar_pass = async function (req, res) {
    const { email } = req.body;

    try {
        const cliente = await Cliente.findOne({ email: email });

        if (!cliente) {
            return res.status(404).send({ success: false, message: 'Correo no encontrado en la base de datos.' });
        }

        // Generar una nueva contraseña
        const nuevaPass = generarPass(10);

        // Encriptar la nueva contraseña utilizando callback
        bcrypt.hash(nuevaPass, null, null, async function (err, hash) {
            if (err) {
                console.log('Error en la encriptación:', err);
                return res.status(500).send({ success: false, message: 'Error en la encriptación de la contraseña.' });
            }

            // Actualizar la contraseña del usuario en la base de datos
            await Cliente.updateOne({ email: email }, { $set: { password: hash } });

            // Enviar la nueva contraseña por correo electrónico
            await enviar_pass(nuevaPass, email);

            res.status(200).send({ success: true, message: 'Contraseña temporal enviada correctamente.' });
        });
    } catch (error) {
        console.log('Error in recuperar_pass:', error);
        res.status(500).send({ success: false, message: 'Error al procesar la solicitud.' });
    }
};

const obtener_cliente_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        try {
            var reg = await Cliente.findById({ _id: id });

            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_perfil_cliente_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var data = req.body;

        if (data.password) {
            console.log('Con contraseña');
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                console.log(hash);
                var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    telefono: data.telefono,
                    f_nacimiento: data.f_nacimiento,
                    dni: data.dni,
                    password: hash,
                });
                res.status(200).send({ data: reg });
            });

        } else {
            console.log('Sin contraseña');
            var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                nombres: data.nombres,
                apellidos: data.apellidos,
                telefono: data.telefono,
                f_nacimiento: data.f_nacimiento,
                dni: data.dni,
            });
            res.status(200).send({ data: reg });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//---METODOS PUBLICOS----------------------------------------------------

const listar_productos_publico = async function (req, res) {
    let arr_data = [];
    let reg = await Producto.find({ estado: 'Publicado' }).sort({ createdAt: -1 });

    for (var item of reg) {
        let variedades = await Variedad.find({ producto: item._id });
        arr_data.push({
            producto: item,
            variedades: variedades
        });
    }

    res.status(200).send({ data: arr_data });
}

const obtener_variedades_productos_cliente = async function (req, res) {
    let id = req.params['id'];
    let variedades = await Variedad.find({ producto: id });
    res.status(200).send({ data: variedades });
}

const obtener_productos_slug_publico = async function (req, res) {
    var slug = req.params['slug'];
    try {
        let producto = await Producto.findOne({ slug: slug, estado: 'Publicado' });
        if (producto == undefined) {
            res.status(200).send({ data: undefined });
        } else {
            res.status(200).send({ data: producto });
        }
    } catch (error) {
        res.status(200).send({ data: undefined });
    }
}

const listar_productos_recomendados_publico = async function (req, res) {
    var categoria = req.params['categoria'];
    let reg = await Producto.find({ categoria: categoria, estado: 'Publicado' }).sort({ createdAt: -1 }).limit(8);
    res.status(200).send({ data: reg });
}

const agregar_carrito_cliente = async function (req, res) {
    if (req.user) {
        let data = req.body;

        let variedad = await Variedad.findById({ _id: data.variedad });

        if (data.cantidad <= variedad.stock) {
            let reg = await Carrito.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'Stock insuficiente, ingrese otra cantidad' });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_carrito_cliente = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];

        let carrito_cliente = await Carrito.find({ cliente: id }).populate('producto').populate('variedad');
        res.status(200).send({ data: carrito_cliente });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_carrito_cliente = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let reg = await Carrito.findByIdAndRemove({ _id: id });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

module.exports = {
    recuperar_pass,
    reenviar_codigo,
    comprobar_codigo,
    enviar_codigo,
    registro_cliente_tienda,
    listar_clientes_tienda,
    listar_productos_destacados_publico,
    listar_productos_nuevos_publico,
    registro_cliente,
    login_cliente,
    obtener_cliente_guest,
    actualizar_perfil_cliente_guest,
    listar_productos_publico,
    obtener_variedades_productos_cliente,
    obtener_productos_slug_publico,
    listar_productos_recomendados_publico,
    agregar_carrito_cliente,
    obtener_carrito_cliente,
    eliminar_carrito_cliente
}