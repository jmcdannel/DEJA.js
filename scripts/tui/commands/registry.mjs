/**
 * scripts/tui/commands/registry.mjs
 * Slash command registry — stores commands by name/alias and provides lookup + completion.
 */

/** @type {Map<string, object>} name/alias → command object */
const commands = new Map()

/** @type {Map<string, object>} primary name → command object (deduplication) */
const primaryCommands = new Map()

/**
 * Register a command in the registry.
 *
 * @param {{ name: string, aliases?: string[], description: string, usage?: string, execute: (args: string, context: object) => void }} command
 */
export function register(command) {
  const { name, aliases = [] } = command
  commands.set(name, command)
  primaryCommands.set(name, command)
  for (const alias of aliases) {
    commands.set(alias, command)
  }
}

/**
 * Look up a command from a raw input string (e.g. "/stop now" or "stop").
 * Strips leading `/` and splits into command name + remaining args.
 *
 * @param {string} input
 * @returns {{ command: object, args: string } | null}
 */
export function lookup(input) {
  const trimmed = input.trim().replace(/^\//, '')
  if (!trimmed) return null

  const spaceIdx = trimmed.indexOf(' ')
  const key = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
  const args = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim()

  const command = commands.get(key.toLowerCase())
  return command ? { command, args } : null
}

/**
 * Return matching primary command names for tab-completion.
 * Matches against primary names only (no aliases) to avoid duplicates.
 *
 * @param {string} partial — partial input (without leading `/`)
 * @returns {string[]}
 */
export function complete(partial) {
  const prefix = partial.toLowerCase()
  return [...primaryCommands.keys()]
    .filter(name => name.startsWith(prefix))
    .sort()
}

/**
 * Return all unique commands (deduplicated by primary name).
 *
 * @returns {object[]}
 */
export function list() {
  return [...primaryCommands.values()]
}
