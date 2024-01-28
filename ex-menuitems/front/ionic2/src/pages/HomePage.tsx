import React, {useEffect, useState} from "react";
import {IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToast} from "@ionic/react";
import {useLocation} from "react-router";
import {QuestionDto} from "../core/QuestionDto";
import {usePreferences} from "../hooks/examples/usePreferences";
import {newWebSocket} from "../services/WebSocketService";

interface QuestionAnswer {
    question: string;
    answer: string;
}

export const HomePage: React.FC<void>= () => {
    const location = useLocation();
    const questionsList: QuestionDto[] = location.state?.questions || null;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctAnswersNum, setCorrectAnswersNum] = useState(0);
    const [answeredQuestionsNum, setAnsweredQuestionsNum] = useState(0);
    const [selectedOption, setSelectedOption] = useState(-1);
    const [newQuestion, setNewQuestion] = useState<QuestionDto | null>(null);
    const { get, set } = usePreferences();

    useEffect(() => {
        const wsClose = newWebSocket((data) => {
            setNewQuestion(data);
        });

        return () => {
            wsClose();
        }
    }, []);

    useEffect(() => {
        setSelectedOption(-1);
        const intId = setTimeout(async () => await handleNextQuestion(), 5000);

        return () => {
            clearInterval(intId);
        }
    }, [currentQuestionIndex]);

    const handleNextQuestion = async () => {
        console.log('called', answeredQuestionsNum, currentQuestionIndex);
        if (answeredQuestionsNum === questionsList.length) {
            return;
        }

        if (selectedOption == questionsList[currentQuestionIndex].indexCorrectOption) {
            setCorrectAnswersNum(prev => prev + 1);
        }

        const questionsAnswers = await get('questionsAnswers');
        const questionsAnswersList: QuestionAnswer[] = questionsAnswers ? JSON.parse(questionsAnswers) : [];
        const currentQuestion = questionsList[currentQuestionIndex];
        questionsAnswersList.push({question: currentQuestion.text, answer: selectedOption !== -1 ? currentQuestion.options[selectedOption] : ''});
        await set('questionsAnswers', JSON.stringify(questionsAnswersList));

        setAnsweredQuestionsNum(prev => prev + 1);

        if (currentQuestionIndex < questionsList.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }

    return (
        <>
            {questionsList && (
                <IonPage>
                    <IonHeader>
                        <IonTitle style={{fontSize: 30}}> Question: {`${currentQuestionIndex + 1} / ${questionsList.length}`} </IonTitle>
                        <IonTitle style={{fontSize: 30}}> Correct answers: {`${correctAnswersNum} / ${answeredQuestionsNum}`} </IonTitle>
                    </IonHeader>
                    <IonContent>
                        <div style={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", fontSize: 30}}>
                            <h1> Question: {questionsList[currentQuestionIndex].text} </h1>
                            {questionsList[currentQuestionIndex].options.map((each, index) =>
                                <p
                                    key={index}
                                    style={{border: "1px solid black", width: "100%", textAlign: "center", background: `${selectedOption === index ? "cyan" : "white"}`}}
                                    onClick={() => setSelectedOption(index)}
                                >
                                    {each}
                                </p>
                            )}
                            <IonButton
                                disabled={selectedOption === -1 || answeredQuestionsNum === questionsList.length}
                                onClick={handleNextQuestion}
                            >
                                Next
                            </IonButton>
                        </div>
                    </IonContent>
                    <IonToast
                        isOpen={newQuestion !== null}
                        message={`New question: ${newQuestion && newQuestion.text}`}
                        duration={3000}
                        color="danger"
                        onDidDismiss={() => {
                            setNewQuestion(null);
                        }}
                    />
                </IonPage>
            )}
        </>
    )
}