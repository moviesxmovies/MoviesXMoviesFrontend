<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Dialog, useToast } from 'primevue';
import { getSelfUserProfile, updateSelfUserProfile } from '@/repositories/userRepository';
import type { SelfUser, User } from '@/types';
import { editProfileSchema } from '@/schemas/editProfileSchema';

const { t } = useI18n();
const toast = useToast();
const user = ref<SelfUser>();
const visible = defineModel<boolean>('visible', { default: false });
const emit = defineEmits<{ (e: 'updated', user: User): void }>();

const loading = ref(false);
const picturePreview = ref<string | null>(null);
const pictureFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const fieldErrors = ref<Record<string, string[]>>({});
const serverErrors = ref<string[]>([]);

const form = ref({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    password: '',
    confirm_password: '',
});

watch(visible, async (val) => {
    if (val) {
        await fetchUserData();
        form.value = {
            username: user.value?.username ?? '',
            email: user.value?.email ?? '',
            first_name: user.value?.first_name ?? '',
            last_name: user.value?.last_name ?? '',
            bio: user.value?.bio ?? '',
            password: '',
            confirm_password: '',
        };
        picturePreview.value = user.value?.picture ?? null;
        pictureFile.value = null;
        fieldErrors.value = {};
        serverErrors.value = [];
    }
});

const clearError = (field: string) => {
    if (fieldErrors.value[field]?.length) {
        fieldErrors.value = { ...fieldErrors.value, [field]: [] };
    }
    serverErrors.value = [];
};

const onFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    pictureFile.value = file;
    picturePreview.value = URL.createObjectURL(file);
};

const submit = async () => {
    fieldErrors.value = {};
    serverErrors.value = [];

    const result = editProfileSchema.safeParse(form.value);
    if (!result.success) {
        result.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            if (!fieldErrors.value[field]) fieldErrors.value[field] = [];
            fieldErrors.value[field].push(issue.message);
        });
        return;
    }

    loading.value = true;
    try {
        const formData = new FormData();
        if (form.value.username) formData.append('username', form.value.username);
        if (form.value.email) formData.append('email', form.value.email);
        if (form.value.first_name) formData.append('first_name', form.value.first_name);
        if (form.value.last_name) formData.append('last_name', form.value.last_name);
        if (form.value.bio) formData.append('bio', form.value.bio);
        if (form.value.password) formData.append('password', form.value.password);
        if (pictureFile.value) formData.append('picture', pictureFile.value);

        const updated = await updateSelfUserProfile(formData);
        emit('updated', updated);
        visible.value = false;
        toast.add({ severity: 'success', summary: t('toast.success'), detail: t('user.profileUpdated'), life: 3000 });
    } catch (error: any) {
        const data = error.response?.data;
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                const messages = Array.isArray(value) ? value as string[] : [value as string];
                if (key === 'error') {
                    serverErrors.value = messages;
                } else {
                    fieldErrors.value[key] = messages;
                }
            });
        } else {
            toast.add({ severity: 'error', summary: t('toast.error'), detail: t('user.error.updatingProfile'), life: 3000 });
        }
    } finally {
        loading.value = false;
    }
};

const fetchUserData = async () => {
    try {
        user.value = await getSelfUserProfile();
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};
</script>

<template>
    <Dialog v-model:visible="visible" modal :draggable="false" :dismissableMask="true" :header="t('user.editProfile')"
        :style="{ width: '90vw', maxWidth: '480px' }" :pt="{
            root: { class: 'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden' },
            header: { class: 'bg-[var(--background)] pb-0' },
            title: { class: 'text-xl font-bold text-[var(--primary)]' },
            content: { class: 'bg-[var(--background)]' },
            footer: { class: 'bg-[var(--background)] border-t border-[var(--secondary)]' },
            closeButton: { class: 'hover:bg-[var(--secondary)]/20 transition-colors' },
        }">
        <div class="form">
            <!-- Avatar -->
            <div class="avatar-section">
                <div class="avatar-wrapper" @click="fileInput?.click()">
                    <img :src="picturePreview ?? ''" class="avatar-img" :alt="t('user.yourProfile')" />
                    <div class="avatar-overlay">
                        <i class="pi pi-camera" />
                    </div>
                </div>
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                <p class="avatar-hint">{{ t('user.clickToChangePicture') }}</p>
            </div>

            <!-- Errores globales del servidor -->
            <div v-if="serverErrors.length" class="server-errors">
                <i class="pi pi-exclamation-circle" />
                <ul>
                    <li v-for="(err, i) in serverErrors" :key="i">{{ err }}</li>
                </ul>
            </div>

            <!-- Fields -->
            <div class="fields">
                <div class="field-row">
                    <div class="field">
                        <label for="first_name">{{ t('user.firstName') }}</label>
                        <input id="first_name" v-model="form.first_name" type="text" class="input"
                            :class="{ 'input-error': fieldErrors.first_name?.length }"
                            @input="clearError('first_name')" />
                        <span v-if="fieldErrors.first_name?.length" class="field-error">
                            {{ fieldErrors.first_name[0] }}
                        </span>
                    </div>
                    <div class="field">
                        <label for="last_name">{{ t('user.lastName') }}</label>
                        <input id="last_name" v-model="form.last_name" type="text" class="input"
                            :class="{ 'input-error': fieldErrors.last_name?.length }"
                            @input="clearError('last_name')" />
                        <span v-if="fieldErrors.last_name?.length" class="field-error">
                            {{ fieldErrors.last_name[0] }}
                        </span>
                    </div>
                </div>

                <div class="field">
                    <label for="username">{{ t('user.username') }}</label>
                    <input id="username" v-model="form.username" type="text" class="input"
                        :class="{ 'input-error': fieldErrors.username?.length }" @input="clearError('username')" />
                    <span v-if="fieldErrors.username?.length" class="field-error">
                        {{ fieldErrors.username[0] }}
                    </span>
                </div>

                <div class="field">
                    <label for="email">{{ t('user.email') }}</label>
                    <input id="email" v-model="form.email" type="email" class="input"
                        :class="{ 'input-error': fieldErrors.email?.length }" @input="clearError('email')" />
                    <span v-if="fieldErrors.email?.length" class="field-error">
                        {{ fieldErrors.email[0] }}
                    </span>
                </div>

                <div class="field">
                    <label for="bio">{{ t('user.bio') }}</label>
                    <textarea id="bio" v-model="form.bio" class="input textarea" rows="3"
                        :class="{ 'input-error': fieldErrors.bio?.length }" @input="clearError('bio')" />
                    <span v-if="fieldErrors.bio?.length" class="field-error">
                        {{ fieldErrors.bio[0] }}
                    </span>
                </div>

                <div class="field">
                    <label for="new_password">{{ t('user.newPassword') }}</label>
                    <input id="new_password" v-model="form.password" type="password" class="input"
                        :class="{ 'input-error': fieldErrors.password?.length }"
                        :placeholder="t('user.leaveBlankToKeep')" @input="clearError('password')"
                        autocomplete="new-password" />
                    <div v-if="fieldErrors.password?.length" class="field-errors-list">
                        <span v-for="(err, i) in fieldErrors.password" :key="i" class="field-error">
                            {{ err }}
                        </span>
                    </div>
                </div>
                <div class="field">
                    <label for="confirm_password">{{ t('user.confirmPassword') }}</label>
                    <input id="confirm_password" v-model="form.confirm_password" type="password" class="input"
                        :class="{ 'input-error': fieldErrors.confirm_password?.length }"
                        :placeholder="t('user.leaveBlankToKeep')" @input="clearError('confirm_password')"
                        autocomplete="new-password" />
                    <span v-if="fieldErrors.confirm_password?.length" class="field-error">
                        {{ fieldErrors.confirm_password[0] }}
                    </span>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="footer-actions">
                <button class="btn-cancel" @click="visible = false">
                    {{ t('common.cancel') }}
                </button>
                <button class="btn-save" :disabled="loading" @click="submit">
                    <i v-if="loading" class="pi pi-spin pi-spinner" />
                    <span>{{ t('common.save') }}</span>
                </button>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.5rem 0;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.avatar-wrapper {
    position: relative;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    cursor: pointer;
    overflow: hidden;
    border: 3px solid var(--primary);
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    color: #fff;
    font-size: 1.3rem;
}

.avatar-wrapper:hover .avatar-overlay {
    opacity: 1;
}

.avatar-hint {
    font-size: 0.72rem;
    opacity: 0.5;
    color: var(--text);
}

.server-errors {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--red) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
    color: var(--red);
    font-size: 0.82rem;
}

.server-errors i {
    margin-top: 2px;
    flex-shrink: 0;
}

.server-errors ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text);
    opacity: 0.6;
}

.input {
    background: color-mix(in srgb, var(--text) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--secondary) 50%, transparent);
    border-radius: 0.75rem;
    padding: 0.6rem 0.9rem;
    font-size: 0.9rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
}

.input:focus {
    border-color: var(--primary);
}

.input-error {
    border-color: var(--red) !important;
}

.textarea {
    resize: vertical;
    min-height: 80px;
}

.field-error {
    font-size: 0.75rem;
    color: var(--red);
    font-weight: 500;
}

.field-errors-list {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.hidden {
    display: none;
}

.footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
    width: 100%;
}

.btn-cancel {
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--secondary) 60%, transparent);
    background: transparent;
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-cancel:hover {
    background: color-mix(in srgb, var(--secondary) 15%, transparent);
}

.btn-save {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1.4rem;
    border-radius: 999px;
    border: none;
    background: var(--primary);
    color: var(--background);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-save:hover:not(:disabled) {
    opacity: 0.85;
}
</style>