const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 9898 });

let userConnected = [];

wss.on("connection", ws => {

    console.log("New client connected");

    ws.on("message", data => {

        data = JSON.parse(data);

        if (data.type == "newConnection") {

            console.log(userConnected);

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
                        client.send(JSON.stringify({
                            type: "connected",
                            data: data.name,
                            nameColor: data.nameColor,
                            onlineUser: userConnected
                        }));
                    };
                });
                console.log(userConnected);
            } else {
                ws.send(JSON.stringify({
                    type: "nameInvalid",
                    userConnected: userConnected
                }))
            }

        } else if (data.type == "message") {
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
        } else if (data.type == "typing") {
            wss.clients.forEach(function e(client) {
                client.send(JSON.stringify({
                    type: data.type,
                    data: data.data,
                    name: data.name
                }));
            });
        }
    });

    ws.on("close", () => {
        for (let i = userConnected.indexOf(ws.nick); i < userConnected.length; i++) {
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