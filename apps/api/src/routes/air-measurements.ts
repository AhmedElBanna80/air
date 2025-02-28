import { Hono } from 'hono';
import { z } from 'zod';
import { Validator } from '../lib/validator';


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

const app = new Hono<{ Bindings: { 
} }>()

// GET endpoint with query validation
app.get(
  '/air-measurements',
  Validator('query', querySchema),
  (c) => {
    const { from, to, groupBy, limit } = c.req.valid('query')
    // Implement your measurement logic here
    return c.json({
      success: true,
      data: {
        from,
        to,
        groupBy,
        limit,
        measurements: [] // Add actual measurements
      }
    })
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