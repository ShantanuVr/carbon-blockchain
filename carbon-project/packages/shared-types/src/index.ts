import { z } from 'zod';

// Auth
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.string(),
    orgId: z.string(),
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Projects
export const CreateProjectSchema = z.object({
  code: z.string(),
  type: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

// Evidence
export const EvidenceArtifactSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sha256: z.string(),
  bytes: z.number(),
  uri: z.string(),
  createdAt: z.date(),
});

export type EvidenceArtifact = z.infer<typeof EvidenceArtifactSchema>;

// Credit Classes
export const CreateClassSchema = z.object({
  projectId: z.string(),
  vintage: z.number().int().min(2000).max(2100),
  quantity: z.number().int().positive(),
});

export type CreateClassDto = z.infer<typeof CreateClassSchema>;

export const CreditClassSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  vintage: z.number(),
  quantity: z.number(),
  serialBase: z.number(),
  serialTop: z.number(),
  tokenId: z.number().nullable(),
  createdAt: z.date(),
});

export type CreditClass = z.infer<typeof CreditClassSchema>;

// Holdings
export const HoldingSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  classId: z.string(),
  quantity: z.number(),
  updatedAt: z.date(),
});

export type Holding = z.infer<typeof HoldingSchema>;

// Transfers
export const CreateTransferSchema = z.object({
  fromOrgId: z.string(),
  toOrgId: z.string(),
  classId: z.string(),
  quantity: z.number().int().positive(),
});

export type CreateTransferDto = z.infer<typeof CreateTransferSchema>;

export const TransferSchema = z.object({
  id: z.string(),
  fromOrgId: z.string(),
  toOrgId: z.string(),
  classId: z.string(),
  quantity: z.number(),
  createdAt: z.date(),
});

export type Transfer = z.infer<typeof TransferSchema>;

// Retirements
export const CreateRetirementSchema = z.object({
  orgId: z.string(),
  classId: z.string(),
  quantity: z.number().int().positive(),
  purposeHash: z.string(),
  beneficiaryHash: z.string(),
  walletAddress: z.string().optional(),
});

export type CreateRetirementDto = z.infer<typeof CreateRetirementSchema>;

export const RetirementSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  classId: z.string(),
  quantity: z.number(),
  serialStart: z.number(),
  serialEnd: z.number(),
  purposeHash: z.string(),
  beneficiaryHash: z.string(),
  certificateId: z.string(),
  chainBurnTx: z.string().nullable(),
  createdAt: z.date(),
});

export type Retirement = z.infer<typeof RetirementSchema>;

// Chain operations
export const MintRequestSchema = z.object({
  classId: z.string(),
  toAddress: z.string().optional(),
  amount: z.number().int().positive().optional(),
});

export type MintRequest = z.infer<typeof MintRequestSchema>;

export const BurnRequestSchema = z.object({
  classId: z.string(),
  amount: z.number().int().positive(),
  fromWallet: z.string().optional(),
});

export type BurnRequest = z.infer<typeof BurnRequestSchema>;

export const AnchorRequestSchema = z.object({
  hash: z.string(),
  uri: z.string(),
});

export type AnchorRequest = z.infer<typeof AnchorRequestSchema>;

// Explorer
export const ExplorerCreditsSchema = z.object({
  projects: z.array(z.any()),
  classes: z.array(CreditClassSchema),
  retirements: z.array(RetirementSchema),
});

export type ExplorerCredits = z.infer<typeof ExplorerCreditsSchema>;

export const ExplorerTokensSchema = z.object({
  tokens: z.array(z.object({
    tokenId: z.number(),
    classId: z.string(),
    totalSupply: z.number(),
    mints: z.array(z.any()),
  })),
});

export type ExplorerTokens = z.infer<typeof ExplorerTokensSchema>;

export const ExplorerAnchorsSchema = z.object({
  anchors: z.array(z.object({
    hash: z.string(),
    uri: z.string(),
    txHash: z.string().nullable(),
    createdAt: z.date(),
  })),
});

export type ExplorerAnchors = z.infer<typeof ExplorerAnchorsSchema>;

// Health
export const HealthSchema = z.object({
  ok: z.boolean(),
  services: z.object({
    db: z.boolean(),
    chain: z.boolean(),
    ipfs: z.boolean().optional(),
  }).optional(),
});

export type Health = z.infer<typeof HealthSchema>;

