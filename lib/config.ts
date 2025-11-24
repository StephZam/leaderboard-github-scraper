import { Octokit } from "octokit";
import z from "zod";

export const configSchema = z
  .object({
    githubToken: z.string().min(1),
    githubOrg: z.string().min(1),
  })
  .strict();

export type ValidatedScraperConfig = z.infer<typeof configSchema> & {
  octokit: Octokit;
};
