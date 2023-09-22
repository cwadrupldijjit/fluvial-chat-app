import { randomUUID } from 'crypto';

const sessions = {};

export function createSession(userId) {
    const id = randomUUID();
    sessions[id] = {
        uuid: id,
        userId,
    };
    
    return id;
}

export function sessionExists(sessionId) {
    return sessionId in sessions;
}

export function closeSession(sessionId) {
    delete sessions[sessionId];
}
