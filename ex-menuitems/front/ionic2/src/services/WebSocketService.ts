import {Project} from "../core/Project";
import {baseUrl} from "../core";

interface MessageData {
    event: string;
    payload: {
        successMessage: string,
        item: Project
    };
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)

    ws.onopen = () => {
        console.log("WebSocket opened");
        // ws.send(JSON.stringify({type: 'authorization', payload :{token}}));
    };

    ws.onclose = () => {
        console.log("WebSocket closing");
    };

    ws.onerror = error => {
        console.log("WebSocket error:", error);
    };

    ws.onmessage = messageEvent => {
        console.log("WebSocket message: ", messageEvent.data);
        onMessage(JSON.parse(messageEvent.data));
    };

    return () => {
        ws.close();
        console.log("Closed WebSocket");
    }
}