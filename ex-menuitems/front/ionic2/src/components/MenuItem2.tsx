import React from "react";
import {IonItem, IonTitle} from "@ionic/react";
import {MenuItem2Dto} from "../core/MenuItem2Dto";

interface MenuItem2Props {
    item: MenuItem2Dto;
    changeSelection: (item: MenuItem2Dto) => void;
    isSelected: boolean;
}

export const MenuItem2: React.FC<MenuItem2Props> = ({item, changeSelection, isSelected}) => {
    return (
      <IonItem style={{color: `${isSelected ? 'red' : 'black'}`}} onClick={() => changeSelection(item)}>
          <IonTitle> {item.name} </IonTitle>
      </IonItem>
    );
}