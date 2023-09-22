import { defineStore } from 'pinia';
import { ref } from 'vue';
import { uiStore } from './ui-store';

export const userStore = defineStore('user', () => {
    const user = ref(JSON.parse(window.localStorage.getItem('user') || 'null'));
    const connectedUsers = ref([]);
    const ui = uiStore();
    
    return {
        user,
        connectedUsers,
        
        register,
        login,
        getUser,
    };
    
    async function register(userData) {
        const response = await fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
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
                level: 'error',
                text: typeof responseBody == 'object' ? responseBody.message : responseBody,
            });
            return;
        }
        
        const { id: uuid, ...otherUserData } = responseBody;
        
        user.value = {
            ...userData,
            uuid,
            ...otherUserData,
        };
        
        persistUser(user.value);
        
        return user.value;
    }
    
    async function login(creds) {
        const [ id, token ] = creds.split(':');
        const response = await fetch(`/api/users/${id}`, {
            method: 'POST',
            body: JSON.stringify({
                token,
            }),
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
                level: 'error',
                text: typeof responseBody == 'object' ? responseBody.message : responseBody,
            });
            return;
        }
        
        user.value = {
            token,
            id,
            ...responseBody,
        };
        
        persistUser(user.value);
        
        return user.value;
    }
    
    async function getUser(id) {
        const response = await fetch(`/api/users/${id}`);
        
        let responseBody;
        if (response.headers.get('content-type') == 'application/json') {
            responseBody = await response.json();
        }
        else {
            responseBody = await response.text();
        }
        
        if (!response.ok) {
            ui.showToast({
                level: 'error',
                text: typeof responseBody == 'object' ? responseBody.message : responseBody,
            });
            return;
        }
        
        return responseBody;
    }
    
    function persistUser(user) {
        window.localStorage.setItem('user', JSON.stringify(user));
    }
});
