import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [BooksService],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  describe('getAllBooks', () => {
    it('should return an array of books', async () => {
      const date = new Date();
      const expectedBooks: any = [
        { id: 1, title: 'Book 1', isbn: '1234567890', createdAt: date, updatedAt: date },
        { id: 2, title: 'Book 2', isbn: '0987654321', createdAt: date, updatedAt: date },
      ];

      jest.spyOn(service, 'getAllBooks').mockResolvedValueOnce(expectedBooks);

      expect(await controller.getAllBooks()).toEqual([
        { id: 1, title: 'Book 1', isbn: '1234567890', createdAt: date, updatedAt: date },
        { id: 2, title: 'Book 2', isbn: '0987654321', createdAt: date, updatedAt: date },
      ]);
    });
  });

  describe('createBook', () => {
    const date = new Date();
    const existingBooks: any = [
      { id: 1, title: 'Book 1', isbn: '1234567890', createdAt: date, updatedAt: date },
      { id: 2, title: 'Book 2', isbn: '0987654321', createdAt: date, updatedAt: date },
    ];

    beforeEach(() => {
      jest.spyOn(service, 'getAllBooks').mockResolvedValueOnce(existingBooks);
    });

    it('should create a new book and return the updated list of books', async () => {
      const createBookDto: any = {
        title: 'Book 3',
        isbn: '1122334455',
      };

      const newBook: any = {
        id: existingBooks.length + 1,
        title: createBookDto.title,
        isbn: createBookDto.isbn,
        createdAt: date,
        updatedAt: date,
      };

      jest.spyOn(service, 'createBook').mockImplementation(async (dto) => {
        existingBooks.push(newBook);
        return newBook;
      });

      await controller.createBook(createBookDto);

      expect(await controller.getAllBooks()).toEqual(existingBooks);
    });
  });

  describe('updateBookTitle', () => {
    it('should update the title of an existing book and return the updated list of books', async () => {
      const date = new Date();
      const existingBooks: any = [
        { id: 1, title: 'Book 1', isbn: '1234567890', createdAt: date, updatedAt: date },
        { id: 2, title: 'Book 2', isbn: '0987654321', createdAt: date, updatedAt: date },
      ];

      jest.spyOn(service, 'getAllBooks').mockResolvedValueOnce(existingBooks);

      const bookId = 1;
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Book Title',
      };

      const updatedBook: any = {
        ...existingBooks[bookId - 1],
        title: updateBookDto.title,
        updatedAt: date,
      };

      jest.spyOn(service, 'updateBook').mockImplementation(async (id, dto) => {
        existingBooks[bookId - 1] = updatedBook;
        return updatedBook;
      });

      const result = await controller.updateBookTitle(bookId, updateBookDto);
      const expectedList = [...existingBooks];

      expect(result).toEqual(updatedBook);
      expect(await controller.getAllBooks()).toEqual(expectedList);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book and return updated list', async () => {
      const date = new Date();
      let result = null;
      // Create two books
      let expectedBooks: any = [
        { id: 1, title: 'Book 1', isbn: '1234567890', createdAt: date, updatedAt: date },
        { id: 2, title: 'Book 2', isbn: '0987654321', createdAt: date, updatedAt: date },
      ];

      jest.spyOn(service, 'getAllBooks').mockResolvedValueOnce(expectedBooks);

      jest.spyOn(service, 'deleteBook').mockImplementationOnce(async (id: number) => {
        // Simulate book deletion
        result = expectedBooks.filter((user) => {
          return user.id !== id;
      });
      });

      // Delete the book with id 1
      await controller.deleteBook(1);

      expect(result).toHaveLength(1);
    });

    it('should handle NotFoundException when deleting a non-existing book', async () => {
      // Mock the service method to throw a NotFoundException
      jest.spyOn(service, 'deleteBook').mockRejectedValueOnce(new NotFoundException());

      // Verify that the controller handles NotFoundException and returns the appropriate response
      await expect(controller.deleteBook(999)).rejects.toThrow(NotFoundException);
    });
  });
});
