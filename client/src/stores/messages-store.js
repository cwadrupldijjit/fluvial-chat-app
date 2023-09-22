import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userStore } from './user-store';
import { uiStore } from './ui-store';

export const messagesStore = defineStore('messages', () => {
    const messages = ref([]);
    const users = userStore();
    const ui = uiStore();
    
    return {
        messages,
        
        getMessages,
        addMessage,
        editMessage,
        deleteMessage,
        listenForMessages,
    };
    
    async function getMessages() {
        if (!users.user?.secret) {
            return null;
        }
        
        const response = await fetch(`/api/messages/${users.user.secret}`);
        
        let responseBody;
        if (response.headers.get('content-type') == 'application/json') {
            responseBody = await response.json();
        }
        else {
            responseBody = await response.text();
        }
        
        if (!response.ok) {
            ui.showToast({
                type: 'error',
                text: typeof responseBody == 'object' ? responseBody.message : responseBody,
            });
            return;
        }
        
        messages.value = responseBody;
        
        return responseBody;
    }
    
    async function addMessage(text) {
        if (!users.user) {
            return null;
        }
        
        const response = await fetch(`/api/messages/${users.user.secret}`, {
            method: 'POST',
            body: JSON.stringify({
                text,
            }),
            headers: {
                'authorization': users.user.uuid + ':' + users.user.token,
                'content-type': 'application/json',
            },
        });
        
        let responseBody;
        if (response.headers.get('content-type') == 'application/json') {
            responseBody = await response.json();
        }
        else {
            responseBody = await response.text();
        }
        
        if (!response.ok) {
            ui.showToast({
                type: 'error',
                text: typeof responseBody == 'object' ? responseBody.message : responseBody,
            });
            return;
        }
        
        return responseBody;
    }
    
    async function editMessage(messageId, newText) {
        if (!users.user) {
            return null;
        }
        
        const response = await fetch(`/api/messages/${users.user.secret}/${messageId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                text: newText,
            }),
            headers: {
                'authorization': users.user.uuid + ':' + users.user.token,
                'content-type': 'application/json',
            },
        });
        
        let responseBody;
        if (response.headers.get('content-type') == 'application/json') {
            responseBody = await response.json();
        }
        else {
            responseBody = await response.text();
        }
        
        if (!response.ok) {
            ui.showToast({
                type: 'error',
                text: typeof responseBody == 'object' ? responseBody.message : responseBody,
            });
            return;
        }
        
        return responseBody;
    }
    
    async function deleteMessage(messageId) {
        if (!users.user) {
            return null;
        }
        
        const response = await fetch(`/api/messages/${users.user.secret}/${messageId}`, {
            method: 'DELETE',
            headers: {
                'authorization': users.user.uuid + ':' + users.user.token,
            },
        });
        
        let responseBody;
        if (response.headers.get('content-type') == 'application/json') {
            responseBody = await response.json();
        }
        else {
            responseBody = await response.text();
        }
        
        if (!response.ok) {
            ui.showToast({
                type: 'error',
                text: typeof responseBody == 'object' ? responseBody.message : responseBody,
            });
            return;
        }
        
        messages.value = messages.value.filter(message => message.uuid == messageId);
        
        return messages.value;
    }
    
    function listenForMessages() {
        const eventSource = new EventSource(`/api/messages/${users.user.secret}/stream?` + new URLSearchParams({ _t: `${users.user.uuid}:${users.user.token}` }));
        
        eventSource.addEventListener('message', (message) => {
            let data = message.data;
            if (typeof data == 'string') {
                data = JSON.parse(data);
            }
            
            if (data.type == 'new') {
                messages.value = [
                    ...messages.value,
                    data.message,
                ];
            }
            else if (data.type == 'modified') {
                messages.value = messages.value.map(message => {
                    if (message.uuid == data.message.uuid) {
                        return data.message;
                    }
                    
                    return message;
                });
            }
        });
        
        return () => {
            eventSource.close();
        };
    }
});
