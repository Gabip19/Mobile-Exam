import axios from "axios";
import {authConfig, baseUrl} from "../core";
import {Project} from "../core/Project";
import {MenuItem2Dto} from "../core/MenuItem2Dto";
import {OrderItem2Dto} from "../core/OrderItem2Dto";

const getItemsUrl = `http://${baseUrl}/api/item`;
const updateItemUrl = `http://${baseUrl}/api/item`;
const createItemUrl = `http://${baseUrl}/api/item`;
const loginUrl = `http://${baseUrl}/auth`;
const getItemUrl = `http://${baseUrl}/MenuItem`;
const orderItemUrl = `http://${baseUrl}/OrderItem`;

export const apiService = {
    login: async (table: string): Promise<string> => {
        const response = await fetch(loginUrl, {
            body: JSON.stringify({ table: table }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const token = await response.json();
        return token.token;
    },

    getItem: async (token: string, query: string): Promise<MenuItem2Dto[]> => {
        const response = await fetch(`${getItemUrl}?q=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            }
        });

        return await response.json();
    },

    orderItem: async (token: string, item: OrderItem2Dto): Promise<void> => {
        const response = await fetch(`${orderItemUrl}`, {
            body: JSON.stringify({ code: item.code, quantity: item.quantity, free: item.free }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            }
        });

        if (!response.ok) {
            console.log('Failed');
            throw new Error();
        }

        return response.json();
    },

    getAllItems: async (token: string): Promise<Project[]> => {
        return axios.get(getItemsUrl, authConfig(token));
    },

    updateItemAPI: (token: string, project: Project): Promise<Project[]> => {
        return axios.put(`${updateItemUrl}/${project._id}`, project, authConfig(token));
    },

    createItemAPI: (token: string, project: Project): Promise<Project[]> => {
        return axios.post(`${createItemUrl}`, project, authConfig(token));
    },

    deleteItemAPI: (token: string, id: string): Promise<Project[]> => {
        return axios.delete(`${createItemUrl}/${id}`, authConfig(token));
    },
}