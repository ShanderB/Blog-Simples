//Modulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser"); //middleware. Receber dados de formulários
const mongoose = require("mongoose"); //colocar dados no mongodb
const app = express(); //abrir conexão
const admin = require("./routes/admin");
const path = require("path"); //trabalhar com diretorios
const session = require("express-session"); //guarda os cookies
const flash = require("connect-flash"); //guardar a sessão (Mensagem success fica enquanto não resetar)
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario")
const passport = require("passport");
require("./config/auth")(passport)

//configs 

// sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// middleWare
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;    //vai armazenar dados do usuário logado criado pelo passport. Se for "Null", recebe null.
    next();
})



//parser. Vai "segurar a informação no middleware" para ser utilizado em outros pontos do programa.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//handlebars 
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


//Mongoose 
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Conectado Banco");
}).catch((err) => {
    console.log(err);
});

//Public
app.use(express.static(path.join(__dirname + "/public/")));
app.use((req, res, next) => {
    next();
})

//rotas
app.get("/", (req, res) => {
    Postagem.find().lean().populate("categorias").sort({ data: "desc" }).then((postagens) => {
        res.render("index", { postagens: postagens });

    }).catch((err) => {
        req.flash("error_msg", "Problema na rota /")
        res.redirect("/404")
    });
})


app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).populate("categoria").sort({ data: "desc" }).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", { postagem: postagem });
        } else {
            req.flash("error_msg", "Postagem Inexistente");
            res.redirect("/");
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro");
        res.redirect("/");
    })

})


app.get("/404", (req, res) => {
    res.send("Erro 404!");
})

app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", { categorias: categorias })
    }).catch(err => {
        req.flash("error_msg", "Erro ao listar categorias")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render("categorias/postagens", { postagens: postagens, categoria: categoria })
            }).catch(err => {
                req.flash("error_msg", "Erro ao listar post")
                res.redirect("/")
            })

        } else {
            req.flash("error_msg", "Categoria não existe")
            res.redirect("/")
        }
    }).catch(err => {
        req.flash("error_msg", "Erro ao carregar página da categoria")
        res.redirect("/")
    })
})






app.use("/admin", admin);
app.use("/usuarios", usuarios);

//Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log("Servidor rodando.");
})
