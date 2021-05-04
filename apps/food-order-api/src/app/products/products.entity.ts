import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductCategory } from "./products-category.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @DeleteDateColumn()
  deleted: boolean;

  @Column()
  name?: string;

  @Column({nullable: true})
  description?: string;

  @Column({default: false})
  disabled: boolean;

  @Column()
  stock?: number;

  @Column({default: 0})
  order: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price?: number;

  // @ManyToOne(() => ProductCategory, category => category.product, { eager: true, onDelete: 'SET NULL' })
  @ManyToOne('ProductCategory', 'product', { eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  category: ProductCategory

}