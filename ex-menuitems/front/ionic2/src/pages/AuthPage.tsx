import React, {useEffect, useState} from "react";
import {IonButton, IonInput, IonPage} from "@ionic/react";
import {useMainContext} from "../contexts/MainAppContext";
import {useHistory} from "react-router";

export const AuthPage: React.FC<void> = () => {
    const [inputTable, setInputTable] = useState('');
    const history = useHistory();
    const { login, table } = useMainContext();

    useEffect(() => {
        if (table) {
            history.push('/');
        }
    }, [table]);

    const handleLogin = () => {
        login(inputTable).then(() => history.push('/')).catch(() => alert('Masa ocupata'));
    }

    return (
        <IonPage>
            <IonInput label="Table" onIonChange={(event) => setInputTable(event.detail.value!)}> </IonInput>
            <IonButton onClick={handleLogin}> Login </IonButton>
        </IonPage>
    );
}