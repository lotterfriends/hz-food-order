import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

  @Column({ default: false })
  seperateOrderPerProductCategory: boolean;
  
  @Column('simple-array')
  oldSecrets: string[];

}