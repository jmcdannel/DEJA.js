import { ref, watch, readonly, type Ref } from 'vue'

interface CommandBucket {
  timestamp: number
  count: number
}

interface WsMessage {
  action: string
  payload?: unknown
}

export function useCommandActivity(wsMessages: Ref<WsMessage[]>) {
  const activity = ref<CommandBucket[]>([])
  const BUCKET_SIZE_MS = 60_000 // 1 minute
  const MAX_BUCKETS = 10 // 10-minute window

  function getCurrentBucketTimestamp(): number {
    return Math.floor(Date.now() / BUCKET_SIZE_MS) * BUCKET_SIZE_MS
  }

  watch(
    wsMessages,
    (messages) => {
      if (!messages || messages.length === 0) return
      const latest = messages[messages.length - 1]
      if (latest?.action !== 'dcc') return

      const bucketTs = getCurrentBucketTimestamp()
      const lastBucket = activity.value[activity.value.length - 1]

      if (lastBucket && lastBucket.timestamp === bucketTs) {
        lastBucket.count++
      } else {
        activity.value.push({ timestamp: bucketTs, count: 1 })
        if (activity.value.length > MAX_BUCKETS) {
          activity.value.shift()
        }
      }
    },
    { deep: true },
  )

  return { activity: readonly(activity) }
}
