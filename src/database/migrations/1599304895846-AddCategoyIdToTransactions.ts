import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export default class AddCategoyIdToTransactions1599304895846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'category_id',
          type: 'uuid',
        })
      );

      await queryRunner.createForeignKey(
        'transactions',
        new TableForeignKey({
          name: 'TransactionCategory',
          columnNames: ['category_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'categories',
          onDelete: 'SET NULL',  // In case of deleting Category, Transaction will be set to NULL
          onUpdate: 'CASCADE'
        })
      )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.dropForeignKey('transactions', 'TransactionCategory');

      await queryRunner.dropColumn('transactions', 'category_id');
    }

}
