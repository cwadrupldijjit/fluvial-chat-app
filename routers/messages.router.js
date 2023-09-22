import { randomBytes, randomUUID } from 'crypto';
import { Router } from 'fluvial';
import { addMessage, getMessage, getMessages, listenForMessages } from '../services/messages.service.js';
import { users } from './users.router.js';
import { checkToken } from '../middleware/token.middleware.js';

export const MessagesRouter = Router();
export const messagesPath = '/messages';

export const chatroomSecret = randomBytes(10).toString('hex');

MessagesRouter.get('/:secret/stream', checkToken(), (req, res) => {
    const { secret } = req.params;
    
    if (secret != chatroomSecret) {
        throw {
            type: 'not-found',
            secret,
        };
    }
    
    res.asEventSource(true);
    
    res.sendEvent({ type: 'init' });
    const unregisterListener = listenForMessages((message, type) => {
        res.sendEvent({
            type,
            message,
        });
    });
    
    res.on('close', () => {
        unregisterListener();
    });
});

MessagesRouter.get('/:secret', (req, res) => {
    const { secret } = req.params;
    
    if (secret != chatroomSecret) {
        throw {
            type: 'not-found',
            secret,
        };
    }
    
    res.send(getMessages());
});

MessagesRouter.get('/:secret/:id', () => {
    const { secret, id } = req.params;
    
    if (secret != chatroomSecret) {
        throw {
            type: 'not-found',
            secret,
        };
    }
    
    const message = getMessage(id);
    
    if (!message) {
        throw {
            type: 'not-found',
            secret,
            id,
        };
    }
    
    res.send(message);
});

MessagesRouter.post('/:secret', checkToken(), (req, res) => {
    const { secret } = req.params;
    const message = req.payload;
    
    if (!req.user) {
        throw {
            type: 'unauthorized',
        };
    }
    
    if (secret != chatroomSecret) {
        throw {
            type: 'not-found',
            secret,
        };
    }
    
    message.userId = req.user.uuid;
    message.username = req.user.username;
    message.userColor = req.user.color;
    
    addMessage(message);
    
    res.status(201).send(message);
});

MessagesRouter.catch((err, req, res) => {
    if (err?.type == 'not-found' && err.id) {
        res.status(404).send({
            message: `No message id matches ${err.id} for chatroom ${err.secret}`,
        });
        return;
    }
    else if (err?.type == 'not-found' && err.secret) {
        res.status(404).send({
            message: `No chatroom secret matches ${err.secret}`,
        });
        return;
    }
    
    throw err;
});
