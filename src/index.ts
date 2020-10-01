import express from "express";
import { phpify } from "express-phpify";
import expressWs from "express-ws";
import WebSocket from "ws";

const appWs = expressWs(express());
const app = appWs.app;

const sessions: WebSocket[] = [];

phpify(app, {
    redirection: false,
});

app.ws("/ws", (user, req) => {
    user.on("message", () => {
        if (sessions.indexOf(user) < 0) {
            sessions.push(user);
            console.log("New User!");
        }
    });

    user.on("close", () => {
        sessions.splice(sessions.indexOf(user), 1);
        console.log("User Left!");
    });
});

app.ws("/gear/:username", (user, req) => {
    const username = req.params.username;

    user.on("message", (msg: string) => {
        const json = JSON.parse(msg);
        console.log(json);

        for (const session of sessions) {
            session.send(
                JSON.stringify({
                    username,
                    data: json
                })
            );
        }
    });
});

app.listen(14383);
console.log("Server Online!");
