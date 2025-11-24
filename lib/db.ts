import { PGlite } from "@electric-sql/pglite";

/**
 * Batch an array into smaller arrays of a given size
 * @param array - The array to batch
 * @param batchSize - The size of each batch
 * @returns An array of arrays
 */
function batchArray<T>(array: T[], batchSize: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
}

function getSqlPositionalParamPlaceholders(length: number, cols: number) {
  // $1, $2, $3, $4, $5, $6, $7, $8, $9, ...
  const params = Array.from({ length: length * cols }, (_, i) => `$${i + 1}`);

  // ($1, $2, $3), ($4, $5, $6), ($7, $8, $9), ...
  return batchArray(params, cols)
    .map((p) => `\n        (${p.join(", ")})`)
    .join(", ");
}

export async function addNewContributors(db: PGlite, contributors: string[]) {
  // Remove duplicates from the array
  contributors = [...new Set(contributors)];

  // Query for existing contributors and remove them from the array
  const existingContributors = await db.query<{ username: string }>(
    `SELECT username FROM contributor`
  );
  const existingContributorUsernames = new Set(
    existingContributors.rows.map((c) => c.username)
  );

  // Filter out existing contributors
  contributors = contributors.filter(
    (c) => !existingContributorUsernames.has(c)
  );

  // Add new contributors
  for (const batch of batchArray(contributors, 1000)) {
    const result = await db.query(
      `
      INSERT INTO contributor (username, avatar_url, social_profiles)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 3)}
      ON CONFLICT (username) DO NOTHING;
    `,
      batch.flatMap((c) => [
        c,
        `https://avatars.githubusercontent.com/${c}`,
        JSON.stringify({ github: `https://github.com/${c}` }),
      ])
    );

    console.log(
      `Added ${result.affectedRows}/${batch.length} new contributors`
    );
  }
}

/**
 * Update the role of bot contributors to 'bot'
 * @param botUsernames - Array of bot usernames to update
 */
export async function updateBotRoles(db: PGlite, botUsernames: string[]) {
  if (botUsernames.length === 0) {
    console.log("No bot users to update");
    return;
  }

  // Remove duplicates
  const uniqueBotUsernames = [...new Set(botUsernames)];

  for (const batch of batchArray(uniqueBotUsernames, 1000)) {
    const placeholders = batch.map((_, i) => `$${i + 1}`).join(", ");
    const result = await db.query(
      `
      UPDATE contributor
      SET role = 'bot'
      WHERE username IN (${placeholders});
    `,
      batch
    );

    console.log(
      `Updated ${result.affectedRows}/${batch.length} bot contributors`
    );
  }
}
