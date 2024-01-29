import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {usePreferences} from "../hooks/examples/usePreferences";
import {apiService} from "../services/ApiService";
import {MenuItem2Dto} from "../core/MenuItem2Dto";
import {OrderItem2Dto} from "../core/OrderItem2Dto";
import {newWebSocket} from "../services/WebSocketService";

interface MainAppContextProps {
    login: (table: string) => Promise<string>;
    getItems: (query: string) => Promise<void>;
    menuItems: MenuItem2Dto[];
    orderItem: (item: OrderItem2Dto) => Promise<void>;
    orderedItems: OrderItem2Dto[];
    table: string;
    failedOrders: OrderItem2Dto[];
    newOffer?: MenuItem2Dto;
}

interface MainAppProviderProps {
    children: ReactNode;
}

const MainAppContext = createContext<MainAppContextProps>({
    login: async () => {return ''},
    getItems: async ()=> {},
    menuItems: [],
    orderItem: async () => {},
    orderedItems: [],
    table: '',
    failedOrders: [],
});

export const MainAppProvider: React.FC<MainAppProviderProps> = ({ children }) => {
    const [token, setToken] = useState('');
    const [menuItems, setMenuItems] = useState<MenuItem2Dto[]>([]);
    const [orderedItems, setOrderedItems] = useState<OrderItem2Dto[]>([]);
    const [table, setTable] = useState('');
    const [failedOrders, setFailedOrders] = useState<OrderItem2Dto[]>([]);
    const [newOffer, setNewOffer] = useState<MenuItem2Dto | undefined>(undefined);
    const { get, set } = usePreferences();

    const login = (table: string) => {
        const doAsync = async () => {
            const _token = await apiService.login(table);
            setToken(_token);
            setTable(table);
            console.log(_token);
            await set('table', table);
            return _token;
        }

        return doAsync().then(response => response);
    }

    const getItems = async (query: string) => {
        const items: MenuItem2Dto[] = await apiService.getItem(token, query);
        console.log(items);
        setMenuItems(items);
    }

    const orderItem = async (item: OrderItem2Dto) => {
        const index = failedOrders.findIndex(value => value.code === item.code);
        if (index !== -1) {
            setFailedOrders(prevState => [
                ...prevState.slice(0, index),
                ...prevState.slice(index + 1)
            ]);
        }

        setOrderedItems(prev => [...prev, item]);

        apiService.orderItem(token, item)
            .then(() => console.log('Ordered: ', item))
            .then(() => set('orderedItems', JSON.stringify([...orderedItems, item])))
            .catch(() => setFailedOrders(prevState => [...prevState, item]));
    }

    useEffect(() => {
        console.log("Failed Orders Update:", failedOrders);
    }, [failedOrders]);

    useEffect(() => {
        const checkTableAndOrderedItems = async () => {
            const table = await get('table');
            if (table) {
                setTable(table);
                setToken(table);
            }

            const orderedItems = await get('orderedItems');
            if (orderedItems) {
                const orderedItemsList: OrderItem2Dto[] = JSON.parse(orderedItems);
                setOrderedItems(orderedItemsList);
            }
        }

        const handleNewOffer = (item: MenuItem2Dto) => {
            console.log('New offer');
            setNewOffer(item);
        }

        const openWs = () => {
            return newWebSocket(handleNewOffer);
        }

        const closeWs = openWs();
        checkTableAndOrderedItems();

        return () => {
            closeWs();
        }
    }, []);

    // const updateItemInList = (updatedItem: OrderItemDto) => {
    //     const index = itemsList.findIndex(el => el.code === updatedItem.code);
    //
    //     if (index !== -1) {
    //         const updatedList: OrderItemDto[] = [
    //             ...itemsList.slice(0, index),
    //             {...itemsList[index], quantity: updatedItem.quantity},
    //             ...itemsList.slice(index + 1),
    //         ];
    //
    //         setItemsList(updatedList);
    //         set('items', JSON.stringify(updatedList));
    //     }
    // };

    return (
        <MainAppContext.Provider value={{
            login: login,
            menuItems: menuItems,
            getItems: getItems,
            orderItem: orderItem,
            orderedItems: orderedItems,
            table: table,
            failedOrders: failedOrders,
            newOffer: newOffer
        }}>
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
