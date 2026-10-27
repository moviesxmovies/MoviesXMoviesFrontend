<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Dialog, Skeleton, useToast } from 'primevue';
import { getSelfUserProfile, updateSelfUserProfile } from '@/repositories/userRepository';
import type { SelfUser, User } from '@/types';
import { editProfileSchema } from '@/schemas/editProfileSchema';

const { t } = useI18n();
const toast = useToast();
const user = ref<SelfUser>();
const visible = defineModel<boolean>('visible', { default: false });
const emit = defineEmits<{
    updated: [user: User];
    emailChanged: [];
}>();

const loading = ref(true);
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
        if (updated.email !== user.value?.email) {
            emit('emailChanged');
        }
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
        loading.value = true;
        user.value = await getSelfUserProfile();
    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
        loading.value = false;
    }
};

const resetForm = async () => {
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
};
watch(visible, (val) => {
    if (val) {
        resetForm();
    }
});
</script>

<template>
    <Dialog v-model:visible="visible" modal :draggable="false" :dismissableMask="true"
        :header="t('user.editProfileTitle')" :style="{ width: '90vw', maxWidth: '480px' }" :pt="{
            root: { class: 'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden' },
            header: { class: 'bg-[var(--background)] pb-0' },
            title: { class: 'text-xl font-bold text-[var(--primary)]' },
            content: { class: 'bg-[var(--background)]' },
            footer: { class: 'bg-[var(--background)] border-t border-[var(--secondary)]' },
            closeButton: { class: 'hover:bg-[var(--secondary)]/20 transition-colors' },
        }">
        <!-- SKELETON -->
        <div v-if="loading" class="form">
            <!-- Avatar -->
            <div class="avatar-section">
                <Skeleton shape="circle" width="90px" height="90px" />
                <Skeleton width="140px" height="11px" border-radius="4px" />
            </div>

            <!-- Fields -->
            <div class="fields">
                <!-- first_name + last_name -->
                <div class="field-row">
                    <div class="field">
                        <Skeleton width="80px" height="11px" border-radius="4px" />
                        <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                    </div>
                    <div class="field">
                        <Skeleton width="80px" height="11px" border-radius="4px" />
                        <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                    </div>
                </div>

                <!-- username -->
                <div class="field">
                    <Skeleton width="70px" height="11px" border-radius="4px" />
                    <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                </div>

                <!-- email -->
                <div class="field">
                    <Skeleton width="50px" height="11px" border-radius="4px" />
                    <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                </div>

                <!-- bio (textarea más alta) -->
                <div class="field">
                    <Skeleton width="30px" height="11px" border-radius="4px" />
                    <Skeleton width="100%" height="80px" border-radius="0.75rem" />
                </div>

                <!-- password -->
                <div class="field">
                    <Skeleton width="110px" height="11px" border-radius="4px" />
                    <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                </div>

                <!-- confirm_password -->
                <div class="field">
                    <Skeleton width="140px" height="11px" border-radius="4px" />
                    <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                </div>
            </div>
        </div>
        <div v-else class="form">
            <!-- Profile Picture -->
            <div class="avatar-section">
                <div class="avatar-wrapper" role="button" tabindex="0" :aria-label="t('user.clickToChangePicture')"
                    @click="fileInput?.click()" @keydown.enter.prevent="fileInput?.click()" @keydown.space.prevent="fileInput?.click()">
                    <img :src="picturePreview ?? ''" class="avatar-img" :alt="t('user.yourProfile')" />
                    <div class="avatar-overlay" aria-hidden="true">
                        <i class="pi pi-camera" />
                    </div>
                </div>
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                <p class="avatar-hint">{{ t('user.clickToChangePicture') }}</p>
            </div>

            <!-- Global Errors -->
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
                <button class="btn-reset" :disabled="loading" @click="resetForm">
                    <i v-if="loading" class="pi pi-spin pi-spinner" />
                    <span>{{ t('common.reset') }}</span>
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
    gap: 1.25rem;
    padding: 0.25rem 0;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.avatar-wrapper {
    position: relative;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    cursor: pointer;
    overflow: hidden;
    box-shadow: 0 0 0 3px var(--surface), 0 0 0 5px var(--primary);
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(8, 7, 14, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    color: #ffffff;
    font-size: 1.3rem;
}

.avatar-wrapper:hover .avatar-overlay,
.avatar-wrapper:focus-visible .avatar-overlay {
    opacity: 1;
}

.avatar-hint {
    font-size: 0.875rem;
    color: var(--text-subtle);
    margin: 0;
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

@media (max-width: 480px) {
    .field-row {
        grid-template-columns: 1fr;
    }
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.field-errors-list {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.hidden {
    display: none;
}

/* ── Formulario (patrón compartido, ver guía de estilos) ── */
label,
.field-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
}

.input,
.textarea {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    padding: 0.65rem 0.9rem;
    font-size: 0.9375rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
}

.input:hover,
.textarea:hover {
    border-color: var(--text-subtle);
}

.input:focus,
.textarea:focus {
    border-color: var(--primary);
    box-shadow: var(--focus-ring);
}

.input-error {
    border-color: var(--danger) !important;
}

.textarea {
    resize: vertical;
    min-height: 120px;
}

.field-error {
    font-size: 0.8125rem;
    color: var(--danger);
    font-weight: 500;
}

.server-errors {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    background: var(--danger-soft);
    border: 1px solid color-mix(in srgb, var(--danger) 35%, transparent);
    color: var(--danger);
    font-size: 0.875rem;
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

/* ── Botones del pie ── */
.footer-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.625rem;
    padding-top: 0.75rem;
    width: 100%;
}

.btn-cancel,
.btn-reset,
.btn-save {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.5rem;
    padding: 0.55rem 1.2rem;
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.btn-cancel {
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
}

.btn-cancel:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--text);
}

.btn-reset {
    border: 1px solid var(--border-strong);
    background: transparent;
    color: var(--text);
}

.btn-reset:hover:not(:disabled) {
    background: var(--surface-hover);
}

.btn-save {
    border: 1px solid transparent;
    background: var(--primary);
    color: var(--on-primary);
    font-weight: 700;
}

.btn-save:hover:not(:disabled) {
    background: var(--primary-hover);
}

.btn-cancel:disabled,
.btn-reset:disabled,
.btn-save:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}
</style>
