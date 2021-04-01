import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column()
  secret?: string;

  @Column({ default: false })
  seperateOrderPerProductCategory: boolean;
  
  @Column('simple-array')
  oldSecrets: string[];

}