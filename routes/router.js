const express = require("express");
const router = express.Router();

const homeController = require('../controllers/homeController.js');
const privacyPolicyController = require("../controllers/privacyPolicyController.js");
const registerController = require('../controllers/registerController.js');
const loginController = require('../controllers/loginController.js');
const adminController = require('../controllers/adminController.js');
const forumController = require('../controllers/forumController.js');
const auctionController = require('../controllers/auctionController.js');
const profilController = require('../controllers/profilController.js');

router.get('/', homeController.home);

router.get('/administration', adminController.admin);
router.get('/administration/users/:id', adminController.usersProfil);

router.get('/forum', forumController.listArticles);
router.get('/articles/:id', forumController.articlesDetails);
router.get('/add/articles/:id', forumController.addArticles);
router.get('/edit/articles/:id', forumController.editArticle);
router.post('/add/articles/:id', forumController.addArticlesSubmit);
router.post('/edit/articles/:id', forumController.editArticleSubmit);
router.post('/add_comment/:id', forumController.addComments);
router.post('/search/articles', forumController.searchArticles);

router.get('/auction', auctionController.listItems);
router.get('/add/items/:id', auctionController.addItems);
router.get('/edit/items/:id', auctionController.editItems);
router.post('/add/items/:id', auctionController.addItemsSubmit);
router.post('/edit/items/:id', auctionController.editItemsSubmit);
router.post('/search/items', auctionController.searchItems);

router.get('/login', loginController.login);
router.get('/register', registerController.register);
router.get('/logout', loginController.logOut);
router.get('/profile/:id', profilController.profile);
router.get('/setting/profile/:id', profilController.profilSetting);
router.get('/setting/edit-profile/:id', profilController.editProfil);
router.get('/setting/edit-password/:id', profilController.editPassword);
router.post('/login', loginController.loginSubmit);
router.post('/register', registerController.registerSubmit);
router.post('/setting/edit-profile/:id', profilController.editProfilSubmit);
router.post('/setting/edit-password/:id', profilController.editPasswordSubmit);
router.delete('/delete/articles/:id', profilController.deleteArticle);
router.delete('/delete/items/:id', profilController.deleteItem);
router.delete('/delete/users/:id', adminController.deleteUser);
router.get('/delete/user/:id', adminController.deleteUser);

router.get('/privacyPolicy', privacyPolicyController.privacyPolicy);

router.all('/*', (req, res) => {
    res.render('notFound');
});

module.exports = router;
