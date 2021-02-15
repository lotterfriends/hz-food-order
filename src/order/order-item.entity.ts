import { Meal } from "src/meal/meal.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column()
  count: number;

  @ManyToOne(() => Meal)
  @JoinColumn()
  meal: Meal

  @ManyToOne(() => Order, order => order.items, { eager: false })
  order: Order;
  
}