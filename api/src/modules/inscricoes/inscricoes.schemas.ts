import { StatusInscricao } from "@prisma/client";
import { z } from "zod";

export const createInscricaoSchema = z.object({
  alunoId: z.string().uuid("O ID do aluno deve ser um UUID válido."),
  cursoId: z.string().uuid("O ID do curso deve ser um UUID válido."),
  status: z.nativeEnum(StatusInscricao).default(StatusInscricao.PENDENTE),
});

export const updateInscricaoSchema = z.object({
  status: z.nativeEnum(StatusInscricao).optional(),
  concluidoEm: z.string().datetime().nullable().optional(),
});

export type CreateInscricaoInput = z.infer<typeof createInscricaoSchema>;
export type UpdateInscricaoInput = z.infer<typeof updateInscricaoSchema>;
