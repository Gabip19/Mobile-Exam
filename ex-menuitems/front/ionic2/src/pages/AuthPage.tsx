import React, {useEffect, useState} from "react";
import {IonButton, IonInput, IonPage} from "@ionic/react";
import {useMainContext} from "../contexts/MainAppContext";
import {useHistory} from "react-router";

export const AuthPage: React.FC<void> = () => {
    const history = useHistory();
    const { login, username } = useMainContext();
    const [inputUsername, setInputUsername] = useState<string>('');

    useEffect(() => {
        if (username) {
            history.push('/');
        }
    }, [username]);

    const handleLogin = () => {
        login(inputUsername);
    }

    return (
        <IonPage>
            <IonInput label="Username: " onIonInput={(event) => setInputUsername(event.detail.value!)}> </IonInput>
            <IonButton onClick={handleLogin}> Next </IonButton>
        </IonPage>
    );
}