import React from 'react';
import { useNetwork } from "../../hooks/examples/useNetwork";
import { IonLabel } from "@ionic/react";

export const NetworkState: React.FC = () => {
    const { networkStatus} = useNetwork();
    
    return (
      networkStatus.connected ? 
        <IonLabel style={{ marginRight: '5px' }} slot="end">
            🟢
        </IonLabel> :
        <IonLabel style={{ marginRight: '5px' }} slot="end">
            🔴
        </IonLabel>
    );
}