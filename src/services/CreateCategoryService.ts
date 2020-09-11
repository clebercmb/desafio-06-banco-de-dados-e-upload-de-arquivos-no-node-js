import { getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const checkCategoryExist = await categoriesRepository.findOne({ title });

    if (checkCategoryExist) {
      throw new AppError('Category already used');
    }

    const createCategory = categoriesRepository.create({ title });

    const category = categoriesRepository.save(createCategory);

    return category;
  }
}

export default CreateCategoryService;
