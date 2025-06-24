import { getCurrentUser } from 'vuefire'

// Helper function to check if IP is in local network range
function isLocalNetwork(ip: string): boolean {
  const localRanges = [
    '192.168.',  // Common home/office network
    '10.',       // Private network
    '127.0.0'    // Localhost
  ]
  return localRanges.some(range => ip.startsWith(range))
}

async function checkLocalNetwork(): Promise<boolean> {
  try {
    const response = await fetch('http://api.ipify.org?format=json')
    const data = await response.json()
    return isLocalNetwork(data.ip)
  } catch (error) {
    console.error('Network check failed:', error)
    return false
  }
}

export async function requireAuth() {
  const currentUser = await getCurrentUser()
  const isLocal = await checkLocalNetwork()

  if (!currentUser) {
    return {
      path: '/login',
      query: { redirect: window.location.pathname },
    }
  }

  if (!isLocal) {
    return {
      path: '/connect',
      query: { 
        error: 'local-network-required',
        redirect: window.location.pathname 
      },
    }
  }
}
