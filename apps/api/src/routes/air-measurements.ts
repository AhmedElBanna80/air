import { Hono } from 'hono';
import { stream, } from 'hono/streaming';
import * as ndjson from 'ndjson';
import { Transform } from 'stream';
import { z } from 'zod';
import { Validator } from '../lib/validator';
import { inject } from '../middlewares/middleware';
import { AiQualityRepo } from '../repositories';


// Define schemas
export const bucketWidthEnum = z.enum([
  "microsecond",
  "millisecond",
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
  "decade",
  "century",
]);

export type BucketWidth = z.infer<typeof bucketWidthEnum>;

const querySchema = z.object({
  from: z.string().transform(val => new Date(val)),
  to: z.string().transform(val => new Date(val)),
  groupBy: bucketWidthEnum,
  limit: z
    .string()
    .transform(val => Number.parseInt(val, 10))
    .pipe(z.number().min(1).max(10000))
    .optional(),
});
const uploadSchema = z.object({
  file: z.custom<File>(val => val instanceof File),
});

const app = new Hono<{
  Bindings: {
  }
}>()




// GET endpoint with query validation
app.get(
  '/air-measurements',
  Validator('query', querySchema),
  async (c) => {
    const { from, to, groupBy, limit } = c.req.valid('query')
    const db = inject(c, AiQualityRepo)
    
    // Set content type to NDJSON
    c.header('Content-Type', 'application/x-ndjson');
    
    return stream(c, async (honoStream) => {
      try {
        const dbStream = await db.queryByTimeRange(from, to, groupBy, limit);
        for (const row of dbStream) {
          honoStream.write(JSON.stringify(row) + '\n');
        }
        honoStream.close();
      } catch (err) {
        console.error('Stream setup error:', err);
        honoStream.write(JSON.stringify({ error: 'Stream error' }) + '\n');
        honoStream.close();
      }
    });
  }
)

// POST endpoint for file upload
app.post(
  '/air-measurements',
  async (c) => {
    const formData = await c.req.formData()
    const file = formData.get('file')

    // Validate upload
    const result = uploadSchema.safeParse({ file })
    if (!result.success) {
      return c.json({ error: 'Invalid file upload' }, 400)
    }

    // Handle file storage (example using Cloudflare R2)
    try {
      return c.json({
        success: true,
        message: 'File uploaded successfully'
      })
    } catch (error) {
      return c.json({
        error: 'File upload failed'
      }, 500)
    }
  }
)


export type AppType = typeof app
export default app 