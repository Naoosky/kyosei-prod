const express = require("express");
const session = require("express-session");
const router = require("./routes/router.js");
const parseurl = require("parseurl");
const http = require("http");

const APP_PORT = 3000;

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 7200000 },
    })
);

app.set("views", "./views");
app.set("view engine", "ejs");
app.set("view options", { pretty: true });

app.use((req, res, next) => {
    res.locals.isAdmin = !!req.session.isAdmin;
    res.locals.isUser = !!req.session.isUser;
    res.locals.userId = req.session.userId;
    next();
});

app.use((req, res, next) => {
    const route = parseurl(req).pathname;

    const adminProtectedRoutes = [
        "/administration",
        "/administration/articles/",
        "/administration/users/",
    ];

    const userProtectedRoutes = [
        "/profile/",
        "/delete/articles/",
        "/delete/items/",
        "/add/articles/",
        "/add/items/",
        "/edit/articles/",
        "/edit/items/",
        "/add_comment/",
    ];

    if (userProtectedRoutes.indexOf(route) > -1 && !req.session.isUser) {
        res.redirect("/");
    } else if (adminProtectedRoutes.indexOf(route) > -1 && !req.session.isAdmin) {
        res.redirect("/");
    } else {
        next();
    }
});

app.use("/", router);

const server = http.createServer(app);

server.listen();
