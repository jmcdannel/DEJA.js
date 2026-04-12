import type { Component } from 'vue'

export type CommandCategory = 'navigation' | 'browse' | 'throttle' | 'turnout' | 'effect' | 'signal' | 'settings'

export interface CommandStack {
  title: string
  commands: Command[]
  /**
   * If present, the palette renders this component in place of the
   * command results list. Used for custom widgets like the mini
   * throttle controller.
   */
  component?: Component
  componentProps?: Record<string, unknown>
}

/**
 * 🎛️ Inline control variants for settings rows. Commands that carry a
 * `control` render directly inside the palette (no drill-down) and are
 * driven by ← / → / Enter on the active row.
 */
export interface ToggleControl {
  kind: 'toggle'
  value: boolean
  set: (next: boolean) => void | Promise<void>
}

export interface CycleControl<T = string> {
  kind: 'cycle'
  options: Array<{ value: T; label: string }>
  value: T
  set: (next: T) => void | Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- CycleControl<T>.set is contravariant in T; `any` is required for the heterogeneous union
export type SettingControl = ToggleControl | CycleControl<any>

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
  /**
   * When true, running this command does NOT close the palette. Used for
   * toggle-style commands where the user may flip multiple items in a row
   * (e.g. turnouts, effects).
   */
  keepOpen?: boolean
  /**
   * Optional trailing inline action buttons rendered on the result row.
   * Used by e.g. signals where each row has dedicated R / Y / G / clear
   * dots. Action clicks do NOT trigger the row's `run` handler and do NOT
   * close the palette.
   */
  actions?: CommandAction[]
  /**
   * 🏷️ Toggle-state hint for list rows that represent an on/off entity
   * (turnouts, effects). When present, the palette renders a trailing
   * status pill ("ON" / "OFF") next to the row title.
   */
  toggleState?: boolean
  /**
   * 🎛️ Inline setting control rendered directly on the row. When present,
   * ← / → / Enter on the active row drive the control instead of running
   * or drilling. Commands with a control implicitly keep the palette open.
   */
  control?: SettingControl
}

export interface CommandAction {
  id: string
  label: string
  /** Free-form color string (CSS color or theme name) used to tint the dot. */
  color: string
  icon?: string
  run: () => void | Promise<void>
}
