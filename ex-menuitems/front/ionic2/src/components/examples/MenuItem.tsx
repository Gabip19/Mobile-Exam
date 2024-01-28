import React, {useEffect, useState} from "react";
import {IonButton, IonItem, IonLabel} from "@ionic/react";
import {OrderItemDto} from "../../core/OrderItemDto";

interface MenuItemProps {
    menuItem: OrderItemDto;
    onUpdateItem: (item: OrderItemDto) => void;
    sendState: string;
}

const MenuItem: React.FC<MenuItemProps> = ({menuItem, onUpdateItem, sendState}) => {
    const [isSelected, setIsSelected] = useState(false);
    const [menuItemState, setMenuItemState] = useState(menuItem);
    const [newQuantity, setNewQuantity] = useState<number | undefined>(undefined);
    const [confirmPressed, setConfirmPressed] = useState(false);

    useEffect(() => {
        if (confirmPressed && newQuantity !== undefined && newQuantity !== menuItemState.quantity) {
            console.log('setez', newQuantity);
            const newItemState: OrderItemDto = { ...menuItemState, quantity: newQuantity};
            setMenuItemState(newItemState);
            onUpdateItem(newItemState);
            setIsSelected(false);
        }
        setConfirmPressed(false); // Reset the flag after processing
    }, [confirmPressed]);

    return (
        <IonItem onClick={() => setIsSelected(true)}>
            {sendState === 'sending' ? (
                <IonLabel> Sending... </IonLabel>
            ) : (
                <>
                    <IonLabel>
                        <h1> Name: {menuItemState.name} </h1>
                    </IonLabel>
                        {!isSelected ? (
                            <IonLabel style={{color: `${sendState === 'failed' ? 'red' : 'black'}`}}> Quantity: {menuItemState.quantity} </IonLabel>
                        ) : (
                            <IonItem>
                                <IonLabel> Quantity: </IonLabel>
                                <input
                                    type="number"
                                    placeholder={`${menuItemState.quantity}`}
                                    onChange={(event) => setNewQuantity(Number.parseInt(event.target.value))}/>
                                <IonButton onClick={() => setConfirmPressed(true)}> Confirm </IonButton>
                            </IonItem>
                        )}
                </>
            )}
        </IonItem>
    );
}

export default MenuItem;