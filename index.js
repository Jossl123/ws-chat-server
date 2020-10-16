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
                    userConnected[userConnected.length] = data.name;
                    wss.clients.forEach(function e(client) {
                        if (client != ws) {
                            client.send(JSON.stringify({
                                type: "newConnection",
                                data: data.name,
                                nameColor: data.nameColor,
                                onlineUser: userConnected
                            }));
                        } else {
                            ws.name = data.name
                            client.send(JSON.stringify({
                                type: "connected",
                                data: data.name,
                                nameColor: data.nameColor,
                                onlineUser: userConnected
                            }));
                        };
                    });
                } else {
                    ws.send(JSON.stringify({
                        type: "nameInvalid",
                        userConnected: userConnected
                    }))
                }
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
                            name: "You",
                            data: data.msg,
                            nameColor: data.nameColor
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

            default:
                break;
        }
    });

    ws.on("close", () => {
        for (let i = userConnected.indexOf(ws.name); i < userConnected.length; i++) {
            userConnected[i] = userConnected[i + 1];
        }
        userConnected.pop();

        wss.clients.forEach(function e(client) {
            client.send(JSON.stringify({
                type: "LostAClient",
                data: userConnected
            }));
        });
        console.log("We lost a client");
    })
});

wss.on("error", function(err) {
    console.log(err)
});