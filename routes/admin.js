const express = require('express');
const mongoose  = require('mongoose');
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
const router = express.Router();
const session = require('express-session');
const flash = require("connect-flash");
const e = require('connect-flash');
require("../models/postagem");
const Postagem = mongoose.model("postagens");
const {eAdmin}= require("../helpers/eAdmin")






router.get('/', eAdmin,(req, res) => {
    res.render("admin/index");
  });

router.get("/Post", eAdmin,(req, res)=>{
    res.send("Pagina de posts test")
})


router.get("/categoria/add",  (req, res) => {
    res.render("admin/addcategoria");
});




//Rota de categoria//
//                 //
//Rota de categoria//

router.post("/categoria/nova", eAdmin,(req, res)=>{


  var erros =[]

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
    erros.push({textos:"nome invalido"})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({textos:"Slug invalido"})
  }

  if(req.body.nome.length < 2){
    erros.push({textos:"Nome da categoria muito pequeno"})
  }
  if(erros.length > 0){
  res.render("admin/addcategoria",{erros:erros})

} else{
  const novaCategoria = {
    nome: req.body.nome,
    slug:req.body.slug
  }


  new Categoria(novaCategoria).save().then(()=>{
    req.flash("success_msg", "Categoria criada com sucesso"),
    res.redirect("/admin/categoria");
  }).catch((err)=>{
    req.flash("error_msg", "Houve um ao salvar a categoria, tente novamente!"),
    res.redirect("/admin/categoria");
  })
}

})

router.get("/categoria",eAdmin,(req, res)=> {
  Categoria.find().sort({date:'desc'}).then((categoria) =>{
     res.render("admin/categoria", {categoria:categoria})
   }).catch((err)=>{
     req.flash("error_msg","Houve um erro ao listar as categoria")
     res.redirect("/admin")
   })
})
 

router.get("/categoria/edit/:id",eAdmin,(req, res)=>{
  Categoria.findOne({_id:req.params.id}).then((categoria)=>{
     res.render("admin/editecategoria",{categoria:categoria})
  }).catch((err)=>{
    res.flash("error_msg", "Esta categoria nao existe")
    res.redirect("/admin/categoria")
  })
 
})

router.post("/categoria/deletar", eAdmin,(req, res)=>{
  Categoria.deleteOne({_id: req.body.id}).then(()=>{
    req.flash("success_msg", "categoria deletada"),
    res.redirect("/admin/categoria")
  }).catch((err)=>{
    req.flash("error_msg", "Erro ao deletar categoria")
    res.redirect("/admin/categoria")
  })
});

//Rota de postagens de categoria//
//                              //
//Rota de Postagens de categoria//



router.get("/postagens/add", eAdmin,(req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/addpostagem", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});

router.post("/postagens/nova",eAdmin,(req, res) => {
  var erros = [];

  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria inválida, registre uma categoria" });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug,
    };

    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao criar postagem");
        res.redirect("/admin/postagens/add"); // Redirecionar para a página de adição de postagem em caso de erro
      });
  }
});

router.get("/postagens", eAdmin,(req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as postagens");
      res.render("admin/postagens"); // Renderize a página de postagens mesmo em caso de erro
    });
});

// Rota para carregar a página de edição de postagem
router.get("/postagens/edit/:id",eAdmin,(req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .then((postagem) => {
      Categoria.find()
        .then((categorias) => {
          res.render("admin/editpostagens", { categorias: categorias, postagem: postagem });
        })
        .catch((error_msg) => {
          req.flash("error_msg", "Houve um erro ao listar categorias");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
      res.redirect("/admin/postagens");
    });
});

// Rota para atualizar a postagem
router.post("/postagens/edit",eAdmin,(req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.slug;
      postagem.descricao = req.body.descricao;
      postagem.conteudo = req.body.conteudo;
      postagem.categoria = req.body.categoria;

      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro ao editar postagem");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a postagem");
      res.redirect("/admin/postagens");
    });
});

 
 router.get("/postagens/deletar/:id",eAdmin,(req, res)=>{
  Postagem.deleteOne({_id: req.params.id}).then(()=>{
    res.redirect("/admin/postagens")
  })
 }) 
   


module.exports = router;