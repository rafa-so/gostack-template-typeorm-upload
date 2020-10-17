import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

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
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    let currentCategory: Category | undefined;

    currentCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    const { total } = await transactionRepository.getBalance();

    // if (type === 'outcome' && value > total) {
    //   throw new AppError("You aren't able to outcome value this transaction");
    // }

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
