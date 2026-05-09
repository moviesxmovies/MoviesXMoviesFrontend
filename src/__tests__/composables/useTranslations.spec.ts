import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTranslation } from '@/composables/useTranslation'

const mockReviewTranslation = { title: 'Obra maestra', content: 'Una película increíble.' }
const mockUserTranslation = { content: 'Una biografía traducida.' }

describe('useTranslation', () => {
  let fetchFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchFn = vi.fn()
  })

  // ── Estado inicial ───────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with isTranslated as false', () => {
      const { isTranslated } = useTranslation(fetchFn)
      expect(isTranslated.value).toBe(false)
    })

    it('starts with isLoading as false', () => {
      const { isLoading } = useTranslation(fetchFn)
      expect(isLoading.value).toBe(false)
    })

    it('starts with translatedData as null', () => {
      const { translatedData } = useTranslation(fetchFn)
      expect(translatedData.value).toBeNull()
    })

    it('starts with error as null', () => {
      const { error } = useTranslation(fetchFn)
      expect(error.value).toBeNull()
    })
  })

  // ── Primer translate (fetch necesario) ──────────────────────────────────────

  describe('translate — first call (no cached data)', () => {
    it('calls fetchFn once', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { translate } = useTranslation(fetchFn)
      await translate()
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('sets isLoading to true while fetching', async () => {
      let resolvePromise!: (v: unknown) => void
      fetchFn.mockReturnValue(new Promise((r) => { resolvePromise = r }))
      const { isLoading, translate } = useTranslation(fetchFn)

      const promise = translate()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockReviewTranslation)
      await promise
    })

    it('sets isLoading back to false after fetch resolves', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { isLoading, translate } = useTranslation(fetchFn)
      await translate()
      expect(isLoading.value).toBe(false)
    })

    it('sets translatedData with the value returned by fetchFn', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { translatedData, translate } = useTranslation(fetchFn)
      await translate()
      expect(translatedData.value).toEqual(mockReviewTranslation)
    })

    it('sets isTranslated to true after a successful fetch', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { isTranslated, translate } = useTranslation(fetchFn)
      await translate()
      expect(isTranslated.value).toBe(true)
    })

    it('works with a { content } response shape', async () => {
      fetchFn.mockResolvedValue(mockUserTranslation)
      const { translatedData, translate } = useTranslation(fetchFn)
      await translate()
      expect(translatedData.value).toEqual(mockUserTranslation)
    })

    it('works with a { title, body } response shape', async () => {
      const data = { title: 'Título', body: 'Cuerpo traducido' }
      fetchFn.mockResolvedValue(data)
      const { translatedData, translate } = useTranslation(fetchFn)
      await translate()
      expect(translatedData.value).toEqual(data)
    })
  })

  // ── Toggle: desactivar traducción ────────────────────────────────────────────

  describe('translate — toggling off when already translated', () => {
    it('sets isTranslated to false when called while isTranslated is true', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { isTranslated, translate } = useTranslation(fetchFn)
      await translate()
      expect(isTranslated.value).toBe(true)
      await translate()
      expect(isTranslated.value).toBe(false)
    })

    it('does not call fetchFn again when toggling off', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { translate } = useTranslation(fetchFn)
      await translate()
      await translate()
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('keeps translatedData intact when toggling off', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { translatedData, translate } = useTranslation(fetchFn)
      await translate()
      await translate()
      expect(translatedData.value).toEqual(mockReviewTranslation)
    })
  })

  // ── Re-activar desde caché ────────────────────────────────────────────────────

  describe('translate — re-enabling from cache', () => {
    it('sets isTranslated back to true without calling fetchFn again', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { isTranslated, translate } = useTranslation(fetchFn)

      await translate() // fetch → isTranslated = true
      await translate() // toggle off
      await translate() // re-enable from cache

      expect(isTranslated.value).toBe(true)
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })
  })

  // ── Manejo de errores ────────────────────────────────────────────────────────

  describe('translate — error handling', () => {
    it('sets error with the message when fetchFn rejects', async () => {
      fetchFn.mockRejectedValue(new Error('Network error'))
      const { error, translate } = useTranslation(fetchFn)
      await translate()
      expect(error.value).toBe('Network error')
    })

    it('sets error to "Translation failed" when the rejection has no message', async () => {
      fetchFn.mockRejectedValue({})
      const { error, translate } = useTranslation(fetchFn)
      await translate()
      expect(error.value).toBe('Translation failed')
    })

    it('does not set isTranslated to true when fetchFn rejects', async () => {
      fetchFn.mockRejectedValue(new Error('fail'))
      const { isTranslated, translate } = useTranslation(fetchFn)
      await translate()
      expect(isTranslated.value).toBe(false)
    })

    it('leaves translatedData as null when fetchFn rejects', async () => {
      fetchFn.mockRejectedValue(new Error('fail'))
      const { translatedData, translate } = useTranslation(fetchFn)
      await translate()
      expect(translatedData.value).toBeNull()
    })

    it('sets isLoading back to false even when fetchFn rejects', async () => {
      fetchFn.mockRejectedValue(new Error('fail'))
      const { isLoading, translate } = useTranslation(fetchFn)
      await translate()
      expect(isLoading.value).toBe(false)
    })

    it('clears a previous error before a new fetch attempt', async () => {
      fetchFn
        .mockRejectedValueOnce(new Error('first error'))
        .mockResolvedValueOnce(mockReviewTranslation)

      const { error, translate } = useTranslation(fetchFn)
      await translate()
      expect(error.value).toBe('first error')

      // Tras un error, translatedData sigue null → el siguiente translate hace fetch
      await translate()
      expect(error.value).toBeNull()
    })
  })

  // ── reset ─────────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('sets isTranslated back to false', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { isTranslated, translate, reset } = useTranslation(fetchFn)
      await translate()
      reset()
      expect(isTranslated.value).toBe(false)
    })

    it('sets translatedData back to null', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { translatedData, translate, reset } = useTranslation(fetchFn)
      await translate()
      reset()
      expect(translatedData.value).toBeNull()
    })

    it('sets error back to null', async () => {
      fetchFn.mockRejectedValue(new Error('fail'))
      const { error, translate, reset } = useTranslation(fetchFn)
      await translate()
      reset()
      expect(error.value).toBeNull()
    })

    it('forces a new fetch on the next translate call after reset', async () => {
      fetchFn.mockResolvedValue(mockReviewTranslation)
      const { translate, reset } = useTranslation(fetchFn)

      await translate()
      reset()
      await translate()

      expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('can be called multiple times without side effects', () => {
      const { isTranslated, translatedData, error, reset } = useTranslation(fetchFn)
      reset()
      reset()
      expect(isTranslated.value).toBe(false)
      expect(translatedData.value).toBeNull()
      expect(error.value).toBeNull()
    })
  })

  // ── Instancias independientes ─────────────────────────────────────────────────

  describe('independence between instances', () => {
    it('does not share state between two useTranslation instances', async () => {
      const fetchA = vi.fn().mockResolvedValue(mockReviewTranslation)
      const fetchB = vi.fn().mockResolvedValue(mockUserTranslation)

      const instanceA = useTranslation(fetchA)
      const instanceB = useTranslation(fetchB)

      await instanceA.translate()

      expect(instanceA.isTranslated.value).toBe(true)
      expect(instanceB.isTranslated.value).toBe(false)
    })
  })
})