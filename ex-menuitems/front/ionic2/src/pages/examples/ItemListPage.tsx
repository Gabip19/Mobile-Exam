import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import ItemComponent from '../../components/examples/ItemComponent';
import { ItemsContext } from '../../contexts/examples/ItemProvider';
import { IonContent, 
         IonHeader, 
         IonList, 
         IonLoading, 
         IonPage, 
         IonTitle, 
         IonToolbar,
         IonToast, 
         IonFab,
         IonFabButton,
         IonIcon,
         IonButton, 
         IonButtons,
         IonInfiniteScroll,
         IonInfiniteScrollContent,
         IonSearchbar,
         IonSelect, IonSelectOption } from '@ionic/react';

import { add } from 'ionicons/icons';
import { AuthContext } from "../../contexts/examples/AuthProvider";
import { NetworkState } from '../../components/examples/NetworkState';
import { Project } from '../../core/Project';
import {usePhotos} from "../../hooks/examples/usePhotos";
import { createAnimation } from '@ionic/react';
import './itemListPage.css'

const itemsPerPage = 3;
const filterValues = ["active", "not active"];

export const ItemsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { items, fetching, fetchingError, successMessage, closeShowSuccess } = useContext(ItemsContext);
  const { logout } = useContext(AuthContext);
  const [isOpen, setIsOpen]= useState(false);
  const [index, setIndex] = useState<number>(0);
  const [itemsAux, setItemsAux] = useState<Project[] | undefined>([]);
  const [more, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const {photos, takePhoto, deletePhoto} = usePhotos();
  //const [hasFetched, setHasFetched] = useState(false);

  useEffect(()=> {
    const el = document.querySelector('.square-a');
    if (el) {
      const animation = createAnimation()
        .addElement(el)
        .duration(5000)
        .direction('alternate')
        .iterations(Infinity)
        .keyframes([
          { offset: 0, transform: 'scale(3)', opacity: '1' },
          { offset: 0.5, transform: 'scale(1.5)', opacity: '1' },
          {
            offset: 1, transform: 'scale(0.5)', opacity: '0.2'
          }
        ]);
      animation.play();
    }
  }, []);

  useEffect(()=>{
    if (fetching) setIsOpen(true);
    else setIsOpen(false);
  }, [fetching]);

  function handleLogout(){
    logout?.();
    history.push('/login');
  }

  //pagination
  useEffect(()=> {
      fetchData();
  }, [items]);

  function fetchData() {
      if (items) {
          const newIndex = Math.min(index + itemsPerPage, items.length);
          if(newIndex >= items.length) {
              setHasMore(false);
          }
          else {
              setHasMore(true);
          }
          setItemsAux(items.slice(0, newIndex));
          setIndex(newIndex);
      }
  }

  // searching
  useEffect(()=>{
      if (searchText === "") {
          setItemsAux(items);
      }
      if (items && searchText !== "") {
          setItemsAux(items.filter(item => item.projectName!.startsWith(searchText)));
      }
  }, [searchText]);

  // filtering
  useEffect(() => {
      if (items && filter) {
          setItemsAux(items.filter(item => {
              if (filter === "active")
                  return item.active;
              else
                  return !item.active;
          }));
      }
  }, [filter]);

  async function searchNext($event: CustomEvent<void>){
      await fetchData();
      await ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle> Project Managing App </IonTitle>
          <IonSelect 
            slot="end" 
            value={filter} 
            placeholder="Filter" 
            onIonChange={(e) => setFilter(e.detail.value)}>
                {filterValues.map((each) => (
                    <IonSelectOption key={each} value={each}>
                        {each}
                    </IonSelectOption>
                ))}
          </IonSelect>
          <NetworkState/>
          <IonSearchbar placeholder="Search projects" value={searchText} debounce={200} onIonInput={
              (e) => {
                        setSearchText(e.detail.value!);
              }} slot="secondary">
          </IonSearchbar>
          <IonButtons slot='end'>
             <IonButton onClick={handleLogout}> Logout </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="square-a">
          <p> Projects Managing App </p>
        </div>
        <IonLoading isOpen={isOpen} message="Fetching projects..." />
        {itemsAux && (
          <IonList>
            {itemsAux.map(item =>
              <ItemComponent key={item._id}
                    _id={item._id}
                    projectName={item.projectName}
                    employeesNum={item.employeesNum}
                    startDate={item.startDate}
                    active={item.active}
                    isNotSaved={item.isNotSaved}
                    photo={item.photo}
                    onEdit={id => history.push(`/item/${id}`)}
              />
            )}
          </IonList>
        )}
        <IonInfiniteScroll threshold="100px" disabled={!more} onIonInfinite={(e:CustomEvent<void>) => {
                setTimeout(() => searchNext(e), 500);
            }}>
          <IonInfiniteScrollContent loadingText="Loading more projects..."></IonInfiniteScrollContent>
        </IonInfiniteScroll>
        {fetchingError && (
          <div> {fetchingError.message || 'Failed to fetch projects'} </div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/item')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        <IonToast
          isOpen={!!successMessage}
          message={successMessage}
          position='bottom'
          buttons={[
            {
              text: 'Dismiss',
              role: 'cancel',
              handler: () => {
                console.log('More Info clicked');
              },
            }
          ]}
          onDidDismiss={closeShowSuccess}
          duration={5000}
        />
      </IonContent>
    </IonPage>
  );
};