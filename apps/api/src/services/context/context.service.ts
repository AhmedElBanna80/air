import { inject, Injectable, Scope, Scoped } from 'di-wise';
import { DataBase } from '../db/database.provider';
import env from '@/api/env';
import { ContextToken, ContextType } from './types';


@Injectable<ContextService>(ContextToken)
@Scoped(Scope.Transient)
export class ContextService implements ContextType {
    public env = env
    public dataBase = inject(DataBase)

}