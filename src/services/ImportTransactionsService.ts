import { getCustomRepository, getRepository, In} from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}


class ImportTransactionsService {

  async execute(filePath: string): Promise<Transaction[]> {
    // TODO
    const transactionsReadStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    })

    const parseCSV = transactionsReadStream.pipe(parseStream);

    //const lines = [];

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category ] = line;

      if( !title || !type || !value ) {
        return
      }

      categories.push(category);
      transactions.push({ title, type, value, category });
      //lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      }
    });

    const existentCategoriesTitle = existentCategories.map((category: Category) => category.title);

    const addCategoryTitles = categories.filter(category => !existentCategoriesTitle.includes(category)).filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title=> ({title}))
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: finalCategories.find(category=>category.title == transaction.category)
        })
      )
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    console.log(existentCategoriesTitle);
    console.log(categories);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
