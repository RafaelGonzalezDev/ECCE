import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToMany, JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Permission } from '../permissions/permission.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 255, nullable: true, default: null })
  description: string | null;

  /** System roles (admin, user) cannot be deleted */
  @Column({ default: false })
  isSystem: boolean;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (perm) => perm.roles, { eager: true })
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;
}
