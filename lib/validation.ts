import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Informe seu nome completo.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
});

export const newsletterSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});
