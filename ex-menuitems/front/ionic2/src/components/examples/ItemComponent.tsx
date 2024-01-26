import React, { memo } from "react";
import { IonImg, IonItem, IonLabel } from "@ionic/react";
import { Project } from "../../core/Project";

interface ItemPropsExtended extends Project {
    onEdit: (_id?: string) => void;
}

const ItemComponent: React.FC<ItemPropsExtended> = ({_id, projectName, employeesNum, startDate, active, isNotSaved, photo, onEdit }) => (
    <IonItem color={isNotSaved ? "medium" : undefined} onClick={() => onEdit(_id)}>
      <div style={{display: "grid", gridTemplateColumns: "auto ifr", alignItems: "center"}}>
        <IonLabel>
          <h1> {projectName} </h1>
        </IonLabel>
        <div>
          <p> Employees: {employeesNum} </p>
            {startDate && (
              <p> Start date: {new Date(startDate).toDateString()} </p>
            )}
            <p> Active: {active ? "Yes" : "No"} </p>
        </div>
        <div>
        {photo &&
          <IonImg class="ion-img" src={photo}/>}
        </div>
      </div>
    </IonItem>
);

export default memo(ItemComponent);
