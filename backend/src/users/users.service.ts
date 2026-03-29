import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadAvatar(user: User, file: Express.Multer.File) {
    // Si el usuario ya tiene un avatar que empiece con cloudinary, podríamos borrar el viejo,
    // pero por simplicidad solo lo sobrescribiremos en la BD por ahora.
    try {
        const res = await this.cloudinaryService.uploadImage(file);
        
        await this.usersRepo.update(user.id, { avatarUrl: res.secure_url });
        
        return { avatarUrl: res.secure_url };
    } catch (e) {
        throw e;
    }
  }
}
