import React, {useEffect, useState} from "react";
import {
    IonContent, IonList,
    IonPage, IonSelect, IonSelectOption,
} from "@ionic/react";
import {useMainContext} from "../contexts/MainAppContext";
import {AssetComponent} from "../components/AssetComponent";
import {AssetDto} from "../core/AssetDto";

export const MainPage: React.FC<void> = () => {
    // useEffect(() => {
    //     let canceled = false;
    //     if (query !== '') {
    //         if (canceled) {
    //             return;
    //         }
    //
    //         setSelectedItem(null);
    //         getItems(query);
    //     }
    //
    //     return () => {
    //         canceled = true;
    //     }
    // }, [query]);
    //
    // const changeSelectionCallback = (item: MenuItem2Dto) => {
    //     console.log('Selected item: ', item);
    //     setSelectedItem(item);
    // }
    //
    // const handleOrder = () => {
    //     const orderedItem: OrderItem2Dto = {
    //         quantity: quantity,
    //         code: selectedItem!.code,
    //         table: table,
    //         free: false
    //     }
    //
    //     orderItem(orderedItem);
    // }
    //
    // const handleOfferClick = (offer: MenuItem2Dto) => {
    //     console.log('Offer Clicked!', offer);
    //     orderItem({
    //        code: offer.code,
    //        table: table,
    //        free: true,
    //        quantity: 1
    //     });
    // }
    //
    // useEffect(() => {
    //     setLocalNewOffer(newOffer);
    // }, [newOffer]);

    const { assets, downloaded, username } = useMainContext();
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    useEffect(() => {
        if (downloaded) {
            alert('Download finished');
        }
    }, [downloaded]);

    /*
    `name` cu un background indicand starea lucrului relativ la utilizatorul curent:
   `red` daca lucrul este imprumutat de utilizatorul curent;
   `green` daca lucrul poate fi imprumutat imediat de utilizatorul curent;
   `yellow` daca utilizatorul face parte din lista `desiredBy`, dar nu este primul in lista;
   `white`, in caz contrar [1p].
     */
    const computeState = (item: AssetDto): string => {
        if (item.takenBy === username) {
            return 'red';
        } else if (item.desiredBy.length > 0 && item.desiredBy.includes(username!) && item.desiredBy[0] !== username) {
            return 'yellow'
        } else if (item.desiredBy.length > 0 && item.desiredBy[0] === username) {
            return 'green';
        }
        return 'white';
    }

    const handleFilterChange = (value: string) => {
        if (value === 'all') {
            setActiveFilter(null);
        } else {
            setActiveFilter(value);
        }
    }

    useEffect(() => {
        console.log(activeFilter)
    }, [activeFilter]);

    return (
        <IonPage>
            <IonContent>
                <IonSelect onIonChange={e => handleFilterChange(e.detail.value)}>
                    <IonSelectOption value={'all'}>
                        All
                    </IonSelectOption>
                    <IonSelectOption value={'red'}>
                        Red
                    </IonSelectOption>
                    <IonSelectOption value={'yellow'}>
                        Yellow
                    </IonSelectOption>
                    <IonSelectOption value={'green'}>
                        Green
                    </IonSelectOption>
                    <IonSelectOption value={'white'}>
                        White
                    </IonSelectOption>
                </IonSelect>
                <IonList>
                    {assets && (
                        assets.map((each, index) => {
                            const state = computeState(each);

                            if (!activeFilter) {
                                return <AssetComponent
                                    key={index}
                                    item={each}
                                    state={computeState(each)}
                                />
                            } else {
                                if (activeFilter === state) {
                                    return <AssetComponent
                                        key={index}
                                        item={each}
                                        state={computeState(each)}
                                    />
                                }
                            }
                        })
                    )}
                </IonList>
            </IonContent>
        </IonPage>
    );

    // useEffect(() => {
    //     if (downloadFailed) {
    //         alert("Download Failed!");
    //     }
    // }, [downloadFailed]);
    //
    // const handleRetry = () => {
    //     console.log('Retrying to download');
    //     downloadQuestions();
    // }
    //
    // const handleStartQuiz = () => {
    //     goNextQuestion();
    // }
    //
    // const handleNextQuestion = () => {
    //     if (!answer) return;
    //
    //     console.log('Question answer: ', answer);
    //     answerQuestion(answer);
    // }

    // return (
    //     <IonPage>
    //         {(currentQuestion === undefined || downloadFailed) && (
    //             <IonContent>
    //                 {currentQuestion === undefined && (
    //                     <IonButton disabled={downloadFailed || questions.length === 0} onClick={handleStartQuiz}> Start Quiz </IonButton>
    //                 )}
    //                 {downloadFailed && (
    //                     <>
    //                         <IonTitle> Download Failed </IonTitle>
    //                         <IonButton onClick={handleRetry}> Retry </IonButton>
    //                     </>
    //                 )}
    //             </IonContent>
    //         )}
    //         {currentQuestion && (
    //             <IonContent>
    //                 <h1 style={{textAlign: "center"}}> {currentQuestion.text} </h1>
    //                 <IonInput
    //                     label="Answer:"
    //                     placeholder="Your answer"
    //                     style={{textAlign: "center", border: "1px solid black"}}
    //                     onIonInput={(event) => setAnswer(event.detail.value!)}
    //                 />
    //                 <IonButton expand="full" onClick={handleNextQuestion}> Next </IonButton>
    //             </IonContent>
    //         )}
    //         {solvedQuizzes.length !== 0 && (
    //             <>
    //                 <IonContent>
    //                     <h1> Solved Quizzes: </h1>
    //                     <IonList>
    //                         {solvedQuizzes.map((each, index) => {
    //                             return <QuizComponent key={index} quiz={each} />
    //                         })}
    //                     </IonList>
    //                 </IonContent>
    //             </>
    //         )}
    //     </IonPage>
    // );

    // return (
    //     <IonPage>
    //         <IonSearchbar debounce={2000} onIonInput={(event) => setQuery(event.detail.value!)}> </IonSearchbar>
    //         <IonContent>
    //             <IonList>
    //                 {menuItems.slice(0, 5).map((each, index) => {
    //                     return <MenuItem2 key={index} item={each} changeSelection={changeSelectionCallback} isSelected={each.code == selectedItem?.code}/>
    //                 })}
    //             </IonList>
    //         </IonContent>
    //         <IonTitle> Ordered items: </IonTitle>
    //         <IonContent>
    //             <IonList>
    //                 {orderedItems.map((each, index) => {
    //                     return <OrderItem key={index} item={each} />
    //                 })}
    //             </IonList>
    //         </IonContent>
    //         {selectedItem && (
    //             <IonFab vertical="bottom" horizontal="center" slot="fixed">
    //                 <IonInput label="Quantity:"
    //                           placeholder="quantity"
    //                           type="number"
    //                           onIonInput={(event) => setQuantity(Number.parseInt(event.detail.value!))}
    //                 />
    //                 <IonButton onClick={handleOrder}> Order </IonButton>
    //             </IonFab>
    //         )}
    //         {localNewOffer && (
    //             <IonToast
    //                 isOpen
    //                 message={`New Offer: ${localNewOffer.name}`}
    //                 duration={3000}
    //                 position="top"
    //                 onClick={() => handleOfferClick(localNewOffer)}
    //                 onDidDismiss={() => setLocalNewOffer(undefined)}
    //             />
    //         )}
    //     </IonPage>
    // );
}