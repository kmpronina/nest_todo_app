import 'dotenv/config';
import { Task } from '../tasks/task.entity';
import { DataSource } from 'typeorm';

const base = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

export default new DataSource({
  ...base,
  entities: [Task],
  migrations: ['src/migrations/*{.ts, .js }'],
  synchronize: false,
});
