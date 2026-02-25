import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateUserDto extends PartialType(CreateUserDto) {}
