import { z } from "zod";

export const filterSchema = z.object( {
	name: z.string().optional(),
	sortBy: z.object( {
		by: z.string(),
		up: z.boolean()
	} ).optional(),
	tags: z.array( z.string() ).optional(),
	mods: z.array( z.string() ).optional(),
	onlyVanilla: z.boolean().optional()
} );

export const PanelConfigSchema = z.object( {
	BackupEnabled: z.boolean(),
	MaxBackupfolderSize: z.number(),
	BackupInterval: z.number(),
	AutoUpdateParameters: z.array( z.string() ),
	AutoUpdateEnabled: z.boolean(),
	AutoUpdateInterval: z.number()
} );

export type FilterSchema = z.infer<typeof filterSchema>;