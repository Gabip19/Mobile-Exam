import React, { useCallback, useEffect, useReducer, useContext } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { newWebSocket } from "../services/WebSocketService";
import { Project } from '../core/Project';
import { AuthContext } from "./AuthProvider";
import { useNetwork } from '../hooks/examples/useNetwork';
import {useIonToast} from "@ionic/react";
import { Preferences } from '@capacitor/preferences';
import {apiService} from "../services/ApiService";

const log = getLogger('ItemProvider');

type UpdateItemFn = (item: Project) => Promise<any>;
type DeleteItemFn = (id: string) => Promise<any>;

interface ItemsState {
    items?: Project[];
    fetching: boolean;
    fetchingError?: Error | null;
    updating: boolean,
    updateError?: Error | null,
    updateItem?: UpdateItemFn,
    addItem?: UpdateItemFn,
    deleteItem?: DeleteItemFn;
    successMessage?: string;
    closeShowSuccess?: () => void;
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    fetching: false,
    updating: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const UPDATE_ITEM_STARTED = 'UPDATE_ITEM_STARTED';
const UPDATE_ITEM_SUCCEEDED = 'UPDATE_ITEM_SUCCEEDED';
const UPDATE_ITEM_FAILED = 'UPDATE_ITEM_FAILED';
const SHOW_SUCCESS_MESSAGE = 'SHOW_SUCCESS_MESSAGE';
const HIDE_SUCCESS_MESSAGE = 'HIDE_SUCCESS_MESSAGE';
const CREATE_ITEM_STARTED = 'CREATE_ITEM_STARTED';
const CREATE_ITEM_SUCCEEDED = 'CREATE_ITEM_SUCCEEDED';
const CREATE_ITEM_FAILED = 'CREATE_ITEM_FAILED';
const DELETE_ITEM_STARTED = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';
const DELETE_ITEM_FAILED = 'DELETE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState
    = (state, { type, payload }) => {
    switch (type) {
        case FETCH_ITEMS_STARTED:
            return { ...state, fetching: true, fetchingError: null };
        case FETCH_ITEMS_SUCCEEDED:
            return {...state, items: payload.items, fetching: false };
        case FETCH_ITEMS_FAILED:
            return { ...state, fetchingError: payload.error, fetching: false };

        case UPDATE_ITEM_STARTED:
            return { ...state, updateError: null, updating: true };
        case UPDATE_ITEM_FAILED:
            return { ...state, updateError: payload.error, updating: false };
        case UPDATE_ITEM_SUCCEEDED:
            const items = [...(state.items || [])];
            const item = payload.item;
            const index = items.findIndex(it => it._id === item._id);
            items[index] = item;
            return { ...state, items: items, updating: false };

        case CREATE_ITEM_FAILED:
            console.log(payload.error);
            return { ...state, updateError: payload.error, updating: false };
        case CREATE_ITEM_STARTED:
          return { ...state, updateError: null, updating: true };
        case CREATE_ITEM_SUCCEEDED:
            const beforeItems = [...(state.items || [])];
            const createdItem : Project = payload.item;
            console.log(createdItem);
            const indexOfAdded = beforeItems.findIndex(it => it._id === createdItem._id || it.projectName === createdItem.projectName);
            console.log("index: ", indexOfAdded);
            if (indexOfAdded === -1) {
                beforeItems.splice(0, 0, createdItem);
            } else {
                beforeItems[indexOfAdded] = createdItem;
            }
            console.log(beforeItems);
            console.log(payload);
            return { ...state,  items: beforeItems, updating: false, updateError: null };

        case DELETE_ITEM_FAILED:
            console.log(payload.error);
            return { ...state, updateError: payload.error, updating: false };
        case DELETE_ITEM_STARTED:
            return { ...state, updateError: null, updating: true };
        case DELETE_ITEM_SUCCEEDED:
            const originalItems = [...(state.items || [])];
            const deletedItem = payload.item;
            const indexOfDeleted = originalItems.findIndex(it => it._id === deletedItem._id);
            if (indexOfDeleted > -1) {
                originalItems.splice(indexOfDeleted, 1);
            }
            console.log(originalItems);
            console.log(payload);
            return { ...state,  items: originalItems, updating: false };

        case SHOW_SUCCESS_MESSAGE:
            const allItems = [...(state.items || [])];
            const updatedItem = payload.updatedItem;
            const indexOfItem = allItems.findIndex(it => it._id === updatedItem._id);
            allItems[indexOfItem] = updatedItem;
            console.log(payload);
            return {...state, items: allItems, successMessage: payload.successMessage }
        case HIDE_SUCCESS_MESSAGE:
            return {...state, successMessage: payload }
        
        default:
            return state;
    }
};

export const ItemsContext = React.createContext(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError, updating, updateError, successMessage } = state;
    const { token } = useContext(AuthContext);
    const { networkStatus } = useNetwork();
    const [toast] = useIonToast();

    useEffect(getItemsEffect, [token]);
    useEffect(wsEffect, [token]);
    useEffect(executePendingOperations, [networkStatus.connected, token, toast]);

    const updateItem = useCallback<UpdateItemFn>(updateItemCallback, [token]);
    const addItem = useCallback<UpdateItemFn>(addItemCallback, [token]);
    const deleteItem = useCallback<DeleteItemFn>(deleteItemCallback, [token]);

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
        }

        async function fetchItems() {
            if(!token?.trim()) {
                return;
            }

            try {
                log('fetchItems started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                const items = await apiService.getAllItems(token);
                log('fetchItems succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
                }
            } catch (error) {
                log('fetchItems failed');
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
                }
            }
        }
    }

    async function updateItemCallback(item: Project) {
        try {
            log('updateItem started');
            dispatch({ type: UPDATE_ITEM_STARTED });
            const updatedItem = await apiService.updateItemAPI(token, item);
            log('updateItem succeeded');
            dispatch({ type: UPDATE_ITEM_SUCCEEDED, payload: { item: updatedItem } });
        } catch (error: any) {
            log('updateItem failed');
            // save item to storage
            console.log('Updating item locally...');

            item.isNotSaved = true;
            await Preferences.set({
                key: `upd-${item.projectName}`,
                value: JSON.stringify({token, item: item })
            });
            dispatch({ type: UPDATE_ITEM_SUCCEEDED, payload: { item: item } });
            toast("Updating item locally...", 3000);

            if(error.toJSON().message === 'Network Error')
                dispatch({ type: UPDATE_ITEM_FAILED, payload: { error: new Error(error.response) } });
        }
    }

    async function addItemCallback(item: Project){
        try {
            log('addItem started');
            dispatch({ type: CREATE_ITEM_STARTED });
            console.log(token);
            const addedItem = await apiService.createItemAPI(token, item);
            console.log(addedItem);
            log('addItem succeeded');
            dispatch({ type: CREATE_ITEM_SUCCEEDED, payload: { item: addedItem } });
        } catch (error: any) {
            log('addItem failed');
            console.log(error.response);

            // save item to storage
            console.log('Saving item locally...');
            const { keys } = await Preferences.keys();
            const matchingKeys = keys.filter(key => key.startsWith('sav-'));
            const numberOfItems = matchingKeys.length + 1;
            console.log(numberOfItems);

            item._id = numberOfItems.toString();
            item.isNotSaved = true;
            await Preferences.set({
                key: `sav-${item.projectName}`,
                value: JSON.stringify({token, item: item })
            });
            dispatch({ type: CREATE_ITEM_SUCCEEDED, payload: { item: item } });
            toast("Saving item locally...", 3000);

            if(error.toJSON().message === 'Network Error')
                dispatch({ type: CREATE_ITEM_FAILED, payload: { error: new Error(error.response || 'Network error') } });
        }
    }

    async function deleteItemCallback(id: string){
        try {
            log('deleteItem started');
            dispatch({ type: DELETE_ITEM_STARTED });
            const deletedItem = await apiService.deleteItemAPI(token, id);
            log('deleteItem succeeded');
            dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { item: deletedItem } });
        } catch (error: any) {
            log('addItem failed');
            console.log(error.response.data.message);
            dispatch({ type: DELETE_ITEM_FAILED, payload: { error: new Error(error.response.data.message) } });
        }
    }

    function executePendingOperations(){
        async function helperMethod(){
            if (networkStatus.connected && token?.trim()) {
                log('Executing pending operations')

                const { keys } = await Preferences.keys();
                for (const key of keys) {
                    if (key.startsWith("sav-")) {
                        const res = await Preferences.get({key: key});
                        console.log("Result", res);

                        if (typeof res.value === "string") {
                            const value = JSON.parse(res.value);
                            value.item._id = undefined;
                            log('creating item from pending', value);
                            await addItemCallback(value.item);
                            await Preferences.remove({key: key});
                        }
                    }
                }

                for (const key of keys) {
                    if (key.startsWith("upd-")) {
                        const res = await Preferences.get({key: key});
                        console.log("Result", res);

                        if (typeof res.value === "string") {
                            const value = JSON.parse(res.value);
                            log('updating item from pending', value);
                            await updateItemCallback(value.item);
                            await Preferences.remove({key: key});
                        }
                    }
                }
            }
        }

        helperMethod();
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if(token?.trim()){
          closeWebSocket = newWebSocket(token, message => {
            if (canceled) {
              return;
            }
            const { event, payload } = message;
            console.log('Provider message: ', message);

            log(`ws message, item ${event}`);
            if (event === 'updated') {
              console.log(payload);
              dispatch({ type: SHOW_SUCCESS_MESSAGE, payload: {successMessage: payload.successMessage, updatedItem: payload.item } });
            }
            else if(event == 'created'){
              console.log(payload);
              dispatch({ type: CREATE_ITEM_SUCCEEDED, payload: { item: payload.item } });
            }
            else if(event === 'deleted'){
              console.log(payload);
              dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { item: payload.item } });
            }
          });
        }
        return () => {
          log('wsEffect - disconnecting');
          canceled = true;
          closeWebSocket?.();
        }
    }

    function closeShowSuccess(){
        dispatch({ type: HIDE_SUCCESS_MESSAGE, payload: null });
    }

    const value = { items, fetching, fetchingError, updating, updateError, updateItem: updateItem, addItem: addItem, deleteItem: deleteItem, successMessage, closeShowSuccess };

    return (
      <ItemsContext.Provider value={value}>
        {children}
      </ItemsContext.Provider>
    );
};

