import {baseUrl, config} from "../core";
import {QuestionDto} from "../core/QuestionDto";

const getQuestionUrl = `http://${baseUrl}/question`;

export const questionsApiService = {
    getQuestion: async (id: number): Promise<QuestionDto> => {
        const response = await fetch(`${getQuestionUrl}/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    },
}