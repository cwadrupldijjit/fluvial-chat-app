<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { messagesStore } from '../stores/messages-store';
import { userStore } from '../stores/user-store';

const messages = messagesStore();
const users = userStore();
const router = useRouter();

const messageResult = await messages.getMessages();

if (!messageResult) {
    router.push({
        path: '/',
    });
}

onMounted(() => {
    input.value.focus();
    scrollToBottom();
});

const removeMessageListener = messages.listenForMessages();

/** @type {import('vue').Ref<HTMLInputElement>} */
const input = ref();
const inputText = ref('');
/** @type {import('vue').Ref<HTMLUListElement>} */
const messagesContainer = ref();
let previousScroll = 0;
let followNewMessages = true;

messages.$subscribe(() => {
    if (!messagesContainer.value || !followNewMessages) return;
    
    requestAnimationFrame(() => {
        scrollToBottom();
    });
});

function scrollToBottom() {
    messagesContainer.value.scrollTo({ top: messagesContainer.value.scrollHeight - messagesContainer.value.clientHeight, left: 0 });
}

async function submitMessage(event) {
    event.preventDefault();
    
    if (!inputText.value) {
        return;
    }
    
    const text = inputText.value;
    inputText.value = '';
    
    const result = await messages.addMessage(text);
    
    if (!result) {
        inputText.value = text;
    }
}

onBeforeUnmount(() => {
    removeMessageListener();
});

/**
 * 
 * @param {Event & { target: HTMLUListElement }} event 
 */
function onScroll(event) {
    const delta = event.target.scrollTop - previousScroll;
    previousScroll = event.target.scrollTop;
    
    if (delta < 0) {
        followNewMessages = false;
    }
    else if (delta > 0 && Math.floor(event.target.scrollTop) == event.target.scrollHeight - event.target.clientHeight) {
        followNewMessages = true;
    }
}
</script>

<template>
    <div class="messages-component">
        <ul class="messages-container" @scroll="onScroll" ref="messagesContainer">
            <li
                v-for="message of messages.messages"
                :key="message.uuid"
                :class="{
                    message: true,
                    'self-message': message.userId == users.user.uuid,
                }"
            >
               <span :style="{ color: message.userColor }">{{ message.username }}</span>: {{ message.text }}
            </li>
        </ul>
        
        <form class="input-container" @submit="submitMessage">
            <input type="text" v-model="inputText" ref="input">
            <button type="submit">▶</button>
        </form>
    </div>
</template>

<style scoped>
.messages-component {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
    height: 100%;
}

ul {
    overflow: auto;
    list-style: none;
    padding: 20px;
}

li {
    margin: 10px 0;
    word-break: keep-all;
    overflow-wrap: break-word;
}

li span:first-child {
    font-weight: bold;
}

form {
    display: flex;
    padding: 20px;
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

form input + button {
    background-color: #6262a855;
    color: white;
    border-radius: 0 3px 3px 0;
    border: 2px solid #222c;
    border-left-width: 1px;
    padding: 7px 10px;
}
</style>
