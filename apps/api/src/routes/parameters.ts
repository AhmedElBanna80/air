import { Hono } from "hono";
import { z } from "zod";

import { Validator } from "../lib/validator";
import { inject } from "../middlewares/middleware";
import { ParametersRepo } from "../repositories/parameters";

// Define schemas
const paramIdSchema = z.object({
  id: z.string().transform(val => Number.parseInt(val, 10)),
});

const paramNameSchema = z.object({
  name: z.string(),
});

const app = new Hono();

// GET all parameters
app.get("/", async (c) => {
  try {
    const repo = inject(c, ParametersRepo);
    const parameters = await repo.getAllParameters();

    return c.json({
      success: true,
      data: parameters,
    });
  }
  catch (error) {
    console.error("Error fetching parameters:", error);
    return c.json({
      success: false,
      error: "Failed to fetch parameters",
    }, 500);
  }
});

// GET parameter by ID
app.get("/id/:id", Validator("param", paramIdSchema), async (c) => {
  const { id } = c.req.valid("param");

  try {
    const repo = inject(c, ParametersRepo);
    const parameter = await repo.getParameterById(id);

    if (!parameter) {
      return c.json({
        success: false,
        error: `Parameter with ID ${id} not found`,
      }, 404);
    }

    return c.json({
      success: true,
      data: parameter,
    });
  }
  catch (error) {
    console.error(`Error fetching parameter with ID ${id}:`, error);
    return c.json({
      success: false,
      error: "Failed to fetch parameter",
    }, 500);
  }
});

// GET parameter by name
app.get("/name/:name", Validator("param", paramNameSchema), async (c) => {
  const { name } = c.req.valid("param");

  try {
    const repo = inject(c, ParametersRepo);
    const parameter = await repo.getParameterByName(name);

    if (!parameter) {
      return c.json({
        success: false,
        error: `Parameter with name '${name}' not found`,
      }, 404);
    }

    return c.json({
      success: true,
      data: parameter,
    });
  }
  catch (error) {
    console.error(`Error fetching parameter with name '${name}':`, error);
    return c.json({
      success: false,
      error: "Failed to fetch parameter",
    }, 500);
  }
});

export default app;
