#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import { App } from './tui/App.mjs'

render(React.createElement(App), { exitOnCtrlC: false })
