import { ActivityDefinition } from "@/lib/activity";
import { configSchema, ValidatedScraperConfig } from "@/lib/config";
import { getActivities } from "@/lib/get-activities";
import type { ScraperManifest } from "@leaderboard/core";
import { Octokit } from "octokit";

const manifest: ScraperManifest<ValidatedScraperConfig> = {
  // Validates the scraper config and returns a context with the authenticated
  // octokit client instance.
  async getValidatedConfig({ scraperConfig }) {
    const result = configSchema.safeParse(scraperConfig);
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return {
      ...result.data,
      octokit: new Octokit({
        auth: result.data.githubToken,
        userAgent: "leaderboard-github-scraper/1.0",
      }),
    };
  },

  // Defines the activity definitions managed by the github scraper.
  activityDefinitions: {
    [ActivityDefinition.COMMENTED]: {
      name: "Commented",
      description: "Commented on an Issue/PR",
      points: 0,
      icon: "message-circle",
    },
    [ActivityDefinition.ISSUE_ASSIGNED]: {
      name: "Issue Assigned",
      description: "Got an issue assigned",
      points: 1,
      icon: "user-round-check",
    },
    [ActivityDefinition.PR_REVIEWED]: {
      name: "PR Reviewed",
      description: "Reviewed a Pull Request",
      points: 2,
      icon: "eye",
    },
    [ActivityDefinition.ISSUE_OPENED]: {
      name: "Issue Opened",
      description: "Raised an Issue",
      points: 2,
      icon: "circle-dot",
    },
    [ActivityDefinition.PR_OPENED]: {
      name: "PR Opened",
      description: "Opened a Pull Request",
      points: 1,
      icon: "git-pull-request-create-arrow",
    },
    [ActivityDefinition.PR_MERGED]: {
      name: "PR Merged",
      description: "Merged a Pull Request",
      points: 7,
      icon: "git-merge",
    },
    [ActivityDefinition.PR_COLLABORATED]: {
      name: "PR Collaborated",
      description: "Collaborated on a Pull Request",
      points: 2,
      icon: null,
    },
    [ActivityDefinition.ISSUE_CLOSED]: {
      name: "Issue Closed",
      description: "Closed an Issue",
      points: 0,
      icon: null,
    },
    [ActivityDefinition.COMMITED]: {
      name: "Commit Created",
      description: "Pushed a commit",
      points: 0,
      icon: "git-commit-horizontal",
    },
  },

  // Gets the activities for the given repository.
  getActivities: getActivities,

  // Defines the global aggregate definitions.
  globalAggregateDefinitions: {
    stars_received: {
      name: "Stars",
      description: "Total number of stars received for all repositories",
      icon: "star",
      async getAggregates() {
        // TODO: Implement this
        return [{ type: "number", value: 0 }];
      },
    },

    total_forks: {
      name: "Forks",
      description: "Total number of forks created for all repositories",
      icon: "git-fork",
      async getAggregates() {
        // TODO: Implement this
        return [{ type: "number", value: 0 }];
      },
    },

    contributors_count: {
      name: "Contributors",
      description:
        "Total number of unique contributors that have contributed to any repository",
      icon: "globe",
      async getAggregates() {
        // TODO: Implement this
        return [{ type: "number", value: 0 }];
      },
    },
  },

  // Defines the contributor aggregate definitions.
  contributorAggregateDefinitions: {
    pr_merge_turn_around_time: {
      name: "PR Merge Turn-Around Time",
      description: "Statistic of the time taken to merge a pull request",
      icon: "git-merge",
      async getAggregates({ db }) {
        // TODO: Implement this

        const result = await db.query<{
          contributor: string;
          min: number;
          max: number;
          average: number;
          variance: number;
          count: number;
          sum: number;
        }>(`TODO: Implement this`);

        return result.rows.map((row) => ({
          contributor: row.contributor,
          type: "statistics/duration",
          min: row.min,
          max: row.max,
          average: row.average,
          variance: row.variance,
          count: row.count,
          sum: row.sum,
          highlightMetric: "mean",
        }));
      },
    },
  },

  // Defines the badge definitions.
  badgeDefinitions: {
    problem_solving: {
      slug: "problem_solving",
      name: "Problem Solving",
      description:
        "Awarded for consistently solving problems through merged PRs",
      variants: {
        "1x": {
          description: "Novice - 2 PRs merged",
          svg_url: "/badges/problem-solving-1x.svg",
          requirement: "Get 2 pull requests merged",
        },
        "2x": {
          description: "Intermediate - 16 PRs merged",
          svg_url: "/badges/problem-solving-2x.svg",
          requirement: "Get 16 pull requests merged",
        },
        "3x": {
          description: "Advanced - 128 PRs merged",
          svg_url: "/badges/problem-solving-3x.svg",
          requirement: "Get 128 pull requests merged",
        },
        "4x": {
          description: "Expert - 1024 PRs merged",
          svg_url: "/badges/problem-solving-4x.svg",
          requirement: "Get 1024 pull requests merged",
        },
        "5x": {
          description: "Master - 8192 PRs merged",
          svg_url: "/badges/problem-solving-5x.svg",
          requirement: "Get 8192 pull requests merged",
        },
      },
    },
  },
};

export default manifest;
