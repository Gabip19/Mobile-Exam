export interface Project {
    _id?: string;
    projectName: string;
    employeesNum: number;
    startDate: Date;
    active: boolean;
    isNotSaved?: boolean;
    photo?: string;
    latitude?: number|undefined
    longitude?: number|undefined
}