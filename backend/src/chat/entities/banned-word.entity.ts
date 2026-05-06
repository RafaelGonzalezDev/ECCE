import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * BannedWord — Infraestructura lista para moderación de chat.
 * action: 'block' = no permite enviar el mensaje
 *         'blur'  = muestra el texto borroso para el receptor
 */
@Entity('banned_words')
export class BannedWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  word: string;

  @Column({ default: 'blur', length: 10 })
  action: 'block' | 'blur';

  @CreateDateColumn()
  createdAt: Date;
}
