import { Table } from "../tables/table.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { OrderStatus } from "./types/order-status";
import { TableType } from "../tables/table-type.enum";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;
  
  @CreateDateColumn()
  created: Date;

  @Column()
  code: string;

  @Column({nullable: true})
  comment: string;
  
  @Column({nullable: true})
  orderMessage: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    nullable: true
  })
  status?: OrderStatus;

  @Column({nullable: true, default: null})
  archived: Date;
  
  @Column({nullable: true})
  funnel: number;

  // @ManyToOne(() => Table, table => table.orders, { eager: false })
  @ManyToOne('Table', 'orders', { eager: false })
  @JoinColumn()
  table: Table;
  

  // @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  @OneToMany('OrderItem', 'order', { cascade: true })
  @JoinColumn()
  items: OrderItem[]

}

export interface OrderFilter {
  orderStatus?: OrderStatus[] | null;
  productCategories?: number[];
  table?: number | TableType;
  code?: string;
  funnels?:{
    categoryId: number;
    funnel: number
  }[]
}