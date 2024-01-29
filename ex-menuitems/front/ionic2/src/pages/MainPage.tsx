import React, {useEffect, useState} from "react";
import {
    IonButton,
    IonContent,
    IonFab,
    IonInput, IonList,
    IonPage,
    IonSearchbar,
    IonTitle, IonToast,
} from "@ionic/react";
import {useMainContext} from "../contexts/MainAppContext";
import {MenuItem2} from "../components/MenuItem2";
import {MenuItem2Dto} from "../core/MenuItem2Dto";
import {OrderItem2Dto} from "../core/OrderItem2Dto";
import {OrderItem} from "../components/OrderItem";

export const MainPage: React.FC<void> = () => {
    const { menuItems, getItems, orderItem, table, orderedItems, newOffer } = useMainContext();
    const [query, setQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<MenuItem2Dto | null>(null);
    const [quantity, setQuantity] = useState(0);
    const [localNewOffer, setLocalNewOffer] = useState(newOffer);

    useEffect(() => {
        let canceled = false;
        if (query !== '') {
            if (canceled) {
                return;
            }

            setSelectedItem(null);
            getItems(query);
        }

        return () => {
            canceled = true;
        }
    }, [query]);

    const changeSelectionCallback = (item: MenuItem2Dto) => {
        console.log('Selected item: ', item);
        setSelectedItem(item);
    }

    const handleOrder = () => {
        const orderedItem: OrderItem2Dto = {
            quantity: quantity,
            code: selectedItem!.code,
            table: table,
            free: false
        }

        orderItem(orderedItem);
    }

    const handleOfferClick = (offer: MenuItem2Dto) => {
        console.log('Offer Clicked!', offer);
        orderItem({
           code: offer.code,
           table: table,
           free: true,
           quantity: 1
        });
    }

    useEffect(() => {
        setLocalNewOffer(newOffer);
    }, [newOffer]);

    return (
        <IonPage>
            <IonSearchbar debounce={2000} onIonInput={(event) => setQuery(event.detail.value!)}> </IonSearchbar>
            <IonContent>
                <IonList>
                    {menuItems.slice(0, 5).map(each => {
                        return <MenuItem2 key={each.code} item={each} changeSelection={changeSelectionCallback} isSelected={each.code == selectedItem?.code}/>
                    })}
                </IonList>
            </IonContent>
            <IonTitle> Ordered items: </IonTitle>
            <IonContent>
                <IonList>
                    {orderedItems.map(each => {
                        return <OrderItem key={each.code} item={each} />
                    })}
                </IonList>
            </IonContent>
            {selectedItem && (
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonInput label="Quantity:"
                              placeholder="quantity"
                              type="number"
                              onIonInput={(event) => setQuantity(Number.parseInt(event.detail.value!))}
                    />
                    <IonButton onClick={handleOrder}> Order </IonButton>
                </IonFab>
            )}
            {localNewOffer && (
                <IonToast
                    isOpen
                    message={`New Offer: ${localNewOffer.name}`}
                    duration={3000}
                    position="top"
                    onClick={() => handleOfferClick(localNewOffer)}
                    onDidDismiss={() => setLocalNewOffer(undefined)}
                />
            )}
        </IonPage>
    );
}