import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PREFIX = "VITE_";
const SUPABASE_ENV_PREFIX = "SUPABASE_";
const MISSING_TABLE_ERROR_CODE = "PGRST205";
const SCHEMA_PATH = resolve(process.cwd(), "supabase/schema.sql");
const SCHEMA_CACHE_RETRIES = 6;
const SCHEMA_CACHE_RETRY_DELAY_MS = 1500;

function getMode() {
  const modeFlagIndex = process.argv.indexOf("--mode");
  if (modeFlagIndex !== -1) {
    return process.argv[modeFlagIndex + 1] || "development";
  }

  const inlineModeArg = process.argv.find((arg) => arg.startsWith("--mode="));
  if (inlineModeArg) {
    return inlineModeArg.slice("--mode=".length) || "development";
  }

  return process.env.NODE_ENV === "production" ? "production" : "development";
}

function parseEnvFile(path) {
  try {
    const contents = readFileSync(path, "utf8");

    return contents.split(/\r?\n/).reduce((env, rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        return env;
      }

      const equalsIndex = line.indexOf("=");
      if (equalsIndex === -1) {
        return env;
      }

      const key = line.slice(0, equalsIndex).trim();
      let value = line.slice(equalsIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
      return env;
    }, {});
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

function loadViteEnv(mode) {
  const root = process.cwd();
  const envFiles = [
    ".env",
    ".env.local",
    `.env.${mode}`,
    `.env.${mode}.local`,
  ];

  const fileEnv = envFiles.reduce(
    (env, fileName) => ({
      ...env,
      ...parseEnvFile(resolve(root, fileName)),
    }),
    {},
  );

  return Object.entries(process.env).reduce((env, [key, value]) => {
    if (key.startsWith(ENV_PREFIX) || key.startsWith(SUPABASE_ENV_PREFIX)) {
      env[key] = value;
    }

    return env;
  }, fileEnv);
}

function requireEnv(env, key) {
  const value = env[key];
  if (!value) {
    throw new Error(
      `Supabase preflight failed: missing ${key}. Add it to .env.local or the selected mode env file.`,
    );
  }

  return value;
}

function validateSupabaseUrl(url) {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.protocol.startsWith("http")) {
      throw new Error("URL must use http or https");
    }
  } catch (error) {
    throw new Error(`Supabase preflight failed: VITE_SUPABASE_URL is invalid. ${error.message}`);
  }
}

function describeFetchError(error) {
  const details = [error.message];
  const cause = error.cause;

  if (cause?.code) {
    details.push(`code=${cause.code}`);
  }

  if (cause?.hostname) {
    details.push(`host=${cause.hostname}`);
  }

  if (cause?.syscall) {
    details.push(`syscall=${cause.syscall}`);
  }

  return details.join(" ");
}

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

async function readResponseText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function buildFranchisesEndpoint(supabaseUrl) {
  const endpoint = new URL("/rest/v1/franchises", supabaseUrl);
  endpoint.searchParams.set("select", "id");
  endpoint.searchParams.set("limit", "1");
  return endpoint;
}

async function queryFranchises(supabaseUrl, supabaseAnonKey) {
  const endpoint = buildFranchisesEndpoint(supabaseUrl);

  let response;
  try {
    response = await fetch(endpoint, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
  } catch (error) {
    throw new Error(
      `Supabase preflight failed: network request to ${endpoint.origin} failed. ${describeFetchError(error)}`,
    );
  }

  const body = await readResponseText(response);

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body,
    json: parseJson(body),
  };
}

function isMissingFranchisesTable(result) {
  return result.status === 404 && result.json?.code === MISSING_TABLE_ERROR_CODE;
}

function formatQueryFailure(result) {
  const body = result.body ? ` Response: ${result.body}` : "";
  return `Supabase preflight failed: could not query public.franchises. HTTP ${result.status} ${result.statusText}.${body}`.trim();
}

function getManagementAccessToken(env) {
  return env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_MANAGEMENT_ACCESS_TOKEN;
}

function getProjectRef(env, supabaseUrl) {
  if (env.SUPABASE_PROJECT_REF) {
    return env.SUPABASE_PROJECT_REF;
  }

  const hostname = new URL(supabaseUrl).hostname;
  const supabaseHostnameSuffix = ".supabase.co";

  if (hostname.endsWith(supabaseHostnameSuffix)) {
    const projectRef = hostname.slice(0, -supabaseHostnameSuffix.length);
    if (projectRef) {
      return projectRef;
    }
  }

  throw new Error(
    "Supabase preflight failed: could not infer SUPABASE_PROJECT_REF from VITE_SUPABASE_URL. Add SUPABASE_PROJECT_REF to .env.local.",
  );
}

async function applySchema(env, supabaseUrl) {
  const accessToken = getManagementAccessToken(env);

  if (!accessToken) {
    throw new Error(
      [
        "Supabase preflight found that public.franchises does not exist, but it cannot create tables with VITE_SUPABASE_ANON_KEY.",
        "Add SUPABASE_ACCESS_TOKEN to .env.local to let this script apply supabase/schema.sql automatically.",
        "Use a Supabase personal access token or fine-grained token with database_write access. Do not prefix it with VITE_.",
      ].join(" "),
    );
  }

  const projectRef = getProjectRef(env, supabaseUrl);
  const schemaSql = readFileSync(SCHEMA_PATH, "utf8");
  const endpoint = `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}/database/query`;

  console.log(`public.franchises is missing. Applying supabase/schema.sql to Supabase project ${projectRef}...`);

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: schemaSql,
        read_only: false,
      }),
    });
  } catch (error) {
    throw new Error(
      `Supabase preflight failed: network request to Supabase Management API failed. ${describeFetchError(error)}`,
    );
  }

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(
      `Supabase preflight failed: could not apply supabase/schema.sql. HTTP ${response.status} ${response.statusText}. ${body ? `Response: ${body}` : ""}`.trim(),
    );
  }

  console.log("Supabase schema applied from supabase/schema.sql.");
}

async function waitForFranchisesTable(supabaseUrl, supabaseAnonKey) {
  let lastResult;

  for (let attempt = 1; attempt <= SCHEMA_CACHE_RETRIES; attempt += 1) {
    lastResult = await queryFranchises(supabaseUrl, supabaseAnonKey);
    if (lastResult.ok) {
      return;
    }

    if (!isMissingFranchisesTable(lastResult)) {
      throw new Error(formatQueryFailure(lastResult));
    }

    if (attempt < SCHEMA_CACHE_RETRIES) {
      await sleep(SCHEMA_CACHE_RETRY_DELAY_MS);
    }
  }

  throw new Error(
    [
      "Supabase schema was applied, but the REST API still cannot find public.franchises.",
      "Supabase may still be refreshing its schema cache; wait a few seconds and rerun the command.",
      lastResult ? formatQueryFailure(lastResult) : "",
    ].filter(Boolean).join(" "),
  );
}

async function main() {
  const mode = getMode();
  const env = loadViteEnv(mode);
  const supabaseUrl = requireEnv(env, "VITE_SUPABASE_URL");
  const supabaseAnonKey = requireEnv(env, "VITE_SUPABASE_ANON_KEY");

  validateSupabaseUrl(supabaseUrl);

  const result = await queryFranchises(supabaseUrl, supabaseAnonKey);
  if (result.ok) {
    console.log(`Supabase preflight passed for ${supabaseUrl} (${mode} mode).`);
    return;
  }

  if (!isMissingFranchisesTable(result)) {
    throw new Error(formatQueryFailure(result));
  }

  await applySchema(env, supabaseUrl);
  await waitForFranchisesTable(supabaseUrl, supabaseAnonKey);

  console.log(`Supabase preflight passed for ${supabaseUrl} (${mode} mode).`);
}

main().catch((error) => {
  throw error;
});
