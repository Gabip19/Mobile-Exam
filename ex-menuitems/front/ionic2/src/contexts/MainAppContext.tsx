import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {OrderItemDto} from "../core/OrderItemDto";
import {usePreferences} from "../hooks/examples/usePreferences";
import {newWebSocket} from "../services/WebSocketService";
import {MenuItemDto} from "../core/MenuItemDto";

interface MainAppContextProps {
    itemsList: OrderItemDto[];
    fetching: boolean;
    updateItem: (item: OrderItemDto) => void;
}

interface MainAppProviderProps {
    children: ReactNode;
}

const MainAppContext = createContext<MainAppContextProps>({
    itemsList: [],
    fetching: false,
    updateItem: () => {}
});

export const MainAppProvider: React.FC<MainAppProviderProps> = ({ children }) => {
    const [itemsList, setItemsList] = useState<OrderItemDto[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [disconnectWS, setDisconnectWS] = useState<(() => void) | null>(null);
    const { get, set } = usePreferences();

    useEffect(() => {
        const checkForItems = async () => {
            console.log('checkItems');

            const items = await get('items');
            if (items == null) {
                console.log('fetching items');

                setIsFetching(true);
                const disconnectFc = newWebSocket(handleMessageReceive);
                console.log('connected to socket');

                setDisconnectWS(() => disconnectFc);
            } else {
                console.log('found items');

                setItemsList(JSON.parse(items));
            }
        };

        const handleMessageReceive = (data: MenuItemDto[]) => {
            const newItems: OrderItemDto[] = data.map(item => ({ name: item.name, code: item.code, quantity: 0 }));
            setItemsList(newItems);
            console.log('fetching done', newItems);
            set('items', JSON.stringify(newItems)).then(() => setIsFetching(false));
        }

        checkForItems();

        return () => {
            setItemsList([]);
            if (disconnectWS) {
                console.log('disconnecting');
                disconnectWS();
                setDisconnectWS(null);
            }
            setIsFetching(false);
        }
    }, []);

    const updateItemInList = (updatedItem: OrderItemDto) => {
        const index = itemsList.findIndex(el => el.code === updatedItem.code);

        if (index !== -1) {
            const updatedList: OrderItemDto[] = [
                ...itemsList.slice(0, index),
                {...itemsList[index], quantity: updatedItem.quantity},
                ...itemsList.slice(index + 1),
            ];

            setItemsList(updatedList);
            set('items', JSON.stringify(updatedList));
        }
    };

    return (
        <MainAppContext.Provider value={{ itemsList, fetching: isFetching, updateItem: updateItemInList }}>
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
