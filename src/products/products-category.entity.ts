import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./products.entity";

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column()
  name?: string;
  
  @Column({nullable: true})
  description?: string;

  @ManyToOne(() => Product, product => product.category, { eager: false })
  @JoinColumn()
  product: Product;

}