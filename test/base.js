'use strict'

let test = require('tape')
let EventSource = require('eventsource')
let port = 8087
let SSE = require('../')

test('Primary Objects', function (t) {
  t.ok(SSE !== undefined, 'SSE is defined.')
  t.end()
})

test('Setup Server', function (t) {
  let http = require('http')

  let server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('okay')
  })

  server.listen(port, '127.0.0.1', function () {
    let sse = new SSE(server)

    t.ok(true, 'SSE applied to server.')

    sse.on('connection', function (client) {
      t.pass('Client connection established.')

      client.send({
        event: 'test',
        data: {
          my: 'data'
        }
      })

      client.on('end', function () {
        t.pass('Client closed successfully.')
      })

      client.close()
    })
  })

  var es = new EventSource('http://localhost:' + port + '/sse')

  // Handle a specific event type/topic
  es.addEventListener('test', function (e) {
    t.ok(JSON.parse(e.data).my === 'data', 'Successsfully received data.')

    server.on('close', function () {
      t.end()
    })

    es.close()
    server.close()
  })
})
