import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./roles.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({default: true})
  active: boolean;

  @CreateDateColumn()
  created: Date;

  @Column()
  username: string;

  @DeleteDateColumn()
  deleted: boolean;

  @Column({
    enum: Role,
    type: 'set',
    default: [Role.Runner]
  })
  roles: Role[];

  @Column({ select: false })
  password: string;

}
