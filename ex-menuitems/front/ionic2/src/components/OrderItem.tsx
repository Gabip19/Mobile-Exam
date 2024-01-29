import React, {useEffect, useState} from "react";
import {IonItem, IonLabel} from "@ionic/react";
import {OrderItem2Dto} from "../core/OrderItem2Dto";
import {useMainContext} from "../contexts/MainAppContext";

interface OrderItemProps {
    item: OrderItem2Dto;
}

export const OrderItem: React.FC<OrderItemProps> = ({item}) => {
    const { failedOrders, orderItem } = useMainContext();
    const [sentFailed, setSentFailed] = useState(false);

    useEffect(() => {
        if (failedOrders.findIndex(value => value.code === item.code) !== -1) {
            setSentFailed(true);
        } else {
            setSentFailed(false);
        }
    }, [failedOrders]);

    const resendOrder = () => {
        orderItem(item);
    }

    return (
        <IonItem>
            <IonLabel> Code: {item.code} </IonLabel>
            <IonLabel> Quantity: {item.quantity} </IonLabel>
            {sentFailed && (
                <IonLabel onClick={resendOrder}> not sent </IonLabel>
            )}
        </IonItem>
    );
}