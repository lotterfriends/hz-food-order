import { Order } from "src/order/order.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column()
  name: string;

  @Column()
  key: string;

  @OneToMany(() => Order, order => order.table, { cascade: true })
  @JoinColumn()
  orders: Order[]

}