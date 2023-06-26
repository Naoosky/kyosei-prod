import pool from "../config/database.js";

export const admin = (req, res) => {
    if (!req.session.isAdmin) {
        res.redirect('/')
    } else {
        let sql = ` SELECT *
                    FROM users`;
        pool.query(sql, (error, users) => {
            if (error) {
                console.error(error)
            } else {
                let query = "SELECT * FROM articles";
                pool.query(query, (error, articles) => {
                    if (error) {
                        console.error(error)
                    } else {
                        res.render('layout', {template: 'admin', users: users, articles: articles});
                    }
                });
            }
        });
    }
}

export const usersProfil = (req, res) => {
    if (!req.session.isAdmin) {
        res.redirect('/')
    } else {
        const id = req.params.id;
        let query = "SELECT * FROM users WHERE id = ?";
        pool.query(query, [id], function (error, result) {
            if (error) {
                console.error(error)
                res.status(500).send('erreur de bdd')
            } else {
                const query = "SELECT * FROM articles WHERE user_id = ?";
                pool.query(query, [id], (error, articles) => {
                    if (error) {
                        console.error(error)
                    } else {
                        let sql = "SELECT items.id, items.title, items.content, items.price, images.url, images.description FROM items INNER JOIN images ON image_id = images.id WHERE user_id = ?";
                        pool.query(sql, [id], function (error, items) {
                            if (error) {
                                console.error(error)
                                res.status(500).send('erreur de bdd')
                            } else {
                                res.render('layout', {
                                    template: 'usersProfil',
                                    user: result[0],
                                    items: items,
                                    articles: articles
                                })
                            }
                        });
                    }
                });
            }
        });
    }
}

export const deleteUser = (req, res) => {
    const id = req.params.id;

    if (!req.session.isAdmin && req.session.userId !== id) {
        res.status(403).send('Forbidden');
    } else {
        let sql = `DELETE FROM users WHERE id = ?`;
        pool.query(sql, id, function (error) {
            if (error) {
                console.log(error);
                res.status(500).send({
                    error: 'Error when deleting user'
                });
            } else {
                res.status(200).send();
            }
        });
    }
}