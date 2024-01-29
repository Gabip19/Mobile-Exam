import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {usePreferences} from "../hooks/examples/usePreferences";
import {newWebSocket} from "../services/WebSocketService";
import {AssetDto} from "../core/AssetDto";
import {apiService} from "../services/ApiService";

interface MainAppContextProps {
    username?: string;
    login: (username: string) => void;
    assets?: AssetDto[];
    downloaded: boolean;
    updateItem: (item: AssetDto) => Promise<void>
}

interface MainAppProviderProps {
    children: ReactNode;
}

const MainAppContext = createContext<MainAppContextProps>({
    login: () => {},
    downloaded: false,
    updateItem: async () => {},
});

const MAX_QUESTION_NUM = 2;

export const MainAppProvider: React.FC<MainAppProviderProps> = ({ children }) => {
    // const [questions, setQuestions] = useState<Question[]>([]);
    // const [downloadFailed, setDownloadFailed] = useState(false);
    // const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(undefined);
    // const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
    // const [solvedQuizzes, setSolvedQuizzes] = useState<Quiz[]>([]);
    // const [quizId, setQuizId] = useState(0);
    // const [failedOrders, setFailedOrders] = useState<OrderItem2Dto[]>([]);
    // const [newOffer, setNewOffer] = useState<MenuItem2Dto | undefined>(undefined);
    // const { get, set } = usePreferences();

    // const downloadQuestions = async () => {
    //     try {
    //         setDownloadFailed(false);
    //         const questionsList: Question[] = await apiService.downloadQuestions();
    //         console.log('Downloaded questions: ', questionsList);
    //         setQuestions(questionsList);
    //     }
    //     catch (e) {
    //         console.log('Downloading failed');
    //         setDownloadFailed(true);
    //     }
    // }
    //
    // useEffect(() => {
    //     const checkForQuizzes = async () => {
    //         const quizzes = await get('quizzes');
    //         if (quizzes) {
    //             setSolvedQuizzes(JSON.parse(quizzes));
    //         }
    //     }
    //
    //     downloadQuestions();
    //     checkForQuizzes();
    // }, []);
    //
    //
    //
    // const nextQuestion = () => {
    //     if (currentAnswers.length === MAX_QUESTION_NUM) {
    //         handleQuizFinished();
    //         return;
    //     }
    //
    //     const randomQuizIndex = Math.floor(Math.random() * (questions.length));
    //     setCurrentQuestion(questions[randomQuizIndex]);
    //     console.log('Went to next question:', questions[randomQuizIndex]);
    // }
    //
    // useEffect(() => {
    //     if (!currentQuestion) return;
    //
    //     const timeout = setTimeout(() => {
    //         console.log('Time is up!');
    //         answerQuestion('');
    //     }, 5000);
    //     console.log('Time started');
    //
    //     return () => {
    //         clearTimeout(timeout);
    //     }
    // }, [currentQuestion]);
    //
    // const answerQuestion = (answer: string) => {
    //     setCurrentAnswers(prev => [
    //         ...prev,
    //         {questionId: currentQuestion!.id, answer: answer}
    //     ]);
    // }
    //
    // useEffect(() => {
    //     if (currentAnswers.length === 0) return;
    //
    //     nextQuestion();
    // }, [currentAnswers]);
    //
    //
    //
    // const handleQuizFinished = async () => {
    //     console.log('Quiz finished: ', currentAnswers);
    //     setCurrentQuestion(undefined);
    //
    //     sendQuizToServer(quizId, currentAnswers);
    //     setQuizId(prev => prev + 1);
    //
    //     setCurrentAnswers([]);
    // }
    //
    // const sendQuizToServer = async (quizId: number, answers: Answer[]) => {
    //     let quiz: Quiz;
    //     try {
    //         const score = await apiService.sendQuiz(answers);
    //         console.log('Final score:', score);
    //
    //         quiz = {
    //             id: quizId,
    //             answers: answers,
    //             score: score
    //         };
    //     } catch (ex) {
    //         quiz = {
    //             id: quizId,
    //             answers: answers
    //         };
    //     } finally {
    //         const quizIndex = solvedQuizzes.findIndex(value => value.id === quizId);
    //         let quizzesList: Quiz[];
    //         if (quizIndex === -1) {
    //             quizzesList = [...solvedQuizzes, quiz!];
    //         } else {
    //             quizzesList = [
    //                 ...solvedQuizzes.slice(0, quizIndex),
    //                 quiz!,
    //                 ...solvedQuizzes.slice(quizIndex + 1)
    //             ]
    //         }
    //
    //         setSolvedQuizzes(quizzesList);
    //         await set('quizzes', JSON.stringify(quizzesList));
    //     }
    // }

    const [username, setUsername] = useState('');
    const [assets, setAssets] = useState<AssetDto[]>();
    const [downloaded, setDownloaded] = useState(false);
    const { get, set } = usePreferences();

   const login = (_username: string) => {
        const doAsync = async () => {
            console.log(_username);
            await set('username', _username);
        }

        setUsername(_username);
        return doAsync().then(response => response);
    }

    useEffect(() => {
        const handleNewOffer = (items: AssetDto[] | AssetDto) => {
            if (Array.isArray(items)) {
                if (!assets) {
                    console.log('Received assets:', items);
                    setAssets(items);
                    setDownloaded(true);
                    set('assets', JSON.stringify(items));
                }
            } else {
                if (assets) {
                    console.log('Item received:', items);
                    // const index = assets!.findIndex(value => value.id === item.id);

                    setAssets(prev => [
                        ...prev!,
                        items
                    ]);

                    set('assets', JSON.stringify([...assets, items]));
                }
            }
        }

        const openWs = () => {
            return newWebSocket(handleNewOffer);
        }

        const closeWs = openWs();

        return () => {
            closeWs();
        }
    }, [username]);

    useEffect(() => {
        const checkToken = async () => {
            const username = await get('username');
            if (username) {
                setUsername(username);
            }

            const assetsString = await get('assets');
            if (assetsString) {
                setAssets(JSON.parse(assetsString));
            }

            // const orderedItems = await get('orderedItems');
            // if (orderedItems) {
            //     const orderedItemsList: OrderItem2Dto[] = JSON.parse(orderedItems);
            //     setOrderedItems(orderedItemsList);
            // }
        }

        checkToken();
    }, []);

    const updateItem = async (item: AssetDto) => {
        try {
            await apiService.updateItem(item);

            console.log('Updated item');

            const index = assets!.findIndex(value => value.id === item.id);
            const newAssets = [
                ...assets!.slice(0, index),
                item,
                ...assets!.slice(index + 1)
            ]

            setAssets(newAssets);

            await set('assets', JSON.stringify(newAssets));
        } catch (ex) {
            console.log('Error la patch: ');
            alert('Patch failed');
        }
    }

    // const getItems = async (query: string) => {
    //     const items: MenuItem2Dto[] = await apiService.getItem(token, query);
    //     console.log(items);
    //     setMenuItems(items);
    // }
    //
    // const orderItem = async (item: OrderItem2Dto) => {
    //     const index = failedOrders.findIndex(value => value.code === item.code);
    //     if (index !== -1) {
    //         setFailedOrders(prevState => [
    //             ...prevState.slice(0, index),
    //             ...prevState.slice(index + 1)
    //         ]);
    //     }
    //
    //     setOrderedItems(prev => [...prev, item]);
    //
    //     apiService.orderItem(token, item)
    //         .then(() => console.log('Ordered: ', item))
    //         .then(() => set('orderedItems', JSON.stringify([...orderedItems, item])))
    //         .catch(() => setFailedOrders(prevState => [...prevState, item]));
    // }
    //
    // useEffect(() => {
    //     console.log("Failed Orders Update:", failedOrders);
    // }, [failedOrders]);
    //
    // useEffect(() => {
    //     const checkTableAndOrderedItems = async () => {
    //         const table = await get('table');
    //         if (table) {
    //             setTable(table);
    //             setToken(table);
    //         }
    //
    //         const orderedItems = await get('orderedItems');
    //         if (orderedItems) {
    //             const orderedItemsList: OrderItem2Dto[] = JSON.parse(orderedItems);
    //             setOrderedItems(orderedItemsList);
    //         }
    //     }
    //
    //     const handleNewOffer = (item: MenuItem2Dto) => {
    //         console.log('New offer');
    //         setNewOffer(item);
    //     }
    //
    //     const openWs = () => {
    //         return newWebSocket(handleNewOffer);
    //     }
    //
    //     const closeWs = openWs();
    //     checkTableAndOrderedItems();
    //
    //     return () => {
    //         closeWs();
    //     }
    // }, []);

    // const updateItemInList = (updatedItem: OrderItemDto) => {
    //     const index = itemsList.findIndex(el => el.code === updatedItem.code);
    //
    //     if (index !== -1) {
    //         const updatedList: OrderItemDto[] = [
    //             ...itemsList.slice(0, index),
    //             {...itemsList[index], quantity: updatedItem.quantity},
    //             ...itemsList.slice(index + 1),
    //         ];
    //
    //         setItemsList(updatedList);
    //         set('items', JSON.stringify(updatedList));
    //     }
    // };

    return (
        <MainAppContext.Provider value={{
            login: login,
            username: username,
            assets: assets,
            downloaded: downloaded,
            updateItem: updateItem,
        }}>
            {children}
        </MainAppContext.Provider>
    );
};

export const useMainContext = () => {
    const context = useContext(MainAppContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
