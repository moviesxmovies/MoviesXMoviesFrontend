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
                        <span v-if="group.icon" :class="group.icon" class="item-icon" aria-hidden="true"></span>
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

        <button class="fab-button" :class="{ 'fab-button--active': open }" @click="toggle" :aria-expanded="open"
            :aria-label="$t('home.shortcuts')" :title="$t('home.shortcuts')">
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
    font-family: var(--font-sans);
}

.fab-button {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--primary);
    color: var(--on-primary);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-lg);
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.fab-button:hover {
    transform: translateY(-2px);
    background: var(--primary-hover);
}

.fab-button--active {
    background: var(--text);
    color: var(--background);
}

.fab-button--active:hover {
    background: var(--text);
}

.fab-menu {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 6px;
    min-width: 280px;
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.menu-header {
    padding: 8px 12px 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-subtle);
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.15s;
    min-height: 42px;
    justify-content: space-between;
    gap: 12px;
    color: var(--text);
    text-align: left;
}

.menu-item:hover:not(:disabled) {
    background: var(--primary-soft);
}

.menu-item:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.item-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.item-icon {
    color: var(--primary);
    font-size: 0.9rem;
    width: 1rem;
    text-align: center;
}

.item-label {
    font-size: 0.9375rem;
    font-weight: 500;
}

.menu-item--danger:hover {
    background: var(--danger-soft) !important;
    color: var(--danger) !important;
}

.fab-menu-enter-active,
.fab-menu-leave-active {
    transition: all 0.2s ease;
}

.fab-menu-enter-from,
.fab-menu-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
}

.shortcut-container {
    display: flex;
    align-items: center;
    gap: 4px;
}

.kbd-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: var(--font-mono);
    text-transform: uppercase;
    background: var(--surface-2);
    color: var(--text);
    border: 1px solid var(--border);
    border-bottom-width: 2px;
    border-radius: 5px;
}

.kbd-space {
    min-width: 52px;
    font-size: 0.7rem;
}

.kbd-plus {
    font-size: 0.75rem;
    color: var(--text-subtle);
    font-weight: 600;
}

.menu-item:hover .kbd-key {
    border-color: color-mix(in srgb, var(--primary) 50%, var(--border));
}

.group-shortcuts {
    display: flex;
    align-items: center;
    gap: 6px;
}

.shortcut-separator {
    font-size: 0.8125rem;
    color: var(--text-subtle);
}

@media (max-width: 640px) {
    .fab-container {
        display: none;
    }
}
</style>
