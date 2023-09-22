import { defineStore } from 'pinia';
import { ref } from 'vue';

export const uiStore = defineStore('ui', () => {
    const toasts = ref([]);
    
    return {
        toasts,
        
        showToast,
        dismissToast,
    };
    
    function showToast(toast) {
        toasts.value = [ ...toasts.value, toast ];
        
        if (toast.timeout) {
            setTimeout(() => {
                dismissToast(toast);
            }, toast.timeout);
        }
    }
    
    function dismissToast(toast) {
        if (!toasts.value.includes(toast)) {
            return;
        }
        
        toasts.value = toasts.value.filter(t => t != toast);
    }
});
