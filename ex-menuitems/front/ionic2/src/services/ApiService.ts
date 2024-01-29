import axios from "axios";
import {authConfig, baseUrl} from "../core";
import {Project} from "../core/Project";
import {MenuItem2Dto} from "../core/MenuItem2Dto";
import {OrderItem2Dto} from "../core/OrderItem2Dto";
import {Question} from "../core/Question";
import {Answer} from "../core/Answer";

const getItemsUrl = `http://${baseUrl}/api/item`;
const updateItemUrl = `http://${baseUrl}/api/item`;
const createItemUrl = `http://${baseUrl}/api/item`;
const loginUrl = `http://${baseUrl}/auth`;
const getItemUrl = `http://${baseUrl}/MenuItem`;
const orderItemUrl = `http://${baseUrl}/OrderItem`;

const downloadQuestionsUrl = `http://${baseUrl}/question`;
const sendAnswersUrl = `http://${baseUrl}/quiz`;

export const apiService = {
    downloadQuestions: async (): Promise<Question[]> => {
        // const response = await fetch(downloadQuestionsUrl, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // });
        //
        // return await response.json();

        return [{id: 1, text: 'text 1?'}, {id: 2, text: 'text 2?'}, {id: 3, text: 'text 3?'}, {id: 4, text: 'text 4?'}, {id: 5, text: 'text 5?'}]
    },

    sendQuiz: async (answers: Answer[]): Promise<number> => {
        // console.log(answers);
        //
        // const response = await fetch(sendAnswersUrl, {
        //     body: JSON.stringify(answers),
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // });
        //
        // if (!response.ok) {
        //     console.log('Failed');
        //     throw new Error();
        // }
        //
        // return response.json();

        return 1;
    },

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