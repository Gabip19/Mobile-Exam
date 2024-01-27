import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonDatetime,
  IonSelect,
  IonItem,
  IonImg,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSelectOption
} from '@ionic/react';
import { getLogger } from '../../core';
import { RouteComponentProps } from 'react-router';
import { ItemsContext } from '../../contexts/examples/ItemProvider';
import { Project } from '../../core/Project';
import {camera} from "ionicons/icons"
import { usePhotos } from '../../hooks/examples/usePhotos';
import { useMyLocation } from '../../hooks/examples/useMyLocation';
import MyMap from "../../components/examples/MyMap";
import { MyModal } from '../../components/examples/MyModal';

const log = getLogger('EditLogger');

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> {}

export const EditItemPage: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, updating, updateError, updateItem, deleteItem } = useContext(ItemsContext);
  const [projectName, setProjectName] = useState('');
  const [employeesNum, setEmployeesNum] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [active, setActive] = useState(true);
  const [itemToUpdate, setItemToUpdate] = useState<Project>();

  const [photo, setPhoto] = useState<string|undefined>('');

  const [latitude, setLatitude] = useState<number|undefined>(0);
  const [longitude, setLongitude] = useState<number|undefined>(0);

  const myLocation = useMyLocation();
  const { latitude: lat, longitude: lng } = myLocation.position?.coords || {}

  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const routeId = match.params.id || '';
    console.log(routeId);
    const item = items?.find(it => it._id === routeId);
    setItemToUpdate(item);

    if (item) {
      setProjectName(item.projectName);
      setEmployeesNum(item.employeesNum.toString());
      setActive(item.active);
      setStartDate(item.startDate);
      setPhoto(item.photo);
      setLatitude(item.latitude ? item.latitude : 46);
      setLongitude(item.longitude ? item.longitude: 23);
    }
    else {
      setLatitude(lat);
      setLongitude(lng);
    }
  }, [match.params.id, items]);

  const handleUpdate = useCallback(() => {
    const editedItem = { ...itemToUpdate, projectName: projectName, employeesNum: parseInt(employeesNum), startDate: startDate, active: active, photo: photo, latitude: latitude, longitude: longitude };
    log(editedItem);
    console.log(updateItem);
    updateItem && updateItem(editedItem).then(() => editedItem.employeesNum && history.goBack());
  }, [itemToUpdate, updateItem, projectName, employeesNum, startDate, active, photo, latitude, longitude, history]);

  const dateChanged = (value: any) => {
    let formattedDate = value;
    console.log(formattedDate);
    setStartDate(formattedDate);
  };

  const handleDelete = useCallback(()=>{
    console.log(itemToUpdate?._id);
    deleteItem && deleteItem(itemToUpdate?._id!).then(()=> history.goBack());
  }, [itemToUpdate, deleteItem, projectName, employeesNum, history]);

  const {photos, takePhoto, deletePhoto,} = usePhotos();
  const [photoTaken, setPhotoTaken] = useState(false);

  useEffect(() => {
    log('useEffect');
    photoTaken && photos && photos[0] && photos[0].webviewPath && setPhoto(photos[0].webviewPath)
  }, [photos, photoTaken]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
          <IonTitle> Edit </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleUpdate}> Update </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div> Location </div>
        <div> latitude: {latitude} </div>
        <div> longitude: {longitude} </div>
        {latitude && longitude &&
          <IonItem>
            <MyMap
              lat={latitude}
              lng={longitude}
              onMapClick={(position)=> {
                setLatitude(position.latitude);
                setLongitude(position.longitude);
              }}
              onMarkerClick={()=>log('onMarker')}
            />
          </IonItem>
        }
        <IonInput label="Project Name:" placeholder="new project name" value={projectName} onIonInput={e => setProjectName(prev => e.detail.value || '')} />
        <IonInput label="Employees:" placeholder="employees number" value={employeesNum} onIonInput={e => e.detail.value ? setEmployeesNum(prev => e.detail.value!) : setEmployeesNum('') }/>
        <IonInput label="Start date:" placeholder="choose date" value={new Date(startDate).toDateString()} />
        <IonDatetime
            onIonChange={(e) => dateChanged(e.detail.value)}>
        </IonDatetime>
        <IonInput label="Active:" placeholder="True/False" value={active ? 'True' : 'False'} />
        <IonSelect value={active} onIonChange={e => setActive(e.detail.value)}>
          <IonSelectOption value={true}> {'True'} </IonSelectOption>
          <IonSelectOption value={false}> {'False'} </IonSelectOption>
        </IonSelect>
        <IonLoading isOpen={updating} />
        {updateError && (
          <div> {updateError.message || 'Failed to update item'} </div>
        )}
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={async () => {
              try {
                await takePhoto();
                setPhotoTaken(true);
              }
              catch (e) {
              }
            }}>
            <IonIcon icon={camera}/>
          </IonFabButton>
        </IonFab>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <MyModal/>
        </IonFab>
        {photo && (
          <IonItem>
            <IonImg class="ion-img" src={photo} onClick={() => setPhoto('')} />
          </IonItem>
        )}
      </IonContent>
    </IonPage>
  );
}
