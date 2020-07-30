import csv from 'csv-parse';
import fs from 'fs';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionInterface {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public categoryRepository = getRepository(Category);

  public transactions: Transaction[] = [];

  async execute(fileImported: string): Promise<Transaction[]> {
    const csvReadedLines: TransactionInterface[] = [];

    const parseCSV = fs
      .createReadStream(`./tmp/${fileImported}`)
      .pipe(csv({ from_line: 2 }));

    parseCSV.on('data', async row => {
      const [title, type, value, category] = row.map((elem: string) =>
        elem.trim(),
      );

      const lineReaded: TransactionInterface = {
        title,
        type,
        value,
        category,
      };

      csvReadedLines.push(lineReaded);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    this.transactions = await Promise.all(
      csvReadedLines.map(
        async (line): Promise<Transaction> => {
          const { title, type, value, category } = line;

          const cat = await this.findCategory(category.trim());
          const transaction = new Transaction(title, type, value, cat);

          return transaction;
        },
      ),
    );

    const transactionRepository = getRepository(Transaction);

    const batch = transactionRepository.create(this.transactions);
    await transactionRepository.save(batch);

    return this.transactions;
  }

  private async findCategory(title: string): Promise<Category> {
    let category: Category | undefined;

    category = await this.categoryRepository.findOne({
      where: { title },
    });

    if (!category) {
      category = await this.createCategory(title);
    }

    return category;
  }

  private async createCategory(title: string): Promise<Category> {
    const newCategory = this.categoryRepository.create({
      title,
    });

    await this.categoryRepository.save(newCategory);

    return newCategory;
  }
}

export default ImportTransactionsService;
