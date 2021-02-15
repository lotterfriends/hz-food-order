import { Table } from "src/tables/table.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { OrderStatus } from "./types/order-status";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

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

  @ManyToOne(() => Table, table => table.orders, { eager: false })
  @JoinColumn()
  table: Table;
  

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  @JoinColumn()
  items: OrderItem[]

}