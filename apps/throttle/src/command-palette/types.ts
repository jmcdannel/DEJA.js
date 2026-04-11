export type CommandCategory = 'navigation' | 'browse' | 'throttle' | 'turnout' | 'effect' | 'signal' | 'settings'

export interface CommandStack {
  title: string
  commands: Command[]
}

export interface Command {
  /** Unique stable identifier. Used for Vue keys and future recent-command tracking. */
  id: string
  /** Display title. The primary searchable string. */
  title: string
  /** Optional context shown in dim text next to the title. */
  description?: string
  /** Category for grouping in the results list. */
  category: CommandCategory
  /** mdi icon name. */
  icon: string
  /** Additional search terms not shown in the title (e.g. address numbers, device names). */
  keywords?: string[]
  /** Optional display-only keyboard hint. Does not register the shortcut — that's done in useGlobalKeybindings. */
  shortcut?: string[]
  /** Called when the user runs this command. May be async. */
  run: () => void | Promise<void>
  /**
   * If present, running the command pushes a new palette level instead of closing.
   * The children are displayed as the new result set with a fresh input and a breadcrumb header.
   */
  children?: CommandStack
}
