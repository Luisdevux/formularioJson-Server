import { z } from 'zod';

const UsuarioSchema = z.object({
    nome: z.string().min(1, "Campo nome é obrigatório"),
    email: z.string().min(1, "Campo e-mail é obrigatório").email("Formato de e-mail inválido"),
    cep: z.string().min(1, "Campo cep é obrigatório").max(9, "Adicione um cep válido"),
    logradouro: z.string().min(1, "Campo logradouro é obrigatório"),
    numero: z.string().min(1, "Campo número é obrigatório"),
    bairro: z.string().min(1, "Campo bairro é obrigatório"),
    estado: z.string().min(1, "Campo estado é obrigatório"),
    cidade: z.string().min(1, "Campo cidade é obrigatório"),
    curso: z.string().min(1, "Campo curso é obrigatório"),
});

export { UsuarioSchema };