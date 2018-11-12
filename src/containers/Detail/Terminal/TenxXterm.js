/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * xterm
 *
 * @author Songsz
 * @date 2018-11-12
 *
*/

import React from 'react'
import { XTerm } from '@tenx-ui/xterm'

export default class TenxXterm extends React.Component {
  componentDidMount() {
    runFakeTerminal(this.refs.xterm)
  }
  componentWillUnmount() {
  }

  render() {
    return <div>
      <XTerm
        ref="xterm"
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
        }}
        addons={[ 'fit', 'fullscreen', 'search' ]}
      />
    </div>
  }
}

function runFakeTerminal(xterm) {
  const term = xterm.getTerminal()
  const shellprompt = '$ '

  function prompt() {
    xterm.write('\r\n' + shellprompt)
  }
  xterm.writeln('Welcome to xterm.js')
  xterm.writeln('This is a local terminal emulation, without a real terminal in the back-end.')
  xterm.writeln('Type some keys and commands to play around.')
  xterm.writeln('')
  prompt()

  term.on('key', function(key, ev) {
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey

    if (ev.keyCode === 13) {
      prompt()
      // } else if (ev.keyCode == 8) {
      //   // Do not delete the prompt
      //   if (term['x'] > 2) {
      //     xterm.write('\b \b')
      //   }
    } else if (printable) {
      xterm.write(key)
    }
  })

  term.on('paste', function(data) {
    xterm.write(data)
  })
}
