import type { AppType } from '@/api/src';

import { hc } from "hono/client";

export const client = hc<AppType>("http://localhost:3000/api");
