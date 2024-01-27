import axios from "axios";
import {baseUrl, config} from "../core";
import {OrderItemDto} from "../core/OrderItemDto";

const postItemUrl = `http://${baseUrl}/item`;

export const menuItemsApiService = {
    postItem: (item: OrderItemDto): Promise<void> => {
        return axios.post(`${postItemUrl}`, {code: item.code, quantity: item.quantity}, config);
    },
}