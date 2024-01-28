import React, {useState} from "react";
import {
    IonButton,
    IonContent,
    IonHeader,
    IonLoading,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle, IonToast
} from "@ionic/react";
import {useMenuItems} from "../../contexts/MenuItemsContext";
import MenuItem from "../../components/MenuItem";
import {questionsApiService} from "../../services/QuestionsApiService";


export const HomePage: React.FC<void> = () => {
    const { itemsList, fetching, updateItem } = useMenuItems();
    const [showAll, setShowAll] = useState(true);
    const [sendState, setSendState] = useState(itemsList.map(() => 'none'));
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const submitOrder = () => {
        console.log('fac ceva');

        setSendState(itemsList.map(() => 'none'));

        itemsList.forEach((item, index) => {
            if (item.quantity === 0) return;

            setSendState((prevStates) => {
                const newStates = [...prevStates];
                newStates[index] = 'sending';
                return newStates;
            });

            questionsApiService.postItem(item).then(() => {
                setSendState((prevStates) => {
                    const newStates = [...prevStates];
                    newStates[index] = 'none';
                    return newStates;
                });
            }).catch(reason => {
                let newSendState: string = 'error';

                if (reason.response && reason.response.data.code !== undefined && reason.response.data.code === item.code) {
                    newSendState = 'failed';
                }

                setSendState((prevStates) => {
                    const newStates = [...prevStates];
                    newStates[index] = newSendState;
                    return newStates;
                });

                setErrorMessages((prevErrors) => [...prevErrors, reason.message]);
            });
        });
    }

    return (
        <IonPage>
            <IonHeader>
                <IonTitle> Menu </IonTitle>
            </IonHeader>
            <IonSelect value={showAll} onIonChange={e => setShowAll(e.detail.value)}>
                <IonSelectOption value={true}>
                    Show All
                </IonSelectOption>
                <IonSelectOption value={false}>
                    Show Ordered
                </IonSelectOption>
            </IonSelect>
            <IonContent>
                <IonLoading isOpen={fetching}/>
                {itemsList.map((item, index) => {
                    if (showAll || item.quantity != 0)
                        return <MenuItem key={item.code} menuItem={item} onUpdateItem={updateItem}
                                         sendState={sendState[index]}/>
                })
                }
            </IonContent>
            <IonButton onClick={submitOrder}>
                Submit
            </IonButton>
            {errorMessages.map((errorMessage, index) => (
                <IonToast
                    key={index}
                    isOpen
                    message={errorMessage}
                    duration={3000}
                    color="danger"
                />
            ))}
        </IonPage>
);
}