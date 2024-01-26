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
  IonIcon, IonFab, IonFabButton,
  IonSelectOption
} from '@ionic/react';
import { getLogger } from '../../core';
import {camera} from "ionicons/icons"
import { RouteComponentProps } from 'react-router';
import { ItemsContext } from '../../contexts/ItemProvider';
import { Project } from '../../core/Project';
import { usePhotos } from '../../hooks/examples/usePhotos';
import { useMyLocation } from '../../hooks/examples/useMyLocation';
import MyMap from "../../components/examples/MyMap";

const log = getLogger('SaveLogger');

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> {}

export const AddItemPage: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, updating, updateError, addItem } = useContext(ItemsContext);
  const [projectName, setProjectName] = useState('');
  const [employeesNum, setEmployeesNum] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [active, setActive] = useState(true);
  const [itemToUpdate, setItemToUpdate] = useState<Project>();

  const [photo, setPhoto] = useState<string|undefined>('');

  const [latitude, setLatitude] = useState<number|undefined>(47);
  const [longitude, setLongitude] = useState<number|undefined>(24);

  const myLocation = useMyLocation();
  const { latitude: lat, longitude: lng } = myLocation.position?.coords || {}
  

  const handleAdd = useCallback(() => {
    const editedItem ={ ...itemToUpdate, projectName: projectName, employeesNum: parseFloat(employeesNum), startDate: startDate, active: active, photo: photo, latitude: latitude, longitude: longitude };
    log(editedItem);
    console.log(updateError);
    addItem && addItem(editedItem).then(() => editedItem.employeesNum && history.goBack());
  }, [itemToUpdate, addItem, projectName, employeesNum, startDate, active, photo, latitude, longitude, history]);

  const dateChanged = (value: any) => {
    let formattedDate = value;
    console.log(formattedDate);
    setStartDate(formattedDate);
  };

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
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleAdd}>
              Add
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>Location</div>
        <div>latitude: {latitude}</div>
        <div>longitude: {longitude}</div>
        {latitude && longitude &&
          <IonItem>
            <MyMap
              lat={latitude}
              lng={longitude}
              onMapClick={(position)=>{
                setLatitude(position.latitude);
                setLongitude(position.longitude);
              }}
              onMarkerClick={()=>log('onMarker')}
            />
          </IonItem>
        }
        <IonInput label="Project Name:" placeholder="Project Name" value={projectName} onIonInput={e => setProjectName(prev => e.detail.value || '')} />
        <IonInput label="Employees:" placeholder="Employees Num" value={employeesNum} onIonInput={e => e.detail.value ? setEmployeesNum(prev => e.detail.value!) : setEmployeesNum('') }/>
        <IonInput label="Start date:" placeholder="Choose date" value={new Date(startDate).toDateString()} />
        <IonDatetime onIonChange={(e) => dateChanged(e.detail.value)}> </IonDatetime>
        <IonInput label="Is Active:" placeholder="True/False" value={active ? 'True' : 'False'} />
        <IonSelect value={active} onIonChange={e => setActive(e.detail.value)}>
          <IonSelectOption value={true}>
            {'True'}
          </IonSelectOption>
          <IonSelectOption value={false}>
            {'False'}
          </IonSelectOption>
        </IonSelect>
        <IonLoading isOpen={updating} />
        {updateError && (
          <div>{updateError.message || 'Failed to save item'}</div>
        )}
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={async () => {
              try {
                await takePhoto();
                setPhotoTaken(true);
              }
              catch (e){

              }
            }}>
            <IonIcon icon={camera}/>
          </IonFabButton>
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