import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany,
} from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  /** Unique key, e.g. "users:read", "marketplace:write" */
  @Column({ unique: true, length: 100 })
  name: string;

  /** Module this permission belongs to, e.g. "users", "marketplace" */
  @Column({ length: 100 })
  module: string;

  /** Action within the module, e.g. "read", "write", "delete" */
  @Column({ length: 50 })
  action: string;

  @Column({ length: 255, nullable: true, default: null })
  description: string | null;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
