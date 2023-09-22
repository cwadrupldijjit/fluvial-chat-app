import { randomUUID } from 'crypto';

const messages = [];
const messageListeners = [];

export function getMessages() {
    return messages;
}

export function getMessagesByUser(userId) {
    return messages.filter(m => m.userId == userId);
}

export function getMessage(messageId) {
    return messages.find(m => m.uuid == messageId);
}

export function addMessage(message) {
    message.uuid = randomUUID();
    message.date = new Date();
    messages.push(message);
    
    for (const listener of messageListeners) {
        listener(message, 'new');
    }
}

export function editMessage(messageId, newText) {
    const message = getMessage(messageId);
    
    if (!message) {
        return null;
    }
    
    message.text = newText;
    
    for (const listener of messageListeners) {
        listener(message, 'modified');
    }
}

export function removeMessage(messageId) {
    const message = getMessage(messageId);
    
    if (!messages.some(m => m.uuid == messageId)) {
        return;
    }
    
    message.text = '<removed>';
    message.deleted = true;
    
    for (const listener of messageListeners) {
        listener(message, 'modified');
    }
}

export function listenForMessages(callback) {
    messageListeners.push(callback);
    
    return () => {
        if (!messageListeners.includes(callback)) {
            return;
        }
        
        messageListeners.splice(messageListeners.indexOf(callback), 1);
    };
}
