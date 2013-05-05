var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , zmq = require('zmq')
  , uuid = require('uuid')
  , subscriber = zmq.socket('sub')
  , publisher = zmq.socket('pub')
  , zmqAddress = "tcp://127.0.0.1:6785";

server.listen(8080);
io.set('log level', 2);

app.use(express.static(__dirname + '/public'));


io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
    console.log("Authorizing new websocket connection...");
    handshakeData.listener = new Listener(handshakeData.query.channel || 'all');
    console.log("Created listener for channel: " + handshakeData.listener.channel);
    callback(null, true);
  });
});


publisher.bind(zmqAddress, function(err) {
  if (err) {
  	console.log(err)
  } else {
  	io.sockets.on('connection', function (socket) {
      console.log("Client connected...");
      socket.set('listener', socket.handshake.listener.listen(socket));
	  });
  }
});

var Listener = function (channel) {
  this.channel = channel;
  this.sub = zmq.socket('sub');
  this.sub.connect(zmqAddress);
  this.sub.subscribe(channel);
}

Listener.prototype.listen = function (socket) {
  var self = this;
  self.socket = socket;
  
  // On received message to ZMQ - send data to websocket
  this.sub.on("message", function (reply) {
    self.socket.send(reply.toString());
    console.log("Received zmq message on channel: " + self.channel);
    console.log(reply.toString());
  });

  // On received message to websocket - send data to adress
  this.socket.on("message", function (msg) {
    msg = JSON.parse(msg);
    console.log("Received websocket message...");
    for (var k in msg) console.log(k, msg[k]);
    publisher.send((msg.to || "all") + ":" + msg.message);  
    console.log("Sent to zmq channel: " + (msg.to || "all"));
  });

  socket.on('disconnect', function () {
    publisher.send(self.channel + ":" + "disconnected");
    console.log("Client disconnected");
  });
  return this;
};