import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

  @Column({default: 100})
  order: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price?: number;

  @ManyToOne(() => ProductCategory, category => category.product, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  category: ProductCategory

}