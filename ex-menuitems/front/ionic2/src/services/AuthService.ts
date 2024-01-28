import {baseUrl} from '../core';

const authUrl = `http://${baseUrl}/auth`;

export interface QuestionIds {
    token: string;
    questionIds: number[];
}

export const authService = {
    login: async (id: string): Promise<QuestionIds> => {
        return fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
        }).then(response => response.json());
    },
}
