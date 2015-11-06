'use strict'

let crypto = require('crypto')

let generateId = function () {
  return crypto.createHash('md5')
    .update((new Date()).getTime().toString(), 'utf8')
    .digest('hex')
}

class SSEClient {
  constructor (req, res) {
    this.req = req
    this.res = res
    let self = this
    res.on('close', function () {
      self.emit('close')
    })
  }

  initialize () {
    this.req.socket.setNoDelay(true)
    
    let origin = this.req.headers.referer !== undefined ? require('url').parse(this.req.headers.referer) : '*'
    origin = typeof origin === 'object' ? origin.protocol + '\/\/' + origin.host : origin

    this.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || origin
    })

    this.res.write(':ok\n\n')
  }

  send (payload) {
    if (arguments.length === 0) return

    // Construct the payload
    if (typeof payload !== 'object') {
      payload = {
        data: payload
      }
    }

    // If the data is a JSON object, convert to string
    if (typeof payload.data === 'object') {
      payload.data = JSON.stringify(payload.data)
    }

    // Make sure there is an ID (generate if necessary)
    payload.id = payload.id || generateId()

    // If an event is specified, write it.
    if (payload.event) {
      this.res.write('event: ' + payload.event + '\n')
    }

    // If a retry is specified, write it.
    if (payload.retry) {
      this.res.write('retry: ' + payload.retry + '\n')
    }

    // Write the ID
    if (payload.id) {
      this.res.write('id: ' + payload.id + '\n')
    }

    // Process each line of the data
    let me = this
    payload.data.replace(/(\r\n|\r|\n)/g, '\n').split(/\n/).forEach(function (line, index, a) {
      me.res.write('data: ' + line + '\n' + (index === a.length - 1 ? '\n' : ''))
    })
  }

  close () {
    this.res.end()
  }
}

// Inherit event emitter
Object.setPrototypeOf(SSEClient.prototype, require('events').EventEmitter.prototype)

module.exports = SSEClient
