const express = require('express');
const Router = require('express');
const bodyParser = require('body-parser');
const {checkToken: Auth}=require("./src/middlewares/tokenCheck")

const api = require('./api')
const app = express();
const userRouter =require("./src/components/auth/auth.route")
const adminRouter =require("./src/components/admin/admin.route")
const router = Router();

// app.use();
// app.use(api.routes());

app.set('x-powered-by', false);
app.set('etag', false);
app.use(express.json());
app.set('trust proxy', 2);
app.set('json spaces', 2);

const bodySizeLimit = '200 kb';
app.use(bodyParser.json({ limit: bodySizeLimit }));
app.use(bodyParser.urlencoded({ limit: bodySizeLimit, extended: true }));

// use diff routers
// use api
router.use('/Home',Auth, api);
router.use('/user', userRouter);
router.use('/admin', adminRouter);

app.use(function serveAllRoutes(req, res, next) {
    router(req, res, next);
});


module.exports = app;