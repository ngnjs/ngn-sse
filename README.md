# ngn-sse

A server-sent events implementation for node.js. Adapted from [einaros/sse.js](https://github.com/einaros/sse.js). Supports CORS.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

[![Code Climate](https://codeclimate.com/github/ngnjs/ngn-sse/badges/gpa.svg)](https://codeclimate.com/github/ngnjs/ngn-sse)

## Install

`npm install ngn-sse`

## Basic Node.js Server

```js
let SSE = require('ngn-sse')
let http = require('http')

let server = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.end('okay')
});

server.listen(8080, '127.0.0.1', function() {
  let sse = new SSE(server)
  sse.on('connection', function(client) {
    client.send({
      event: topic, 
      data: payload
    })
  })
})
```

Options for `client.send`:

```js
{
  event: 'topic', // Optional
  data: {         // This can also be a string/number
    my: 'data'
  },
  id: 'optional', // Auto-generated if not defined
  retry: 'optional' // Optional retry data
}
```

## Basic Client

```html
var es = new EventSource("/sse")

// Handle any message
es.onmessage = function (event) {
  console.log(event.data)
}

// Handle a specific event type/topic
es.addEventListener('topic', function(e){
  console.log(e.data)
})
```
