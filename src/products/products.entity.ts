import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductCategory } from "./products-category.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column()
  name?: string;
  
  @Column({nullable: true})
  description?: string;

  @Column()
  stock?: number;
  
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price?: number;

  @OneToMany(() => ProductCategory, category => category.product, { cascade: true })
  @JoinColumn()
  category: ProductCategory

}