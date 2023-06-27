const pool = require("../config/database.js");
const bcrypt = require("bcrypt");
const xss = require("xss");

exports.profile = (req, res) => {
    let id = req.session.userId;
    if (!id) {
        res.redirect('/');
    } else {
        let query = "SELECT * FROM users WHERE id = ?";
        pool.query(query, [id], function (error, result) {
            if (error) {
                console.error(error);
                res.status(500).send('erreur de bdd');
            } else {
                const query = "SELECT * FROM articles WHERE user_id = ?";
                pool.query(query, [id], (error, articles) => {
                    if (error) {
                        console.error(error);
                    } else {
                        let sql = `SELECT items.id,
                                          items.title,
                                          items.content,
                                          items.price,
                                          images.url,
                                          images.description
                                   FROM items
                                            INNER JOIN images ON image_id = images.id
                                   WHERE user_id = ?`;
                        pool.query(sql, [id], function (error, items) {
                            if (error) {
                                console.error(error);
                                res.status(500).send('erreur de bdd');
                            } else {
                                res.render('layout', {
                                    template: 'profile',
                                    user: result[0],
                                    items: items,
                                    articles: articles
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

exports.deleteArticle = (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId;

    let sql = 'SELECT * FROM articles WHERE id = ?';
    pool.query(sql, [id], function (error, result) {
        if (error) {
            console.error(error);
            res.status(500).send('erreur de bdd');
        } else {
            if (req.session.isAdmin) {
                let sql2 = ` DELETE
                         FROM articles
                         WHERE id = ?`;
                pool.query(sql2, [id], function (error) {
                    if (error) {
                        console.log(error);
                        res.status(500).send({
                            error: 'Error when delete post'
                        });
                    } else {
                        res.status(204).send();
                    }
                });
            } else if (result[0].user_id === userId) {
                let sql2 = ` DELETE
                         FROM articles
                         WHERE id = ?`;
                pool.query(sql2, [id], function (error) {
                    if (error) {
                        console.log(error);
                        res.status(500).send({
                            error: 'Error when delete post'
                        });
                    } else {
                        res.status(204).send();
                    }
                });
            } else {
                res.status(403).send('Forbidden');
            }
        }
    });
};

exports.deleteItem = (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId;

    let sql = 'SELECT * FROM items WHERE id = ?';
    pool.query(sql, [id], function (error, result) {
        if (error) {
            console.error(error);
            res.status(500).send('erreur de bdd');
        } else {
            if (req.session.isAdmin) {
                let sql2 = ` DELETE
                         FROM items
                         WHERE id = ?`;
                pool.query(sql2, [id], function (error) {
                    if (error) {
                        console.log(error);
                        res.status(500).send({
                            error: 'Error when delete post'
                        });
                    } else {
                        res.status(204).send();
                    }
                });
            } else if (result[0].user_id === userId) {
                let sql2 = ` DELETE
                         FROM items
                         WHERE id = ?`;
                pool.query(sql2, [id], function (error) {
                    if (error) {
                        console.log(error);
                        res.status(500).send({
                            error: 'Error when delete post'
                        });
                    } else {
                        res.status(204).send();
                    }
                });
            } else {
                res.status(403).send('Forbidden');
            }
        }
    });
};

exports.profilSetting = (req, res) => {
    const id = req.params.id;
    if (req.session.userId !== id) {
        res.redirect('/');
    } else {
        let sql = `SELECT *
                     FROM users
                    WHERE id = ?
        `;
        pool.query(sql, [id], (error, user) => {
            if (error) {
                console.error(error);
            } else {
                res.render('layout', { template: 'profilSetting', user: user[0] });
            }
        });
    }
};

exports.editProfil = (req, res) => {
    const id = req.params.id;
    if (req.session.userId !== id) {
        res.redirect('/');
    } else {
        let sql = `SELECT * 
                     FROM users
                    WHERE id = ?
        `;
        pool.query(sql, [id], (error, user) => {
            if (error) {
                console.error(error);
            } else {
                res.render('layout', { template: 'editProfil', user: user[0], error: null });
            }
        });
    }
};

exports.editProfilSubmit = (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId;

    if (req.session.userId !== id) {
        res.redirect('/');
    } else {
        let sql = `SELECT * 
                     FROM users
                    WHERE id = ?
        `;
        pool.query(sql, [id], (error, user) => {
            if (error) {
                console.error(error);
            } else {
                const { pseudo, email, password } = req.body;
                const safePseudo = xss(pseudo);
                const safeEmail = xss(email);
                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$/;
                const inputRegex = /^[a-zA-Z0-9\s]+$/;

                if (!emailRegex.test(safeEmail)) {
                    return res.render('layout', { template: 'editProfil', user: user[0], error: "votre email n'est pas correct" });
                }
                if (safePseudo.length < 3 || !inputRegex.test(safePseudo)) {
                    return res.render('layout', { template: 'editProfil', user: user[0], error: "votre pseudo n'est pas correct" });
                }

                bcrypt.compare(password, user[0].password, (error, isAllowed) => {
                    if (isAllowed) {
                        const editProfil = {
                            pseudo: safePseudo,
                            email: safeEmail,
                        };
                        let sql2 = 'UPDATE users SET ? WHERE id = ?';
                        pool.query(sql2, [editProfil, userId], (error) => {
                            if (error) {
                                console.error(error);
                            } else {
                                res.redirect('/profile/' + userId);
                            }
                        });
                    } else {
                        res.render('layout', { template: 'editProfil', error: "Le mot de passe n'est pas correct" });
                    }
                });

            }
        });

    }
};

exports.editPassword = (req, res) => {
    const id = req.params.id;
    if (req.session.userId !== id) {
        res.redirect('/');
    } else {
        let sql = 'SELECT * FROM users WHERE id = ?';
        pool.query(sql, [id], (error, user) => {
            if (error) {
                console.error(error);
            } else {
                res.render('layout', { template: 'editPassword', user: user[0], error: null });
            }
        });
    }
};

exports.editPasswordSubmit = (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId;
    if (userId !== id) {
        res.redirect('/');
    } else {
        let sql = 'SELECT * FROM users WHERE id = ?';
        pool.query(sql, [id], (error, user) => {
            if (error) {
                console.error(error);
            } else {
                const { oldPassword, newPassword, confirmPassword } = req.body;

                bcrypt.compare(oldPassword, user[0].password, (error, isAllowed) => {
                    if (isAllowed) {

                        const safeNewPassword = xss(newPassword);

                        if (safeNewPassword !== confirmPassword) {
                            res.render('layout', { template: 'editPassword', user: user[0], error: "la confirmation ne correspond pas" });
                        }
                        bcrypt.hash(safeNewPassword, 10, (error, hash) => {
                            if (error) {
                                console.error(error);
                            } else {
                                const newPassword = {
                                    password: hash
                                };
                                let sql2 = 'UPDATE users SET ? WHERE id = ?';
                                pool.query(sql2, [newPassword, userId], (error) => {
                                    if (error) {
                                        console.error(error);
                                    } else {
                                        res.redirect('/profile/' + userId);
                                    }
                                });
                            }
                        });
                    } else {
                        res.render('layout', { template: 'editProfil', user: user[0], error: "L'ancien mot de passe n'est pas correct" });
                    }
                });

            }
        });
    }
};
