import { Order } from "../order/order.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @DeleteDateColumn()
  deleted: boolean;

  @Column()
  name: string;

  @Column()
  key: string;

  // @OneToMany(() => Order, order => order.table, { cascade: true })
  @OneToMany('Order', 'table', { cascade: true })
  @JoinColumn()
  orders: Order[]

}