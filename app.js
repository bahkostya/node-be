/* eslint import/imports-first:0  import/newline-after-import:0 */
import path          from 'path';

import bluebird from 'bluebird';
global.Promise = bluebird;

import express       from 'express';
import cors          from 'cors';
import bodyParser    from 'body-parser';
import logger        from 'bunyan-singletone-facade';
import Emb           from 'express-markdown-browser';
import multipart     from 'connect-multiparty';
import routesInit    from './lib/routes';
import { appPort }   from './etc/config.json';

import './lib/registerValidationRules';

const routes = routesInit();
const app    = express();
const router = express.Router();
const multipartMiddleware = multipart();
const emb = new Emb({ path: path.join(__dirname, 'apidoc') });

console.log(`APP STARTING ATT PORT ${appPort}`);

logger.init({
    directory : path.join(__dirname, 'logs'),
    name      : 'modern-node-be'
});

app.use(bodyParser.json({ limit  : 1024 * 1024,
    verify : (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.send({
                status : 0,
                error  : {
                    code    : 'BROKEN_JSON',
                    message : 'Please, verify your json'
                }
            });
        }
    }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' })); // We allow any origin because we DO NOT USE cookies and basic auth
app.use(multipartMiddleware);

const checkSession = routes.sessions.check;

app.listen(appPort);

app.use('/api/v1', router);
app.use('/apidoc', emb);

// Actions
router.post('/actions/:id', routes.actions.submit);

// Users
router.post('/users',               routes.users.create);
router.post('/users/resetPassword', routes.users.resetPassword);
router.get('/users/:id', checkSession, routes.users.show);
router.get('/users',     checkSession, routes.users.list);
router.put('/users/:id', checkSession, routes.users.update);

// Contacts email
router.post('/contacts', routes.contacts.send);

// Sessions
router.post('/sessions', routes.sessions.create);

// Images
router.post('/images', checkSession, routes.images.create);

// News
router.post('/news',       checkSession, routes.news.create);
router.delete('/news/:id', checkSession, routes.news.delete);
router.get('/news',                      routes.news.list);
router.get('/news/:id',                  routes.news.show);
router.put('/news/:id',    checkSession, routes.news.update);

export default app;
