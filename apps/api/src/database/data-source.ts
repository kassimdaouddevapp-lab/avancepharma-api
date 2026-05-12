import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envFilePath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envFilePath });

const databaseUrl = process.env.DATABASE_URL;
const dbOptions = databaseUrl
  ? (() => {
      const url = new URL(databaseUrl);
      return {
        host: url.hostname,
        port: parseInt(url.port || '5432', 10),
        username: url.username,
        password: url.password,
        database: url.pathname.replace(/^\//, ''),
      };
    })()
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'avancepharma',
      username: process.env.DB_USER || 'avancepharma_user',
      password: process.env.DB_PASS || 'avancepharma_pass',
    };

const AppDataSource = new DataSource({
  type: 'postgres',
  ...dbOptions,
  entities: [path.join(__dirname, '../**/*.entity.ts')],
  migrations: [path.join(__dirname, './migrations/*.ts')],
  logging: true,
  synchronize: false,
});

// Export for CLI usage
export default AppDataSource;
