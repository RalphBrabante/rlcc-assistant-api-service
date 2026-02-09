const {
  buildCacheKey,
  getCachedJson,
  setCachedJson,
  invalidateResource,
} = require("../services/cacheService");

function cacheRead(resourceName) {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    const baseScope = req.originalUrl || req.url || "";
    const authUserId = res.locals?.user?.id;
    const scope = authUserId ? `${baseScope}::user:${authUserId}` : baseScope;
    const cacheKey = buildCacheKey(resourceName, scope);

    try {
      const cachedPayload = await getCachedJson(cacheKey);
      if (cachedPayload) {
        return res.send(cachedPayload);
      }

      const originalSend = res.send.bind(res);
      res.send = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          let payload = body;
          if (typeof body === "string") {
            try {
              payload = JSON.parse(body);
            } catch (error) {
              payload = body;
            }
          }

          setCachedJson(cacheKey, payload).catch((error) => {
            console.error("Cache set failed:", error.message);
          });
        }

        return originalSend(body);
      };

      return next();
    } catch (error) {
      return next();
    }
  };
}

function invalidateCache(resourceNames = []) {
  return (req, res, next) => {
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        Promise.all(resourceNames.map((resource) => invalidateResource(resource))).catch(
          (error) => {
            console.error("Cache invalidation failed:", error.message);
          }
        );
      }

      return originalSend(body);
    };

    next();
  };
}

module.exports = {
  cacheRead,
  invalidateCache,
};
