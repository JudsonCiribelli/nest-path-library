import { faker } from '@faker-js/faker';
import { ImATeapotException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export function makeCreateUserDto(
  override?: Partial<CreateUserDto>,
): CreateUserDto {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 10, pattern: /[A-Z]/ }),
    phone: faker.phone.number({ style: 'national' }),
    ...override,
  };
}

export function makeUserEntity(override?: any) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    password: 'HASHED_PASSWORD',
    imageProfile: null,
    active: 'IN_USE',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}
