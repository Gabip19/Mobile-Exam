import {Answer} from "./Answer";

export interface Quiz {
    id: number;
    answers: Answer[];
    score?: number;
}