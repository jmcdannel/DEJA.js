/**
 * scripts/tui/components/CommandInput.mjs
 * Renders the command input line with slash-command highlighting and tab-completion ghost.
 * Owns its own input state — App reads/controls via ref: getText(), handleTab(), handleChar(c), handleBackspace(), handleClear().
 */

import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Box, Text } from 'ink'
import { complete } from '../commands/registry.mjs'

const h = React.createElement

/**
 * CommandInput — owns its own input state.
 * App reads/controls input via ref: getText(), handleTab(), handleChar(c), handleBackspace(), handleClear()
 *
 * Visual rendering:
 * - Prompt `> ` in cyan
 * - Input text (cyan when starts with `/`)
 * - Ghost text (dimmed completion preview)
 * - Cursor block `▌` in cyan
 */
export const CommandInput = React.memo(forwardRef(function CommandInput(_props, ref) {
  const [inputText, setInputText] = useState('')
  const [completionIndex, setCompletionIndex] = useState(0)

  useImperativeHandle(ref, () => ({
    /** Return the current input text */
    getText() {
      return inputText
    },

    /** Tab: cycle through completions, replace inputText with the match */
    handleTab() {
      if (!inputText.startsWith('/') || inputText.length <= 1) return

      const partial = inputText.slice(1)
      const matches = complete(partial)
      if (matches.length === 0) return

      const idx = completionIndex % matches.length
      setInputText('/' + matches[idx])
      setCompletionIndex(idx + 1)
    },

    /** Append a character, reset completion index */
    handleChar(char) {
      setInputText(t => t + char)
      setCompletionIndex(0)
    },

    /** Remove last character, reset completion index */
    handleBackspace() {
      setInputText(t => t.slice(0, -1))
      setCompletionIndex(0)
    },

    /** Clear input, reset completion index */
    handleClear() {
      setInputText('')
      setCompletionIndex(0)
    },
  }), [inputText, completionIndex])

  // Render
  const isSlash = inputText.startsWith('/')
  const textColor = isSlash ? '#00FFFF' : undefined

  let ghost = ''
  if (isSlash && inputText.length > 1) {
    const partial = inputText.slice(1)
    const matches = complete(partial)
    if (matches.length > 0 && matches[0] !== partial) {
      ghost = matches[0].slice(partial.length)
    }
  }

  return h(Box, null,
    h(Text, { color: '#00C4FF' }, '> '),
    h(Text, { color: textColor }, inputText),
    ghost ? h(Text, { dimColor: true }, ghost) : null,
    h(Text, { color: '#00C4FF' }, '▌')
  )
}))
