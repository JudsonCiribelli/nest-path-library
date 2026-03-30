import { BookStatus } from '@prisma/client';

export class ResponseBooksDto {
  id: string;
  title: string;
  description: string | null;
  pages: number;
  year: number;
  status: BookStatus;
  authorId: string;
  categoryId: string;
}
