import axios from 'axios';
import { baseUrl, config } from '../core';

const authUrl = `http://${baseUrl}/api/auth/login`;

export interface AuthProps {
    token: string;
}

export const authService = {
    login: async (username?: string, password?: string): Promise<AuthProps> => {
        return axios.post(authUrl, {username, password}, config);
    },
}
