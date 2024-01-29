import {baseUrl} from "../core";
import {MenuItemDto} from "../core/MenuItemDto";
import {MenuItem2Dto} from "../core/MenuItem2Dto";

export interface MessageData {
    menuItems: MenuItemDto[]
}

export const newWebSocket = (onMessage: (data: MenuItem2Dto) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);

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
        console.log("WebSocket message: ", JSON.parse(messageEvent.data));
        onMessage(JSON.parse(messageEvent.data));
    };

    return () => {
        ws.close();
        console.log("Closed WebSocket");
    }
}