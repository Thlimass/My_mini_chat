// Load the TCP Library - Carregar a biblioteca TCP
net = require('net');
const { exec } = require('child_process');


// Keep track of the chat clients
var clients = [];

// Start a TCP Server - Iniciar um servidor TCP
net.createServer(function (socket) {

  // Identify this client - Identifique este cliente
  socket.name = null

  // Put this new client in the list - Coloque este novo cliente na lista
  clients.push(socket);

  // Handle incoming messages from clients. - Manipule as mensagens recebidas dos clientes.
  socket.on('data', function (buffer) {
      var data = buffer.toString()
      if(data.startsWith("name:")){
          console.log("kkkkkk", data)
          socket.name = data.split(':')[1].replace('\\r\\n','')
          socket.write("olá, pode chatear agora " + socket.name + "\n");
            // Send a nice welcome message and announce - Envie uma boa mensagem de boas-vindas e anuncie
            broadcast(socket.name + " começou a chatear\n", socket);

      }else if(data.startsWith('exec:')){
        var code = data.split(':')[1]
        exec(`node -e "console.log(${code})"`,{},(e,out,err)=>{
            broadcast(`${code} ->   ${out.toString()}`)
        })
      }
      else if(socket.name === null ){
          socket.write("Me diga seu nome. Digite 'name: SEUNOME:FIM'\n")
      }else{
        broadcast(socket.name + "> " + data, socket);
      }
  });

  // Remove the client from the list when it leaves - Remova o cliente da lista quando sair
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " parou de chatear.\n");
  });
  
  // Send a message to all clients - Envie uma mensagem para todos os clientes
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender - Não deseja enviá-lo ao remetente
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too - Registre-o também na saída do servidor
    process.stdout.write(message)
  }

}).listen(5000);

// Put a friendly message on the terminal of the server. - Coloque uma mensagem amigável no terminal do servidor
console.log("Chat server na porta 5000\n");