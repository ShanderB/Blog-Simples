const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
require("../models/Postagem");
const Categoria = mongoose.model("categorias");
const Postagem = mongoose.model("postagens");
const {eAdmin} = require("../helper/eAdmin"); //dentro do JS "eAdmin", vou pegar apenas a função "eAdmin". Vai ser criado a variavel "eAdmin".

router.get("/",  eAdmin, (req, res) => {
    res.render("C:/Users/Asknorvs/Desktop/Programas/Programação/Class/Node/aProjeto/views/admin/admin");
});

router.get("/posts", (req, res) => {
    res.send("Post page")
});

router.get("/categorias", (req, res) => {
    Categoria.find().sort({ date: "desc" }).then((categorias) => {
        res.render("admin/categorias", { categorias: categorias.map(Categoria => Categoria.toJSON()) })
    }).catch((err) => {
        req.flash("error_msg", "Problema com categorias");
        res.redirect("/admin")
    })
});

router.get("/categorias/add", eAdmin,  (req, res) => {
    res.render("admin/addcategorias")
});

router.post("/categorias/nova", eAdmin,  (req, res) => {
    var erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({
            texto: "Nome Inválido"
        });
    }
    if (!req.body.slug || typeof req.body.slug == undefined || typeof req.body.slug == null) {
        erros.push({
            texto: "Slug Inválido"
        });
    }

    if (req.body.nome.length < 2) {
        erros.push({
            texto: "Nome muito pequeno"
        });
    }

    if (erros.length > 0) {
        res.render("../views/admin/addcategorias", { erros: erros })
    } else {


        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug,
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Criado com sucesso");
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar");
            res.redirect("/admin")
        })
    }

});

router.get("/categorias/edit/:id", eAdmin,  (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria });
    }).catch((err) => {
        req.flash("error_msg", "Categoria não existe");
        res.redirect("/admin/categorias")
    })
});

router.post("/categorias/edit", eAdmin,  (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash("success_msg", "Editado com sucesso");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar");
            res.redirect("/admin/categorias");

        })


    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar");
        res.redirect("/admin/categorias");
    })
})

router.post("/categorias/deletar/", eAdmin,  (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada");
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("errors_msg", "Problema ao deletar");
        res.redirect("/admin/categorias")
    });
})

router.get("/postagens", (req, res) => {
    Postagem.find().lean().populate("categorias").sort({ data: "desc" }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens });
    }).catch((err) => {
        req.flash("errors_msg", "Problema ao listar");
        res.redirect("/admin")
    })


});

router.get("/postagens/add",  eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias })

    }).catch((err) => {
        req.flash("errors_msg", "Problema ao carregar formulario");
        res.redirect("/admin")
    });
});

router.post("/postagens/nova", eAdmin,  (req, res) => {

    var erros = [];

    if (req.body.categoria == "0") {
        error.push(({ texto: "Categoria inválida." }))
    }

    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Erro na criação da postagem");
            res.redirect("/admin/postagens");
        })
    }

});


router.get("/postagens/edit/:id", eAdmin,  (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", { categorias: categorias, postagem: postagem })

        }).catch((err) => {
            req.flash("error_msg", "Erro ao listar postagens");
            res.redirect("/admin/postagens");
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar para edição");
        res.redirect("/admin/postagens");
    })

})
router.post("/postagem/edit", eAdmin,  (req, res) => {
        Postagem.findOne({ _id: req.body.id }).then((postagem) => {
            postagem.titulo = req.body.titulo;
            postagem.slug = req.body.slug;
            postagem.descricao = req.body.descricao;
            postagem.conteudo = req.body.conteudo;
            postagem.categoria = req.body.categoria;


            postagem.save().then(() => {
                req.flash("success_msg", "Editado com sucesso");
                res.redirect("/admin/postagens");
            }).catch((err) => {
                
                req.flash("error_msg", "Erro interno");
            console.log(err)

                res.redirect("/admin/postagens");
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar edição");
            res.redirect("/admin/postagens");
        })
})
router.get("/postagens/deletar/:id", eAdmin,  (req, res) => {
    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Deletado com sucesso")
        res.redirect("/admin/postagens");
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar edição");
        res.redirect("/admin/postagens");
    });
})



module.exports = router;