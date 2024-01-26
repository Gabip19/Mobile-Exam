import axios from "axios";
import { authConfig, baseUrl } from "../core";
import { Project } from "../core/Project";

const getItemsUrl = `http://${baseUrl}/api/item`;
const updateItemUrl = `http://${baseUrl}/api/item`;
const createItemUrl = `http://${baseUrl}/api/item`;

export const apiService = {
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