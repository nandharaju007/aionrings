import { z } from 'zod';
const field = (max: number) => z.string().trim().min(1, 'Please complete your delivery address.').max(max).regex(/^[^\u0000-\u001f\u007f<>]+$/, 'Please use plain text.');
export const kitAddressSchema = z.object({
  name: field(100), address: field(200), city: field(100),
  region: z.string().trim().max(100).regex(/^[^\u0000-\u001f\u007f<>]*$/).default(''),
  postcode: field(30), country: field(100),
}).strict();