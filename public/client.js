+function () {
	var socket;
	var channel;
	var name;
  	
	document.getElementById('connect').addEventListener('click', function () {
		var messages = document.getElementById('messages');
		channel = document.getElementById('channel').value;
		messages.innerHTML = 'Connecting...';
		name = document.getElementById('name').value;
		
		if (socket) {
			socket.disconnect();
		}

		socket = io.connect(window.location.protocol + "//"
				 + window.location.host + "?channel="+channel);
		socket.on('connect', function () {
		    socket.send(JSON.stringify({to: channel, message: name + " connected"}));

		    socket.on('message', function (msg) {
		      messages.innerHTML += "<br>" + msg;
		      document.getElementById('message').value = '';
		    });
		});
	});

	document.getElementById('send').addEventListener('click', function () {
		var messages = document.getElementById('messages');
		var message = document.getElementById('message').value;
		socket.send(JSON.stringify({to: channel, message: name+": "+message}));
	});
}();