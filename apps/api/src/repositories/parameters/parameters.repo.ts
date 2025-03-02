import { inject, Injectable } from "di-wise";
import { eq } from "drizzle-orm";

import { DataBase } from "@/api/services/db/database.provider";
import { parameters } from "@/api/services/db/schema/parameters";

import type { ParameterData, ParameterRepositoryType } from "./parameters.types";

import { LoggerToken } from "../../services/logger/logger.types";
import { ParametersRepo } from "./parameters.types";

@Injectable<ParametersRepository>(ParametersRepo)
export class ParametersRepository implements ParameterRepositoryType {
  private readonly db = inject(DataBase);
  private readonly logger = inject(LoggerToken);

  async getAllParameters(): Promise<ParameterData[]> {
    try {
      return await this.db.select().from(parameters);
    }
    catch (error) {
      this.logger.error("Error fetching parameters:", error);
      throw error;
    }
  }

  async getParameterByName(name: string): Promise<ParameterData | undefined> {
    try {
      const result = await this.db
        .select()
        .from(parameters)
        .where(eq(parameters.name, name));

      return result[0];
    }
    catch (error) {
      this.logger.error(`Error fetching parameter by name ${name}:`, error);
      throw error;
    }
  }

  async getParameterById(id: number): Promise<ParameterData | undefined> {
    try {
      const result = await this.db
        .select()
        .from(parameters)
        .where(eq(parameters.id, id));

      return result[0];
    }
    catch (error) {
      this.logger.error(`Error fetching parameter by id ${id}:`, error);
      throw error;
    }
  }
}
