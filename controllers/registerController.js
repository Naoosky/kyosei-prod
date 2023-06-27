const pool = require("../config/database.js");
const { v4: uuidV4 } = require('uuid');
const xss = require('xss');
const bcrypt = require("bcrypt");

exports.register = (req, res) => {
    res.render('layout', { template: 'register', error: null });
};

exports.registerSubmit = function (req, res) {
    const { email, pseudo, password, confirmPassword } = req.body;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$/;
    const inputRegex = /^[a-zA-Z0-9\s]+$/;

    const safeEmail = xss(email);
    const safePseudo = xss(pseudo);
    const safePassword = xss(password);
    const safeConfirmPassword = xss(confirmPassword);

    if (!emailRegex.test(safeEmail)) {
        return res.render('layout', { template: 'register', error: 'L\'email n\'est pas valide' });
    }
    if (safePseudo.length < 3 || !inputRegex.test(safePseudo)) {
        return res.render('layout', {
            template: 'register',
            error: 'Le pseudo doit contenir au moins 3 caractères et ne doit pas contenir de caractères spéciaux'
        });
    }
    if (safePassword.length < 8) {
        return res.render('layout', {
            template: 'register',
            error: 'Le mot de passe doit contenir au moins 8 caractères'
        });
    }
    if (safeConfirmPassword !== safePassword) {
        return res.render('layout', { template: 'register', error: 'Les mots de passe ne correspondent pas' });
    }

    bcrypt.hash(safePassword, 10, function (error, hash) {
        if (error) {
            console.log(error);
        } else {
            const newUsers = {
                id: uuidV4(),
                pseudo: safePseudo,
                email: safeEmail,
                password: hash,
                role: "Membre"
            };

            let sql = 'SELECT * FROM users';

            pool.query(sql, (error, user) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Erreur de base de données');
                } else {
                    for (let i = 0; i < user.length; i++) {
                        if (safePseudo === user[i].pseudo) {
                            return res.render('layout', { template: 'register', error: "Email ou Pseudo deja utilisé" });
                        } else if (safeEmail === user[i].email) {
                            return res.render('layout', { template: 'register', error: "Email ou Pseudo deja utilisé" });
                        }
                    }

                    let query = "INSERT INTO users SET ? ";

                    pool.query(query, [newUsers], function (error) {
                        if (error) {
                            console.error(error);
                            res.status(500).send('Erreur de base de données');
                        } else {
                            req.session.isUser = true;
                            req.session.userId = newUsers.id;
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });
};