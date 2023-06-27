const pool = require("../config/database.js");
const { v4: uuidV4 } = require('uuid');
const xss = require("xss");

exports.listItems = (req, res) => {
    let sql = `SELECT *
                FROM items
                INNER JOIN images ON image_id = images.id
                INNER JOIN category_items ON category_id = category_items.id
                INNER JOIN users ON user_id = users.id`;

    pool.query(sql, function (error, items) {
        if (error) {
            console.error(error);
            res.status(500).send('erreur de bdd');
        } else {
            res.render('layout', { template: 'listItems', items: items });
        }
    });
};

exports.searchItems = (req, res) => {
    const search = req.body.search;
    let sql = `SELECT *
                FROM items
                INNER JOIN images ON image_id = images.id
                INNER JOIN category_items ON category_id = category_items.id
                INNER JOIN users ON user_id = users.id
                WHERE category_items.name LIKE '%${search}%' `;
    pool.query(sql, function (error, items) {
        if (error) {
            console.error(error);
            res.status(500).send('erreur de bdd');
        } else {
            res.render('layout', { template: 'listItems', items: items });
        }
    });
};

exports.addItems = (req, res) => {
    let id = req.session.userId;

    if (!id) {
        res.redirect('/login');
    } else {
        let sql = "SELECT * FROM images";
        pool.query(sql, function (error, images) {
            if (error) {
                console.error(error);
                res.status(500).send('erreur de bdd');
            } else {
                let query = "SELECT * FROM users WHERE id = ?";
                pool.query(query, id, function (error, user) {
                    if (error) {
                        console.error(error);
                        res.status(500).send('erreur de bdd');
                    } else {
                        let sql2 = "SELECT * FROM category_items";
                        pool.query(sql2, function (error, category) {
                            if (error) {
                                console.error(error);
                                res.status(500).send('erreur de bdd');
                            } else {
                                res.render('layout', {
                                    template: 'addItems',
                                    images: images,
                                    user: user[0],
                                    category: category,
                                    error: null
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

exports.addItemsSubmit = (req, res) => {
    let id = req.session.userId;

    let sql = "SELECT * FROM images";
    pool.query(sql, function (error, images) {
        if (error) {
            console.error(error);
            res.status(500).send('erreur de bdd');
        } else {
            let query = "SELECT * FROM users WHERE id = ?";
            pool.query(query, id, function (error, user) {
                if (error) {
                    console.error(error);
                    res.status(500).send('erreur de bdd');
                } else {
                    let sql2 = "SELECT * FROM category_items";
                    pool.query(sql2, function (error) {
                        if (error) {
                            console.error(error);
                            res.status(500).send('erreur de bdd');
                        } else {
                            const { title, content, price, category, image } = req.body;

                            const safeTitle = xss(title);
                            const safeContent = xss(content);
                            const safePrice = xss(price);

                            if (safeTitle.length < 3 || safeTitle.length > 30) {
                                res.render('layout', {
                                    template: 'addItems',
                                    images: images,
                                    user: user[0],
                                    category: category,
                                    error: 'le titre doit contenir entre 3 et 30 caractères'
                                });

                            } else if (safeContent.length < 3 || safeContent.length > 255) {
                                res.render('layout', {
                                    template: 'addItems',
                                    images: images,
                                    user: user[0],
                                    category: category,
                                    error: 'la description doit contenir entre 3 et 255 caractères'
                                });

                            } else if (safePrice.length < 1 || safePrice.length > 10 || safePrice < 0 || safePrice > 999999999) {
                                res.render('layout', {
                                    template: 'addItems',
                                    images: images,
                                    user: user[0],
                                    category: category,
                                    error: 'le prix doit contenir entre 1 et 10 nombre et ne peut être négatif'
                                });

                            } else if (category === "0") {
                                res.render('layout', {
                                    template: 'addItems',
                                    images: images,
                                    user: user[0],
                                    category: category,
                                    error: 'veuillez choisir une catégorie'
                                });

                            } else if (image === undefined) {
                                res.render('layout', {
                                    template: 'addItems',
                                    images: images,
                                    user: user[0],
                                    category: category,
                                    error: 'veuillez choisir une image'
                                });

                            } else {
                                let newItems = {
                                    id: uuidV4(),
                                    title: safeTitle,
                                    content: safeContent,
                                    price: safePrice,
                                    category_id: category,
                                    image_id: image,
                                    user_id: id
                                };

                                let sql3 = `INSERT INTO items
                                            SET ? `;
                                pool.query(sql3, [newItems], function (error) {
                                    if (error) {
                                        console.error(error);
                                        res.status(500).send('erreur de bdd');
                                    } else {
                                        res.redirect('/profile/' + id);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
};

exports.editItems = (req, res) => {
    let id = req.params.id;
    let userId = req.session.userId;

    let sql = 'SELECT * FROM items WHERE id = ?';

    pool.query(sql, [id], (error, item) => {
        if (error) {
            console.error(error);
        } else {

            if (item[0].user_id !== userId) {
                res.redirect('/profile/' + userId);
            } else {
                let sql2 = 'SELECT * FROM images';

                pool.query(sql2, (error, images) => {
                    if (error) {
                        console.error(error);
                    } else {
                        let sql3 = 'SELECT * FROM category_items';

                        pool.query(sql3, (error, category) => {
                            res.render('layout', {
                                template: 'editItems',
                                images: images,
                                item: item[0],
                                category: category,
                                error: null
                            });
                        });
                    }
                });
            }
        }
    });
};

exports.editItemsSubmit = (req, res) => {
    let id = req.params.id;
    let userId = req.session.userId;

    let sql = 'SELECT * FROM items WHERE id = ?';

    pool.query(sql, [id], (error, item) => {
        if (error) {
            console.error(error);
        } else {
            let sql2 = 'SELECT * FROM images';

            pool.query(sql2, (error, images) => {
                if (error) {
                    console.error(error);
                } else {
                    let sql3 = 'SELECT * FROM category_items';

                    pool.query(sql3, (error, category) => {
                        const { title, content, price, categories, image } = req.body;

                        const safeTitle = xss(title);
                        const safeContent = xss(content);
                        const safePrice = xss(price);

                        if (safeTitle.length < 3 || safeTitle.length > 30) {
                            res.render('layout', {
                                template: 'editItems',
                                images: images,
                                item: item[0],
                                category: category,
                                error: 'le titre doit contenir entre 3 et 30 caractères'
                            });

                        } else if (safeContent.length < 3 || safeContent.length > 255) {
                            res.render('layout', {
                                template: 'editItems',
                                images: images,
                                item: item[0],
                                category: category,
                                error: 'la description doit contenir entre 3 et 255 caractères'
                            });

                        } else if (safePrice.length < 1 || safePrice.length > 10 || safePrice < 0 || safePrice > 999999999) {
                            res.render('layout', {
                                template: 'editItems',
                                images: images,
                                item: item[0],
                                category: category,
                                error: 'le prix doit contenir entre 1 et 10 nombre et ne peut être négatif'
                            });

                        } else if (categories === "0") {
                            res.render('layout', {
                                template: 'editItems',
                                images: images,
                                item: item[0],
                                category: category,
                                error: 'veuillez choisir une catégorie'
                            });

                        } else if (image === undefined) {
                            res.render('layout', {
                                template: 'editItems',
                                images: images,
                                item: item[0],
                                category: category,
                                error: 'veuillez choisir une image'
                            });

                        } else {
                            let editItems = {
                                title: safeTitle,
                                content: safeContent,
                                price: safePrice,
                                category_id: categories,
                                image_id: image
                            };
                            let sql3 = "UPDATE items SET ? WHERE id = ?";
                            pool.query(sql3, [editItems, id], function (error) {
                                if (error) {
                                    console.error(error);
                                    res.status(500).send('erreur de bdd');
                                } else {
                                    res.redirect('/profile/' + userId);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};
