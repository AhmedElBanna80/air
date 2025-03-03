import type { Container } from "di-wise";

import { Scope, Type } from "di-wise";

import { ParametersRepository } from ".";

export type ParameterData = {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  unit: string;
  min_safe_value: number | null;
  max_safe_value: number | null;
};

export type ParameterRepositoryType = {
  getAllParameters: () => Promise<ParameterData[]>;
  getParameterByName: (name: string) => Promise<ParameterData | undefined>;
  getParameterById: (id: number) => Promise<ParameterData | undefined>;
};

export const ParametersRepo = Type<ParameterRepositoryType>("ParametersRepository");

export function registerParametersRepo(container: Container) {
  container.register(ParametersRepo, {
    useClass: ParametersRepository,
  }, { scope: Scope.Container });
}
