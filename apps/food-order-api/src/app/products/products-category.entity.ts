import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./products.entity";

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column()
  name?: string;

  @Column()
  icon?: string;
  
  @Column({nullable: true})
  description?: string;

  @OneToMany(() => Product, product => product.category)
  @JoinColumn()
  product: Product;

  @Column({default: 0})
  order: number;

}