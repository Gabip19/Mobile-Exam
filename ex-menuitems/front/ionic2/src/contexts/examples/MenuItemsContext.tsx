import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {MenuItemDto} from "../../core/MenuItemDto";
import {usePreferences} from "../../hooks/examples/usePreferences";
import {newWebSocket} from "../../services/WebSocketService";
import {OrderItemDto} from "../../core/OrderItemDto";

interface MenuItemsContextProps {
    itemsList: OrderItemDto[];
    fetching: boolean;
    updateItem: (item: OrderItemDto) => void;
}

interface MenuItemsProviderProps {
    children: ReactNode;
}

const MenuItemsContext = createContext<MenuItemsContextProps>({
    itemsList: [],
    fetching: false,
    updateItem: () => {}
});

export const MenuItemsProvider: React.FC<MenuItemsProviderProps> = ({ children }) => {
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
        <MenuItemsContext.Provider value={{ itemsList, fetching: isFetching, updateItem: updateItemInList }}>
            {children}
        </MenuItemsContext.Provider>
    );
};

export const useMenuItems = () => {
    const context = useContext(MenuItemsContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
