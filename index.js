const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 9898 });

let userConnected = [];

wss.on("connection", ws => {

    console.log("New client connected");

    ws.on("message", data => {

        data = JSON.parse(data);

        switch (data.type) {
            case "newConnection":
                if (!userConnected.includes(data.name)) {
                    userConnected.push(data.name)
                    wss.clients.forEach(function e(client) {
                        if (client != ws) {
                            client.send(JSON.stringify({
                                type: data.type,
                                name: data.name,
                                data: data.msg,
                                nameColor: data.nameColor
                            }));
                        } else {
                            client.send(JSON.stringify({
                                type: data.type,
                                name: "You",
                                data: data.msg,
                                nameColor: data.nameColor
                            }));
                        };
                    });
                } else {
                    ws.send(JSON.stringify({
                        type: "nameInvalid",
                        onlineUser: userConnected
                    }))
                }

                break;

            case "editNcik":
                userConnected.splice(userConnected.indexOf(data.oldName), 1, data.newName);
                wss.clients.forEach(function e(client) {
                    client.send(JSON.stringify({
                        type: data.type,
                        oldName: data.oldName,
                        newName: data.newName,
                        onlineUser: userConnected
                    }));
                    console.log(`${data.oldName} changed his nickname to ${data.newName}`)
                });
                break;

            case "message":
                wss.clients.forEach(function e(client) {
                    if (client != ws) {
                        client.send(JSON.stringify({
                            type: data.type,
                            name: data.name,
                            data: data.msg,
                            nameColor: data.nameColor
                        }));
                    } else {
                        client.send(JSON.stringify({
                            type: data.type,
                            data: data.data,
                            name: data.name
                        }));
                    };
                });
                break;

            case "typing":
                wss.clients.forEach(function e(client) {
                    client.send(JSON.stringify({
                        type: data.type,
                        data: data.data,
                        name: data.name
                    }));
                });
                break;

            case "disconnecting":
                userConnected.splice(userConnected.indexOf(data.name), 1);
                wss.clients.forEach(function e(client) {
                    client.send(JSON.stringify({
                        type: data.type,
                        name: data.name,
                        onlineUser: userConnected
                    }));
                    console.log(`${data.name} is disconnecting`)
                });
                break;

            default:
                break;
        }
    });

    ws.on("close", () => {
        console.log("A client just disconnected");
    })
});

wss.on("error", function(err) {
    console.log(err)
});