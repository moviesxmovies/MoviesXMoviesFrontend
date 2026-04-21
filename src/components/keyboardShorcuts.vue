<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

export interface DropdownOption {
    label: string
    icon?: string
    handler: () => void
    disabled?: boolean | { value: boolean }
    danger?: boolean
    shortcut?: string
}

const props = defineProps<{ options: DropdownOption[] }>()

const open = ref(false)
const buttonRef = ref<HTMLElement | null>(null)

const toggle = () => { open.value = !open.value }

const isDisabled = (d: DropdownOption['disabled']): boolean => {
    if (!d) return false
    return typeof d === 'object' ? d.value : d
}
const groupedOptions = computed(() => {
    const groups = new Map<string, { label: string, icon?: string, danger?: boolean, items: DropdownOption[] }>()

    props.options.forEach(opt => {
        if (!groups.has(opt.label)) {
            groups.set(opt.label, {
                label: opt.label,
                icon: opt.icon,
                danger: opt.danger,
                items: []
            })
        }
        groups.get(opt.label)?.items.push(opt)
    })

    return Array.from(groups.values())
})

const handleGroupClick = (group: { items: DropdownOption[] }) => {
    const firstGroupItem = group.items[0]
    if (!firstGroupItem) return
    if (group.items.length > 0 && !isDisabled(firstGroupItem.disabled)) {
        firstGroupItem.handler()
        open.value = false
    }
}
const handleKeydown = (e: KeyboardEvent) => {
    const isTyping = e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable;

    if (isTyping) return;

    const pressedKey = e.key.toLowerCase() === " " ? "space" : e.key.toLowerCase();


    for (const opt of props.options) {
        if (!opt.shortcut || isDisabled(opt.disabled)) continue

        const parts = opt.shortcut.toLowerCase().split('+')
        const s = {
            ctrl: parts.includes('ctrl'),
            shift: parts.includes('shift'),
            key: parts[parts.length - 1]
        }

        const isMatch =
            (s.ctrl === (e.ctrlKey || e.metaKey)) &&
            (s.shift === e.shiftKey) &&
            pressedKey === s.key;

        if (isMatch) {
            e.preventDefault()
            opt.handler()
            open.value = false
            return
        }
    }
}

const onClickOutside = (e: MouseEvent) => {
    if (!buttonRef.value?.contains(e.target as Node)) open.value = false
}

onMounted(() => {
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', onClickOutside)
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div ref="buttonRef" class="fab-container">

        <Transition name="fab-menu">
            <div v-if="open" class="fab-menu">
                <div class="menu-header">
                    <span>{{ $t('home.shortcuts') }}</span>
                </div>
                <button v-for="group in groupedOptions" :key="group.label"
                    :disabled="isDisabled(group.items[0]?.disabled)" class="menu-item"
                    :class="{ 'menu-item--danger': group.danger }" @click="handleGroupClick(group)">
                    <div class="item-content">
                        <span v-if="group.icon" :class="group.icon" class="item-icon"></span>
                        <span class="item-label">{{ group.label }}</span>
                    </div>

                    <div class="group-shortcuts">
                        <template v-for="(opt, optIndex) in group.items" :key="optIndex">
                            <div v-if="opt.shortcut" class="shortcut-container">
                                <template v-for="(key, kIndex) in opt.shortcut.toLowerCase().split('+')" :key="kIndex">
                                    <span class="kbd-key" :class="{ 'kbd-space': key === 'space' }">
                                        {{ key === 'ctrl' ? '⌘' : (key === 'space' ? 'Space' : key) }}
                                    </span>
                                    <span v-if="kIndex < opt.shortcut.split('+').length - 1" class="kbd-plus">+</span>
                                </template>
                            </div>

                            <span v-if="optIndex < group.items.length - 1" class="shortcut-separator">/</span>
                        </template>
                    </div>
                </button>
            </div>
        </Transition>

        <button class="fab-button" :class="{ 'fab-button--active': open }" @click="toggle">
            <svg v-if="!open" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-kb">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="M6 8h.01" />
                <path d="M10 8h.01" />
                <path d="M14 8h.01" />
                <path d="M18 8h.01" />
                <path d="M8 12h.01" />
                <path d="M12 12h.01" />
                <path d="M16 12h.01" />
                <path d="M7 16h10" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </svg>
        </button>

    </div>
</template>

<style scoped>
.fab-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    z-index: 100;
    font-family: 'DM Sans', sans-serif;
}

/* BOTÓN FAB */
.fab-button {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(47, 39, 206, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(47, 39, 206, 0.4);
    filter: brightness(1.1);
}

.fab-button--active {
    background: var(--accent);
    transform: rotate(0deg);
}

/* MENÚ */
.fab-menu {
    background: var(--background);
    border: 0.5px solid rgba(47, 39, 206, 0.2);
    border-radius: 16px;
    padding: 8px;
    min-width: 220px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.menu-header {
    padding: 8px 12px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--primary);
    opacity: 0.6;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 44px;
    justify-content: space-between;
    gap: 12px;
    color: var(--text);
}

.menu-item:hover:not(:disabled) {
    background: var(--secondary);
    color: var(--primary);
}

.menu-item:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.item-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.item-label {
    font-size: 0.9rem;
    font-weight: 500;
}

.shortcut-badge {
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(47, 39, 206, 0.08);
    color: var(--primary);
    padding: 2px 6px;
    border-radius: 6px;
    text-transform: uppercase;
    font-family: monospace;
}

.menu-item--danger:hover {
    background: #fff1f2 !important;
    color: #e11d48 !important;
}

/* TRANSICIÓN */
.fab-menu-enter-active,
.fab-menu-leave-active {
    transition: all 0.3s ease;
}

.fab-menu-enter-from,
.fab-menu-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
}

.shortcut-container {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 12px;
}

.kbd-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    font-size: 0.65rem;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    text-transform: uppercase;
    background: var(--background);
    color: var(--primary);
    border: 0.5px solid rgba(47, 39, 206, 0.2);
    border-radius: 4px;
    box-shadow: 0 1px 0 rgba(47, 39, 206, 0.2);
}

.kbd-space {
    min-width: 50px;
    font-size: 0.6rem;
    letter-spacing: 0.05em;
}

.kbd-plus {
    font-size: 0.7rem;
    opacity: 0.4;
    font-weight: 600;
}

.menu-item:hover .kbd-key {
    background: white;
    border-color: var(--primary);
}

.group-shortcuts {
    display: flex;
    align-items: center;
    gap: 6px;
}

.shortcut-separator {
    font-size: 0.8rem;
    opacity: 0.3;
    color: var(--text);
    font-weight: 300;
}

.group-shortcuts>.shortcut-container {
    margin-left: 0;
}

@media (max-width: 640px) {
    .fab-container {
        display: none;
    }
}
</style>