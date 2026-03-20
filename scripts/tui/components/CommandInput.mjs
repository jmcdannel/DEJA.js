/**
 * scripts/tui/components/CommandInput.mjs
 * Renders the command input line with a slash-command dropdown menu.
 * When the user types `/`, a dropdown appears showing matching commands
 * (filtered as they type). Arrow keys navigate, Enter selects, Esc dismisses.
 *
 * Owns its own input state — App reads/controls via ref:
 *   getText(), handleTab(), handleChar(c), handleBackspace(), handleClear(),
 *   handleArrowUp(), handleArrowDown(), getSelectedCommand()
 */

import React, { useState, useMemo, useImperativeHandle, forwardRef } from 'react'
import { Box, Text } from 'ink'
import { complete, list } from '../commands/registry.mjs'

const h = React.createElement

export const CommandInput = React.memo(forwardRef(function CommandInput(_props, ref) {
  const [inputText, setInputText] = useState('')
  const [completionIndex, setCompletionIndex] = useState(0)
  const [menuIndex, setMenuIndex] = useState(0)

  // All commands for the full menu (when just `/` is typed)
  const allCommands = useMemo(() => list(), [])

  // Compute matching commands for the dropdown
  const menuItems = useMemo(() => {
    if (!inputText.startsWith('/')) return []
    const partial = inputText.slice(1)
    if (partial.length === 0) return allCommands // show all when just "/"
    const matchingNames = complete(partial)
    return allCommands.filter(cmd => matchingNames.includes(cmd.name))
  }, [inputText, allCommands])

  const showMenu = inputText.startsWith('/') && menuItems.length > 0

  useImperativeHandle(ref, () => ({
    getText() { return inputText },

    /** Tab: cycle through completions, replace inputText with the match */
    handleTab() {
      if (!inputText.startsWith('/') || inputText.length <= 1) return
      const partial = inputText.slice(1)
      const matches = complete(partial)
      if (matches.length === 0) return
      const idx = completionIndex % matches.length
      setInputText('/' + matches[idx])
      setCompletionIndex(idx + 1)
      setMenuIndex(0)
    },

    handleChar(char) {
      setInputText(t => t + char)
      setCompletionIndex(0)
      setMenuIndex(0)
    },

    handleBackspace() {
      setInputText(t => t.slice(0, -1))
      setCompletionIndex(0)
      setMenuIndex(0)
    },

    handleClear() {
      setInputText('')
      setCompletionIndex(0)
      setMenuIndex(0)
    },

    /** Move selection up in the command menu */
    handleArrowUp() {
      if (!showMenu) return false
      setMenuIndex(i => Math.max(0, i - 1))
      return true // consumed the key
    },

    /** Move selection down in the command menu */
    handleArrowDown() {
      if (!showMenu) return false
      setMenuIndex(i => Math.min(menuItems.length - 1, i + 1))
      return true // consumed the key
    },

    /** Return the selected command name (for Enter key) or null */
    getSelectedCommand() {
      if (!showMenu) return null
      return menuItems[menuIndex] ? '/' + menuItems[menuIndex].name : null
    },
  }), [inputText, completionIndex, menuIndex, showMenu, menuItems])

  // ── Render ──────────────────────────────────────────────────────────────────

  const isSlash = inputText.startsWith('/')
  const textColor = isSlash ? '#00FFFF' : undefined

  // Ghost text (only when menu is NOT shown — menu replaces ghost)
  let ghost = ''
  if (isSlash && inputText.length > 1 && !showMenu) {
    const partial = inputText.slice(1)
    const matches = complete(partial)
    if (matches.length > 0 && matches[0] !== partial) {
      ghost = matches[0].slice(partial.length)
    }
  }

  return h(Box, { flexDirection: 'column' },
    // Prompt line
    h(Box, null,
      h(Text, { color: '#00C4FF' }, '> '),
      h(Text, { color: textColor }, inputText),
      ghost ? h(Text, { dimColor: true }, ghost) : null,
      h(Text, { color: '#00C4FF' }, '▌')
    ),

    // Command dropdown menu
    showMenu
      ? h(Box, { flexDirection: 'column', paddingLeft: 2 },
          ...menuItems.map((cmd, i) => {
            const selected = i === menuIndex
            const aliasStr = cmd.aliases && cmd.aliases.length
              ? ` (${cmd.aliases.map(a => '/' + a).join(', ')})`
              : ''
            return h(Box, { key: cmd.name },
              h(Text, {
                color: selected ? '#00FFFF' : undefined,
                bold: selected,
                dimColor: !selected,
              },
                `${selected ? '▸' : ' '} /${cmd.name}${aliasStr}`
              ),
              h(Text, { dimColor: true },
                `  ${cmd.description}`
              )
            )
          })
        )
      : null
  )
}))
