// Import des modules requis
const express = require("express");
const session = require("express-session");
const router = require("./routes/router.js");
const parseurl = require("parseurl");
const http = require("http");

// Création de l'application Express
const app = express();

// Middleware pour servir les fichiers statiques depuis le répertoire "public"
app.use(express.static("public"));

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Middleware pour parser les requêtes URL encodées
app.use(express.urlencoded({ extended: true }));

// Middleware pour gérer les sessions avec des options de configuration
app.use(
    session({
        secret: process.env.SECRET_KEY, // Clé secrète pour signer les cookies de session
        resave: false, // Ne pas sauvegarder la session à chaque requête
        saveUninitialized: true, // Sauvegarder les sessions non initialisées
        cookie: { maxAge: 7200000 }, // Durée de validité des cookies de session (2 heures)
    })
);

// Configuration des répertoires de vues et du moteur de template EJS
app.set("views", "./views");
app.set("view engine", "ejs");
app.set("view options", { pretty: true });

// Middleware pour définir des variables locales disponibles dans les templates
app.use((req, res, next) => {
    res.locals.isAdmin = !!req.session.isAdmin; // Variable locale indiquant si l'utilisateur est un administrateur
    res.locals.isUser = !!req.session.isUser; // Variable locale indiquant si l'utilisateur est un utilisateur authentifié
    res.locals.userId = req.session.userId; // ID de l'utilisateur stocké dans la session
    next();
});

// Middleware pour la protection des routes basée sur le chemin d'accès de la requête
app.use((req, res, next) => {
    const route = parseurl(req).pathname;

    const adminProtectedRoutes = [
        "/administration",
        "/administration/articles/",
        "/administration/users/",
        "/delete/users/",
    ];

    const userProtectedRoutes = [
        "/profile/",
        "/delete/articles/",
        "/delete/items/",
        "/delete/user/",
        "/add/articles/",
        "/add/items/",
        "/edit/articles/",
        "/edit/items/",
        "/add_comment/",
    ];

    // Vérifier si l'utilisateur non authentifié tente d'accéder à des routes protégées
    if (userProtectedRoutes.indexOf(route) > -1 && !req.session.isUser) {
        res.redirect("/");
    }
    // Vérifier si un utilisateur non administrateur tente d'accéder à des routes protégées pour les administrateurs
    else if (adminProtectedRoutes.indexOf(route) > -1 && !req.session.isAdmin) {
        res.redirect("/");
    }
    // Si aucune protection n'est requise, passer au middleware suivant
    else {
        next();
    }
});

// Utilisation du routeur défini dans "./routes/router.js"
app.use("/", router);

// Création du serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Écoute du serveur sur un port spécifique (à définir)
server.listen();
