const express = require("express");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const router = express.Router();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const Usuarios = require("./routes/usuario");
const passport = require('passport');
require('./config/auth')(passport);

const PORT = 8081;

// Configurar
//Sessao
app.use(session({
    secret: "Skidiio20",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize())
app.use(passport.session());
app.use(flash());

//Midleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error =req.flash("error");
  res.locals.user =req.user || null;
  next();
 
});

//BodyPerser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar o mecanismo de visualização Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars"); // Corrija 'views engine' para 'view engine'

//Mongoose
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("Conectado com sucesso mongodb");
  })
  .catch((err) => {
    console.log("Erro ao se conectar " + err);
  });
//Public

app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.get("/", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
  const slug = req.params.slug;
  Postagem.findOne({ slug })
    .then((postagem) => {
      if (postagem) {
        const post = {
          titulo: postagem.titulo,
          data: postagem.data,
          conteudo: postagem.conteudo,
        };
        res.render("postagem/index", post);
      } else {
        req.flash("error_msg", "Essa postagem nao existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/categorias",(req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render("categorias/index", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao listar as categorias")
        res.redirect("/")
    })
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria })
          .then((postagens) => {
            res.render("categorias/postagens", { postagens: postagens });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as postagens");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Essa categoria não existe");
        res.redirect("/");
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao tentar carregar as categorias");
      res.redirect("/");
    });
  });
  



app.get("/404", (req, res) => {
  res.send("Página não encontrada");
});

app.get("/post", (req, res) => {
  res.send("Listas");
});

app.use("/admin", admin);
app.use("/usuarios", Usuarios)

// Outros
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
