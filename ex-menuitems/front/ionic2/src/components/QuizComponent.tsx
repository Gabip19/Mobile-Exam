import React from "react";
import {IonItem, IonLabel} from "@ionic/react";
import {Quiz} from "../core/Quiz";
import {useMainContext} from "../contexts/MainAppContext";

interface QuizComponentProps {
    quiz: Quiz;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({quiz}) => {
    const { resendQuiz } = useMainContext();

    // useEffect(() => {
    //     if (failedOrders.findIndex(value => value.code === item.code) !== -1) {
    //         setSentFailed(true);
    //     } else {
    //         setSentFailed(false);
    //     }
    // }, [failedOrders]);
    //
    // const resendOrder = () => {
    //     orderItem(item);
    // }

    const handleResend = async () => {
        resendQuiz(quiz.id, quiz.answers);
    }

    return (
        <IonItem>
            <IonLabel> Questions Ids: {`${quiz.answers
                .map(value => value.questionId.toString())
                .reduce(
                    (previousValue, currentValue) => `${previousValue}, ${currentValue}`
                )}`}
            </IonLabel>
            {quiz.score ? (
                <IonLabel> Score: {quiz.score} </IonLabel>
            ) : (
                <IonLabel onClick={handleResend}> pending </IonLabel>
            )}
        </IonItem>
    );
}