import { Router } from 'fluvial';
import { usersPath, UsersRouter } from './users.router.js';
import { messagesPath, MessagesRouter } from './messages.router.js';

const ApiRouter = Router();

ApiRouter.use(usersPath, UsersRouter);
ApiRouter.use(messagesPath, MessagesRouter);

ApiRouter.catch((err, req, res) => {
    if (err?.type == 'unauthorized') {
        res.status(401).send({
            message: `Credentials invalid or missing`,
        });
    }
});

/**
 * @param {import('fluvial').Application} app 
 */
export function addGlobalRoutes(app) {
    app.use('/api', ApiRouter);
}
