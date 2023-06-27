const pool = require("../config/database.js");

exports.home = (req, res) => {
    let sql = `
        SELECT articles.id, articles.title, articles.description, category_articles.name as 'category'
        FROM articles
                 INNER JOIN category_articles ON articles.category_id = category_articles.id
        ORDER BY articles.date DESC
        LIMIT 5
    `;

    pool.query(sql, (error, articles) => {
        if (error) {
            console.error(error);
        } else {
            let sql2 = `SELECT u.pseudo, i.url, i.description, items.price, items.id
                        FROM items
                                 INNER JOIN users u on items.user_id = u.id
                                 INNER JOIN images i on items.image_id = i.id
                        LIMIT 5`;

            pool.query(sql2, (error, items) => {
                if (error) {
                    console.error(error);
                } else {
                    res.render('layout', {template: 'home', items: items, articles: articles});
                }
            });
        }
    });
};
