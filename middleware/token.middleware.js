import { users } from '../routers/users.router.js';

export function checkToken() {
    /**
     * @param {import('fluvial').Request} req
     * @param {import('fluvial').Response} res
     * @returns {'next'}
     */
    return (req, res) => {
        const { authorization: creds } = req.headers;
        const { _t } = req.query;
        
        const [ id, token ] = (creds || _t || '').split(':');
        
        if (!id) {
            req.user = null;
        }
        else if (!(id in users)) {
            res.status(401).send({
                message: `User ${id} does not exist`,
            });
        }
        else if (users[id].token != token) {
            res.status(401).send({
                message: `User ${id} does not have token ${token}`,
            });
            return;
        }
        else {
            req.user = users[id];
        }
        
        return 'next';
    };
}
