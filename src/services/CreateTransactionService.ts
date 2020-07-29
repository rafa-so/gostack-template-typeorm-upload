// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionObject {
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
  }: TransactionObject): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    let currentCategory: Category | undefined;

    currentCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!currentCategory) {
      currentCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(currentCategory);
    }

    const transactionCreated = transactionRepository.create({
      title,
      value,
      type,
      category: currentCategory,
    });

    await transactionRepository.save(transactionCreated);

    return transactionCreated;
  }
}

export default CreateTransactionService;
