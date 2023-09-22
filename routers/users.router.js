import { randomBytes, randomUUID } from 'crypto';
import { Router } from 'fluvial';
import { chatroomSecret } from './messages.router.js';
import { closeSession, createSession, sessionExists } from '../services/session.service.js';

export const UsersRouter = Router();
export const usersPath = '/users';

const userColors = [
    '#1070c7',
    '#10c7bb',
    '#10c759',
    '#c7bd10',
    '#c76510',
    '#6c31c1',
    '#c131ac',
    '#e21a1a',
];

export const users = {};

UsersRouter.post('/', (req, res) => {
    const newUser = req.payload;
    
    if (Object.values(users).some((user) => user.username.toLowerCase() == newUser.username.toLowerCase())) {
        res.status(400).send({
            message: `Username of ${newUser.username} already exists`,
        });
        return;
    }
    
    newUser.color = userColors[Math.floor(Math.random() * userColors.length)];
    newUser.uuid = randomUUID();
    newUser.token = randomBytes(64).toString('hex');
    newUser.sessions = [
        createSession(newUser.uuid),
    ];
    
    users[newUser.uuid] = newUser;
    
    res.status(201).send({
        id: newUser.uuid,
        token: newUser.token,
        secret: chatroomSecret,
        session: newUser.sessions[0],
    });
});

UsersRouter.post('/:id/token', (req, res) => {
    const { id } = req.params;
    const { token, session } = req.payload;
    
    if (!(id in users)) {
        throw {
            type: 'not-found',
            id,
        };
    }
    
    if (users[id] && token != users[id].token) {
        throw {
            type: 'unauthorized',
            id,
        };
    }
    
    let targetSession = session;
    if (!session || !sessionExists(session)) {
        targetSession = createSession(id);
    }
    
    res.send({
        user: scrubUser(users[id]),
        secret: chatroomSecret,
        session: targetSession,
    });
});

UsersRouter.get('/:id', (req, res) => {
    const { id } = req.params;
    
    if (!(id in users)) {
        throw {
            type: 'not-found',
            id,
        };
    }
    
    res.send(scrubUser(users[id]));
});

UsersRouter.get('/', (req, res) => {
    const allUsers = Object.values(users).map(scrubUser);
    
    res.send(allUsers);
});

UsersRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const { session } = req.query;
    
    if (!(id in users)) {
        res.send();
        return;
    }
    
    if (users[id].sessions.length > 1 && !session) {
        res.status(400).send({
            message: `User ${id} has multiple sessions but none are specified for removal`,
        });
        return;
    }
    if (session && !users[id].sessions.includes(session)) {
        res.status(400).send({
            message: `User ${id} does not have a session with id of ${session}`,
        });
        return;
    }
    
    if (users[id].sessions.length == 1) {
        closeSession(users[id].sessions[0]);
        users[id].sessions = [];
    }
    else {
        closeSession(session);
        users[id].sessions.splice(users[id].sessions.indexOf(session), 1);
    }
    
    res.status(204).send();
});

UsersRouter.catch((err, req, res) => {
    if (err?.type == 'not-found') {
        res.status(404).send({
            message: `No user found with id of ${err.id}`,
        });
        return;
    }
    if (err?.type == 'unauthorized') {
        res.status(401).send({
            message: `Provided token does not match the user with id of ${err.id}`,
        });
        return;
    }
});

function scrubUser(user) {
    const { token, sessions, ...scrubbedUser } = user;
    
    return scrubbedUser;
}
