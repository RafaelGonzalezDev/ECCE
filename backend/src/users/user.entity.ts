import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToMany, JoinTable, OneToMany,
} from 'typeorm';
import { Role } from '../roles/role.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 191 })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ length: 30, nullable: true, default: null })
  phone: string | null;

  @Column({ default: false })
  isChurchMember: boolean;

  @Column({ length: 200, nullable: true, default: null })
  churchName: string | null;

  @Column({ default: false })
  isEntrepreneur: boolean;

  @Column({ length: 200, nullable: true, default: null })
  businessName: string | null;

  @Column({ length: 100 })
  departamento: string;

  @Column({ length: 100 })
  municipio: string;

  @Column({ nullable: true, default: null })
  avatarUrl: string | null;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
