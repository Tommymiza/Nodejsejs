//Requirements imported and declared
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();
const db = require("./db");
const bodyParser = require("body-parser");
const port = process.env.PORT || 4422;

//View engine set to EJS
app.set("view engine", "ejs");


//Body JSON parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

//Static Route declared middleware
app.use("/assets", express.static("./assets"));

//Session middleware
app.use(
  session({
    secret: "Secret key",
    saveUninitialized: true,
    resave: true,
  })
);

//Session Message middleware
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

//Home Route
app.get("/", (req, res) => {
  const sql = `SELECT id, nom, nbHeure, tauxHoraire, nbHeure * tauxHoraire AS salaire FROM enseignant;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      req.session.message = {
        t: "error",
        m: "Erreur de la requete dans la base de donnée",
      };
      res.render("pages/", { list: [], min: 0, max: 0, somme: 0 });
    } else {
      var min = result.sort((a, b) => a.salaire - b.salaire)[0]?.salaire ?? 0;
      var max = result.sort((a, b) => b.salaire - a.salaire)[0]?.salaire ?? 0;
      var somme = result.reduce((a, curr) => a + curr.salaire , 0);
      res.render("pages/", { list: result, min, max, somme });
    }
  });
});

//update Route
app.get("/update", (req, res) => {
  res.render("pages/update", {
    id: req.query.id,
    nom: req.query.nom,
    nbHeure: req.query.nbHeure,
    tauxHoraire: req.query.tauxHoraire,
  });
});
app.post("/update", (req, res) => {
  const { id, nom, nbHeure, tauxHoraire } = req.body;
  const sql = `UPDATE enseignant SET nom = ?, nbHeure = ?, tauxHoraire = ? WHERE id = ?`;
  db.query(sql, [nom, nbHeure, tauxHoraire, id], (err, result) => {
    if (err) {
      console.log(err);
      req.session.message = {
        t: "error",
        m: "Erreur de la requete dans la base de donnée",
      };
    } else {
      req.session.message = { t: "success", m: "Mis à jour éffectué!" };
    }
    res.redirect(301, "/");
  });
});

//add Route
app.get("/ajout", (req, res) => {
  res.render("pages/ajout");
});
app.post("/ajout", (req, res) => {
  const { nom, nbHeure, tauxHoraire } = req.body;
  const sql = `INSERT INTO enseignant(nom, nbHeure, tauxHoraire) VALUES (?, ?, ?)`;
  db.query(sql, [nom, nbHeure, tauxHoraire], (err, result) => {
    if (err) {
      console.log(err);
      req.session.message = {
        t: "error",
        m: "Erreur de la requete dans la base de donnée",
      };
    } else {
      req.session.message = { t: "success", m: "Ajout éffectué!" };
    }
    res.redirect(301, "/");
  });
});

//delete Route
app.get("/delete", (req, res) => {
  const sql = `DELETE FROM enseignant WHERE id = ?`;
  db.query(sql, [req.query.id], (err, result) => {
    if (err) {
      console.log(err);
      req.session.message = {
        t: "error",
        m: "Erreur de la requete dans la base de donnée",
      };
    } else {
      req.session.message = { t: "success", m: "Suppression éffectuée!" };
    }
    res.redirect(301, "/");
  });
});

//Server Listen
app.listen(port, (err) => {
  if (err) throw new Error("Erreur: " + err);
  console.log("L'application est sur le port:", port);
});
