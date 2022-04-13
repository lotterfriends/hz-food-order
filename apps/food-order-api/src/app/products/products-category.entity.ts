import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./products.entity";

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @DeleteDateColumn()
  deleted: boolean;

  @Column()
  name?: string;

  @Column()
  icon?: string;
  
  @Column({default: 0})
  funnels?: number;

  @Column({default: false})
  disabled: boolean;
  
  @Column({nullable: true})
  description?: string;

  // @OneToMany(() => Product, product => product.category)
  @OneToMany('Product', 'category')
  @JoinColumn()
  product: Product;

  @Column({default: 0})
  order: number;

}