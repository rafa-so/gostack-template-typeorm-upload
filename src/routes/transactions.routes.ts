import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactions = getCustomRepository(TransactionsRepository);

  const balance = await transactions.getBalance();

  return response.status(200).json({
    transactions: await transactions.find(),
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  try {
    const createTransaction = new CreateTransactionService();
    const transactionSubcribed = await createTransaction.execute({
      title,
      value,
      type,
      category,
    });

    return response.status(200).json(transactionSubcribed);
  } catch (err) {
    return response.status(err.statusCode).json(err);
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    await new DeleteTransactionService().execute(request.params.id);

    return response.status(204).send();
  } catch (err) {
    return response.status(500).json({ error: err.message });
  }
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
