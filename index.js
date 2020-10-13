const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 9898 });

wss.on("connection", ws => {
    console.log("New client connected");

    ws.on("message", data => {

        data = JSON.parse(data);

        if (data.type == "newConnection") {
            wss.clients.forEach(function e(client) {
                if (client != ws) {
                    client.send(JSON.stringify({
                        type: "newConnection",
                        data: data.nick,
                        nameColor: data.nameColor
                    }));
                } else {
                    client.send(JSON.stringify({
                        type: "connected",
                        data: data.nick,
                        nameColor: data.nameColor
                    }));
                };
            });
        } else if (data.type == "message") {
            wss.clients.forEach(function e(client) {
                if (client != ws) {
                    client.send(JSON.stringify({
                        name: data.nick,
                        data: data.msg,
                        nameColor: data.nameColor
                    }));
                } else {
                    client.send(JSON.stringify({
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
        console.log("We lost a client");
    })
});

wss.on("error", function(err) {
    console.log(err)
});