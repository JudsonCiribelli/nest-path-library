import { faker } from '@faker-js/faker';
import { CreateBookDto } from '@/books/dto/create-book.dto';

const author = {
  id: faker.string.uuid(),
};
const category = {
  id: faker.string.uuid(),
};

export function makeCreateBookDto(
  override?: Partial<CreateBookDto>,
): CreateBookDto {
  return {
    title: faker.person.fullName(),
    description: faker.person.bio(),
    authorId: author.id,
    categoryId: category.id,
    pages: faker.number.int(),
    year: faker.number.int(),
    ...override,
  };
}

export function makeBookEntity(override?: any) {
  return {
    id: faker.string.uuid(),
    title: faker.person.fullName(),
    description: faker.person.bio(),
    authorId: author.id,
    categoryId: category.id,
    pages: faker.number.int(),
    year: faker.number.int(),
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}
