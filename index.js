'use strict'

let Options = require('options')
let url = require('url')
let querystring = require('querystring')
let SSEClient = require('./client')

class SSE {
  constructor (httpServer, options) {
    options = new Options({
      path: '/sse',
      verifyRequest: null
    }).merge(options)

    this.server = httpServer

    let oldListeners = this.server.listeners('request')

    this.server.removeAllListeners('request')

    let self = this

    this.server.on('request', function (req, res) {
      let u = url.parse(req.url)
      let pathname = u.pathname.replace(/^\/{2,}/, '/')

      if (pathname === options.value.path && (options.value.verifyRequest == null || options.value.verifyRequest(req))) {
        self.handleRequest(req, res, u.query)
      } else {
        oldListeners.forEach(function (listener) {
          listener.call(self.server, req, res)
        })
      }
    })

    this.Client = SSEClient
  }

  handleRequest (req, res, query) {
    let client = new SSEClient(req, res)
    client.initialize()
    this.emit('connection', client, querystring.parse(query))
  }
}

// Inherit event emitter
Object.setPrototypeOf(SSE.prototype, require('events').EventEmitter.prototype)

module.exports = SSE
