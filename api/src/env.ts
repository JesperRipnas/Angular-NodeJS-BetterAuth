import { config } from 'dotenv';
import path from 'node:path';

const cwd = process.cwd();

config({ path: path.resolve(cwd, '.env') });
config({ path: path.resolve(cwd, '..', '.env') });
