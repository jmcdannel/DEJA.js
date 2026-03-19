/**
 * scripts/tui/components/CommandInput.mjs
 * Renders the command input line with slash-command highlighting and tab-completion ghost.
 * Also exports useCommandInput hook for managing input state.
 */

import React, { useState } from 'react'
import { Box, Text } from 'ink'
import { complete } from '../commands/registry.mjs'

const h = React.createElement

/**
 * CommandInput component — renders the input line.
 *
 * - If value starts with `/`, text is rendered in cyan
 * - Shows a dim ghost of the top tab-completion match after typed text
 * - Always shows the cursor block `▌` in cyan
 *
 * @param {{ value: string }} props
 */
export function CommandInput({ value }) {
  const isSlash = value.startsWith('/')
  const textColor = isSlash ? '#00FFFF' : undefined

  // Compute ghost completion text
  let ghost = ''
  if (isSlash && value.length > 1) {
    const partial = value.slice(1) // strip leading /
    const matches = complete(partial)
    if (matches.length > 0 && matches[0] !== partial) {
      // Show the remaining part of the top match as a ghost
      ghost = matches[0].slice(partial.length)
    }
  }

  return h(Box, null,
    h(Text, { color: '#00C4FF' }, '> '),
    h(Text, { color: textColor }, value),
    ghost
      ? h(Text, { dimColor: true }, ghost)
      : null,
    h(Text, { color: '#00C4FF' }, '▌')
  )
}

/**
 * useCommandInput hook — manages input state with tab-completion cycling.
 *
 * @returns {{ inputText: string, setInputText: Function, handleTab: Function, handleChar: Function, handleBackspace: Function, handleClear: Function }}
 */
export function useCommandInput() {
  const [inputText, setInputText] = useState('')
  const [completionIndex, setCompletionIndex] = useState(0)

  /** Tab: cycle through completions, replace inputText with the match */
  function handleTab() {
    if (!inputText.startsWith('/') || inputText.length <= 1) return

    const partial = inputText.slice(1) // strip leading /
    const matches = complete(partial)
    if (matches.length === 0) return

    const idx = completionIndex % matches.length
    setInputText('/' + matches[idx])
    setCompletionIndex(idx + 1)
  }

  /** Append a character, reset completion index */
  function handleChar(char) {
    setInputText(t => t + char)
    setCompletionIndex(0)
  }

  /** Remove last character, reset completion index */
  function handleBackspace() {
    setInputText(t => t.slice(0, -1))
    setCompletionIndex(0)
  }

  /** Clear input, reset completion index */
  function handleClear() {
    setInputText('')
    setCompletionIndex(0)
  }

  return { inputText, setInputText, handleTab, handleChar, handleBackspace, handleClear }
}
