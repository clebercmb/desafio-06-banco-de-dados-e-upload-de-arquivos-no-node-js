import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO()
    if (!(type === 'income' || type == 'outcome')) {
      throw new AppError(`The transaction type must be "income" or "outcome"`);
    }

    if (!category) {
      throw new AppError(`It is necessary a valid category`);
    }

    const categoriesRepository = getRepository(Category);
    let checkCategoryExist = await categoriesRepository.findOne({
      title: category,
    });

    if (!checkCategoryExist) {
      const createCategory = new CreateCategoryService();
      checkCategoryExist = await createCategory.execute({ title: category });
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        `should not be able to create outcome transaction without a valid balance`,
      );
    }

    const createTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: checkCategoryExist.id,
    });

    const transaction = transactionsRepository.save(createTransaction);

    return transaction;
  }
}

export default CreateTransactionService;
