import React, {useEffect, useState} from "react";
import {IonButton, IonInput, IonItem, IonLabel, IonPage, IonTitle} from "@ionic/react";
import {authService} from "../services/AuthService";
import {QuestionDto} from "../core/QuestionDto";
import {questionsApiService} from "../services/QuestionsApiService";
import {useHistory} from "react-router";
import {usePreferences} from "../hooks/examples/usePreferences";

export const AuthPage: React.FC<void>= () => {
    const [id, setId] = useState<string>('');
    const [questionIds, setQuestionIds] = useState<number[] | null>(null);
    const [questions, setQuestions] = useState<QuestionDto[]>([]);
    const [fetchingFailed, setFetchingFailed] = useState(false);
    const { get, set } = usePreferences();
    const history = useHistory();

    useEffect(() => {
        const checkQuestions = async () => {
            console.log('checking if questions already downloaded...');

            const questionsString = await get('questions');
            if (questionsString) {
                console.log('questions found');

                const questionsList: QuestionDto[] = JSON.parse(questionsString);
                history.push('/', { questions: questionsList });
            }
        }

        checkQuestions();
    }, []);

    useEffect(() => {
        console.log('fetching...');
        console.log(questionIds);

        if (questionIds) {
            fetchQuestions(questionIds);
        }
    }, [questionIds]);

    useEffect(() => {
        const setter = async () => {
            if (questions.length == questionIds?.length) {
                await set('questions', JSON.stringify(questions));
            }
        }

        setter();
    }, [questions]);

    const handleIdSubmission = () => {
        authService.login(id).then(value => setQuestionIds(value.questionIds));
    };

    const fetchQuestions = async (_questionIds: number[])=> {
        const fetch = async (_questionIds: number[]) => {
            for (const id1 of _questionIds) {
                const result = await questionsApiService.getQuestion(id1);
                console.log(result);
                setQuestions(prev => [...prev, result]);
            }
        }

        return fetch(_questionIds)
            .then(() => history.push('/', { questions: questions }))
            .catch(() => setFetchingFailed(true));
    }

    const retryDownload = () => {
        setFetchingFailed(false);
        const nonFetchedQuestionsIds = questionIds!.slice(questions.length);
        console.log(nonFetchedQuestionsIds);
        fetchQuestions(nonFetchedQuestionsIds);
    };

    return (
      <IonPage>
          {!questionIds ? (
              <IonItem>
                  <IonInput label="ID:" type="text" onIonChange={event => setId(event.detail.value!)} />
                  <IonButton onClick={handleIdSubmission}> Submit </IonButton>
              </IonItem>
          ) : (
              !fetchingFailed ? (
                  <IonTitle>
                      Downloading {`${questions.length} / ${questionIds.length}`}
                  </IonTitle>
              ) : (
                  <>
                      <IonTitle>
                          Download failed at {`${questions.length} / ${questionIds.length}`}
                      </IonTitle>
                      <IonButton onClick={retryDownload}> Retry </IonButton>
                  </>
              )
          )}
      </IonPage>
    );
}