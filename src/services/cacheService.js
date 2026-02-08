const { createClient } = require("redis");

const REDIS_ENABLED = process.env.REDIS_ENABLED !== "false";
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 120);

let redisClient;

function buildRedisClient() {
  if (!REDIS_ENABLED) return null;

  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST || "rlcc-assistant-redis-service";
  const redisPort = Number(process.env.REDIS_PORT || 6379);
  const redisPassword = process.env.REDIS_PASSWORD;

  if (redisUrl) {
    redisClient = createClient({ url: redisUrl });
  } else {
    redisClient = createClient({
      socket: {
        host: redisHost,
        port: redisPort,
      },
      password: redisPassword || undefined,
    });
  }

  redisClient.on("error", (err) => {
    console.error("Redis error:", err.message);
  });

  return redisClient;
}

async function getClient() {
  const client = buildRedisClient();
  if (!client) return null;

  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (error) {
      console.error("Redis connect failed:", error.message);
      return null;
    }
  }

  return client;
}

function buildCacheKey(resourceName, scope) {
  return `cache:${resourceName}:${scope}`;
}

async function getCachedJson(cacheKey) {
  const client = await getClient();
  if (!client) return null;

  const value = await client.get(cacheKey);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

async function setCachedJson(cacheKey, payload, ttlSeconds = CACHE_TTL_SECONDS) {
  const client = await getClient();
  if (!client) return;

  await client.set(cacheKey, JSON.stringify(payload), { EX: ttlSeconds });
}

async function invalidateByPrefix(prefix) {
  const client = await getClient();
  if (!client) return 0;

  const keys = [];
  for await (const key of client.scanIterator({
    MATCH: `${prefix}*`,
    COUNT: 200,
  })) {
    keys.push(key);
  }

  if (!keys.length) return 0;

  return client.del(keys);
}

async function invalidateResource(resourceName) {
  return invalidateByPrefix(`cache:${resourceName}:`);
}

module.exports = {
  buildCacheKey,
  getCachedJson,
  setCachedJson,
  invalidateResource,
};
