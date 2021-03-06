import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomeTransactions = transactions.filter(
      transaction => transaction.type === 'income',
    );

    const listIncomeTransactions = incomeTransactions.map(transaction =>
      parseInt(`${transaction.value}`, 10),
    );

    const incomeTransactionsReduced = listIncomeTransactions.reduce(
      (increase, value) => {
        increase += value;
        return increase;
      },
      0,
    );

    const outcomeTransactions = transactions.filter(
      transaction => transaction.type === 'outcome',
    );

    const listOutcomeTransactions = outcomeTransactions.map(transaction =>
      parseInt(`${transaction.value}`, 10),
    );

    const outcomeTransactionsReduced = listOutcomeTransactions.reduce(
      (increase, value) => {
        increase += value;
        return increase;
      },
      0,
    );

    const total = incomeTransactionsReduced - outcomeTransactionsReduced;

    const balance = {
      income: incomeTransactionsReduced,
      outcome: outcomeTransactionsReduced,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
