import { inject, Injectable, Scope, Scoped } from "di-wise";

import env from "@/api/env";

import type { ContextType } from "./types";

import { DataBase } from "../db/database.provider";
import { ContextToken } from "./types";

@Injectable<ContextService>(ContextToken)
@Scoped(Scope.Transient)
export class ContextService implements ContextType {
  public env = env;
  public dataBase = inject(DataBase);
}
