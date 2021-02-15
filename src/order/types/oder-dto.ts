import { OrderStatus } from "./order-status";

export interface OrderDto {
  items: {
    id: number;
    name: string;
    count: number;
  }[];
  comment?: string;
  status: OrderStatus;
}
