import React, {useEffect, useState} from "react";
import {IonButton, IonItem, IonLabel} from "@ionic/react";
import {useMainContext} from "../contexts/MainAppContext";
import {AssetDto} from "../core/AssetDto";

interface AssetComponentProps {
    item: AssetDto;
    state: string;
}

export const AssetComponent: React.FC<AssetComponentProps> = ({item, state}) => {
    // const [sentFailed, setSentFailed] = useState(false);

    // useEffect(() => {
    //     if (failedOrders.findIndex(value => value.code === item.code) !== -1) {
    //         setSentFailed(true);
    //     } else {
    //         setSentFailed(false);
    //     }
    // }, [failedOrders]);

    // const resendOrder = () => {
    //     orderItem(item);
    // }

    const [isExpanded, setIsExpanded] = useState(false);
    const { username, updateItem } = useMainContext();

    const handleReturn = () => {
        const newItem = {
            ...item,
            takenBy: null
        }

        updateItem(newItem);
    };

    const handleTake = () => {
        const newItem = {
            ...item,
            takenBy: username!
        }

        updateItem(newItem);
    }

    const handleRemove = () => {
        const index = item.desiredBy.findIndex(value => value === username!);

        const newItem = {
            ...item,
            desiredBy: [
                ...item.desiredBy.slice(0, index),
                ...item.desiredBy.slice(index + 1)
            ]
        }

        updateItem(newItem);
    }

    const handleAdd = () => {
        const newItem = {
            ...item,
            desiredBy: [...item.desiredBy, username!]
        }

        updateItem(newItem);
    }

    return (
        <IonItem onClick={() => setIsExpanded(prevState => !prevState)}>
            <div style={{backgroundColor: `${state}`, width: "100%"}}>
                <IonLabel> Name: {item.name} </IonLabel>
                {isExpanded && (
                    <>
                        <IonLabel> Desired by: {item.desiredBy.toString()} </IonLabel>
                        {state === "red" && (
                            <IonButton onClick={handleReturn}> Return </IonButton>
                        )}
                        {state === "green" && (
                            <IonButton onClick={handleTake}> Take </IonButton>
                        )}
                        {state === "yellow" && (
                            <IonButton onClick={handleRemove}> Remove request </IonButton>
                        )}
                        {state === "white" && (
                            <IonButton onClick={handleAdd}> Add request </IonButton>
                        )}
                    </>
                )}
            </div>
        </IonItem>
    );
}