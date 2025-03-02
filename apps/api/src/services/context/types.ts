import { Type, Container } from 'di-wise';
import type env from '@/api/env'
import { DataBaseType } from '../db/database.provider';
import { ContextService } from './context.service';

export type ContextType = {
      env: typeof env;
      dataBase: DataBaseType,
};

export type AppEnv = {
  Variables: ContextType & {
    container: Container
  }
}

export const ContextToken = Type<ContextType>('Context')

export function registerContext(container: Container) {
  container.register(ContextToken, {
    useClass: ContextService,
  })
}