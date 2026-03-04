<script setup lang="ts">
import { ref } from 'vue';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/composables/useAPI';
import { useToast } from 'primevue/usetoast';
import { Button, Card, InputText, Password } from 'primevue';
import { loginWithGoogle } from '@/composables/useOAUTH';
import OauthButtonComponent from '@/components/common/oauthButtonComponent.vue';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

const form = ref({
    username: '',
    password: '',
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);

const toast = useToast();
const authStore = useAuthStore();

const validate = () => {
    const result = loginSchema.safeParse(form.value);
    if (!result.success) {
        errors.value = result.error.flatten().fieldErrors as any;
        for (const key in errors.value) {
            if (Array.isArray(errors.value[key])) {
                errors.value[key] = (errors.value[key] as any)[0];
            }
        }
        return false;
    }
    errors.value = {};
    return true;
};

const handleLogin = async () => {
    if (!validate()) return;

    loading.value = true;
    try {
        const { data } = await api.post(import.meta.env.VITE_URL_PROTOCOL + '/api/auth/login/', form.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Session started', life: 3000 });
        authStore.handleLogin(data.access, data.refresh);
    } catch (error: any) {
        const status = error.response?.status;
        let detail = "Can't connect to server";

        if (status === 401) detail = 'Incorrect username or password';
        if (status === 403) detail = 'Access denied (Check Cloudflare/CSRF)';

        toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="flex justify-content-center align-items-center min-h-screen bg-neutral-100">
        <Card style="width: 24rem">
            <template #title> {{ $t('login.title') }} </template>
            <template #content>
                <div class="flex flex-column gap-4">

                    <div class="flex flex-column gap-1">
                        <label for="username" class="font-semibold">{{ $t('login.username') }}</label>
                        <InputText id="username" v-model="form.username" :class="{ 'p-invalid': errors.username }"
                            @input="errors.username = ''" />
                        <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
                    </div>

                    <div class="flex flex-column gap-1">
                        <label for="password" class="font-semibold">{{ $t('login.password') }}</label>
                        <Password id="password" v-model="form.password" :class="{ 'p-invalid': errors.password }"
                            :feedback="false" toggleMask @input="errors.password = ''" />
                        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                    </div>

                    <Button label="Login" icon="pi pi-sign-in" :loading="loading" @click="handleLogin" />
                    <OauthButtonComponent @click="loginWithGoogle" />
                </div>
            </template>
        </Card>
    </div>
</template>