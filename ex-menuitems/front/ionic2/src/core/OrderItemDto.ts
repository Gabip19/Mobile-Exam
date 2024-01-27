import {MenuItemDto} from "./MenuItemDto";

export interface OrderItemDto extends MenuItemDto {
    quantity: number;
}