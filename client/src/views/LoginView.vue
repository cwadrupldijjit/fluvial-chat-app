<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { uiStore } from '../stores/ui-store';
import { userStore } from '../stores/user-store';

const ui = uiStore();
const users = userStore();
const router = useRouter();

const username = ref('');
const key = ref('');

async function submitRegister(event) {
    event.preventDefault();
    
    if (!username.value) {
        ui.showToast({
            type: 'error',
            text: 'A username is required to register',
        });
        return;
    }
    
    const result = await users.register({
        username: username.value,
    });
    
    if (!result) {
        return;
    }
    
    router.push({
        path: '/messages',
    });
}

async function submitLogin(event) {
    event.preventDefault();
    
    if (!key.value) {
        ui.showToast({
            type: 'error',
            text: 'A key is required to log in',
        });
        return;
    }
    
    if (!key.value.match(/^[0-9a-f\-]+:[0-9a-f]+$/)) {
        ui.showToast({
            type: 'error',
            text: 'The provided key is invalid for login; requires pattern "<user-id>:<token>"',
        });
        return;
    }
    
    const result = await users.login(key.value);
    
    if (!result) {
        return;
    }
    
    router.push({
        path: '/messages',
    });
}
</script>

<template>
    <div class="login-component">
        <h1>Fluvial Chat</h1>
        
        <form class="register" @submit="submitRegister">
            <!-- <h2>Register</h2> -->
            <div>
                <label>
                    Username
                    <input placeholder="Username" v-model="username">
                </label>
                <button type="submit">
                    Join the chat!
                </button>
            </div>
        </form>
        
        <!-- <div class="divider">
            <span>or</span>
        </div>
        
        <form class="login" @submit="submitLogin">
            <h2>Log in</h2>
            <div>
                <label>
                    Key
                    <input placeholder="<user-id>:<token>" v-model="key">
                </label>
                <button type="submit">
                    Log in
                </button>
            </div>
        </form> -->
    </div>
</template>

<style scoped>
form {
    padding: 60px 30px;
}

form > div {
    display: flex;
    align-items: flex-end;
}

label {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.divider {
    border-bottom: 1px solid white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 0;
}

.divider > span {
    display: inline-block;
    padding: 5px;
    background-color: var(--color-background);
}

input {
    flex: 1;
    background-color: #6262a855;
    color: white;
    border-radius: 3px 0 0 3px;
    border: 2px solid #222c;
    border-right-width: 1px;
    padding: 7px 10px;
}

form button {
    background-color: #6262a855;
    color: white;
    border-radius: 0 3px 3px 0;
    border: 2px solid #222c;
    border-left-width: 1px;
    padding: 7px 10px;
}
</style>
