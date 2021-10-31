import questions from "../pages/questions";
import {Questions} from "../consts/questions";

export class Question {

    constructor(public question: string, public answer: string) {
    }

    static questionForRound(round: number): Question {
        const question = Questions[0].transformer();
        return new Question(question.question, `${question.answer}`);
    }

}
