import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Settings {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;
  
  @UpdateDateColumn()
  updated: Date;

  @Column()
  secret?: string;

  @Column()
  logo?: string;

  @Column({ default: false })
  seperateOrderPerProductCategory: boolean;
  
  @Column({ default: false })
  disableProductOnOutOfStock: boolean;
  
  @Column({ default: true })
  orderCode: boolean;
  
  @Column({ default: true })
  pickupOrder: boolean;

  @Column({ default: true })
  orderSound: boolean;
  
  @Column({ default: false })
  whileStocksLast: boolean;
  
  @Column({ default: false })
  tableCode: boolean;
  
  @Column('simple-array')
  oldSecrets: string[];

}