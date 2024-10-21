export function useFunctions() {
  const MAX = 32
  const defaultFunctions = Array.from({ length: MAX }, (_, n) => ({
    id: n,
    label: `F${n}`,
  }))

  return {
    defaultFunctions,
  }
}

export default useFunctions
