import { describe, it, expect, vi, beforeEach } from 'vitest'

const acquireThrottleMock = vi.fn().mockResolvedValue(undefined)
const pushMock = vi.fn().mockResolvedValue(undefined)

vi.mock('@repo/modules/locos', () => ({
  useLocos: () => ({ acquireThrottle: acquireThrottleMock }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

import { useQuickThrottle } from './useQuickThrottle'

describe('useQuickThrottle.open', () => {
  beforeEach(() => {
    acquireThrottleMock.mockClear()
    pushMock.mockClear()
  })

  it('acquires throttle and navigates on a valid address', async () => {
    const { open } = useQuickThrottle()
    await open(42)
    expect(acquireThrottleMock).toHaveBeenCalledWith(42)
    expect(pushMock).toHaveBeenCalledWith({ name: 'throttle', params: { address: 42 } })
  })

  it('rejects non-integer addresses', async () => {
    const { open } = useQuickThrottle()
    await open(3.5)
    expect(acquireThrottleMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('rejects address 0 and negatives', async () => {
    const { open } = useQuickThrottle()
    await open(0)
    await open(-1)
    expect(acquireThrottleMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('rejects addresses above 9999', async () => {
    const { open } = useQuickThrottle()
    await open(10000)
    expect(acquireThrottleMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('rejects NaN', async () => {
    const { open } = useQuickThrottle()
    await open(Number.NaN)
    expect(acquireThrottleMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('propagates acquire errors and does not navigate', async () => {
    acquireThrottleMock.mockRejectedValueOnce(new Error('firestore down'))
    const { open } = useQuickThrottle()
    await expect(open(42)).rejects.toThrow('firestore down')
    expect(pushMock).not.toHaveBeenCalled()
  })
})

describe('useQuickThrottle.openGlobal', () => {
  it('flips globalDialogOpen to true', () => {
    const { openGlobal, globalDialogOpen } = useQuickThrottle()
    globalDialogOpen.value = false
    openGlobal()
    expect(globalDialogOpen.value).toBe(true)
  })
})

describe('useQuickThrottle.closeGlobal', () => {
  it('flips globalDialogOpen to false', () => {
    const { closeGlobal, globalDialogOpen } = useQuickThrottle()
    globalDialogOpen.value = true
    closeGlobal()
    expect(globalDialogOpen.value).toBe(false)
  })
})
