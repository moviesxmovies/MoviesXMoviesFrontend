<template>
  <div class="deck" aria-hidden="true">
    <div class="deck-poster deck-poster--back">
      <svg viewBox="0 0 240 360" preserveAspectRatio="xMidYMid slice">
        <rect width="240" height="360" fill="#23424c" />
        <circle cx="168" cy="120" r="44" fill="#e0c9a0" />
        <path d="M0 236 60 178l46 40 54-62 80 86v118H0z" fill="#16303a" />
        <path d="M0 292c60-22 150-22 240 0v68H0z" fill="#0d1e25" />
      </svg>
    </div>
    <div class="deck-poster deck-poster--mid">
      <svg viewBox="0 0 240 360" preserveAspectRatio="xMidYMid slice">
        <rect width="240" height="360" fill="#6e2a2f" />
        <circle cx="76" cy="128" r="56" fill="#d9825a" />
        <rect y="230" width="240" height="130" fill="#3a1518" />
        <path d="M48 230h144l-20 34H70z" fill="#1f0b0d" />
      </svg>
    </div>

    <div class="deck-card">
      <div class="deck-poster--front">
        <svg viewBox="0 0 288 400" preserveAspectRatio="xMidYMid slice">
          <rect width="288" height="400" fill="#0e0d0c" />
          <path d="M144 400 32 136h224z" fill="#e8a33d" opacity=".1" />
          <rect x="32" y="40" width="224" height="124" rx="2" fill="#f4ecdf" />
          <path d="M32 164V124l64-34 42 28 50-40 68 46v40z" fill="#c9861f" />
          <circle cx="204" cy="76" r="14" fill="#e8a33d" />
          <g fill="#1d1a16">
            <path d="M0 300c0-18 14-30 32-30s32 12 32 30v100H0z" />
            <path d="M72 300c0-18 14-30 32-30s32 12 32 30v100H72z" />
            <path d="M144 300c0-18 14-30 32-30s32 12 32 30v100h-64z" />
            <path d="M216 300c0-18 14-30 32-30s32 12 32 30v100h-64z" />
          </g>
          <g fill="#0a0908">
            <circle cx="176" cy="262" r="17" />
            <path d="M150 300c0-14 12-22 26-22s26 8 26 22v14h-52z" />
          </g>
        </svg>
        <div class="deck-title">
          <span class="deck-name">The Last Show</span>
          <span class="deck-meta">2026 · Drama</span>
        </div>
      </div>
      <div class="deck-stub ticket-tear">
        <i v-for="n in 5" :key="n" class="pi" :class="n <= 4 ? 'pi-star-fill' : 'pi-star'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck {
  position: relative;
  height: 32rem;
}

.deck-poster {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 14rem;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.deck-poster svg,
.deck-poster--front svg {
  display: block;
  width: 100%;
  height: 100%;
}

.deck-poster--back {
  transform: translate(-50%, -50%) translateX(-8rem) rotate(-9deg);
}

.deck-poster--mid {
  transform: translate(-50%, -50%) translateX(8rem) rotate(8deg);
}

.deck-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18rem;
  transform: translate(-50%, -50%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.deck-poster--front {
  position: relative;
  aspect-ratio: 288 / 400;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
}

.deck-title {
  position: absolute;
  left: 1.25rem;
  right: 1.25rem;
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #f4ecdf;
}

.deck-name {
  font-family: var(--font-display);
  font-size: 1.75rem;
  line-height: 1.15;
}

.deck-meta {
  font-size: 0.8125rem;
  color: rgba(244, 236, 223, 0.76);
}

.deck-stub {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--star-fill);
  font-size: 1.25rem;
}
</style>
