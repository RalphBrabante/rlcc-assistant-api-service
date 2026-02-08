"use strict";

const axios = require("axios");

const PCO_BASE_URL = "https://api.planningcenteronline.com";
const MAX_PCO_PAGE_CYCLE = 5000;
const DEFAULT_PREVIEW_LIMIT = 50;
const MAX_PREVIEW_LIMIT = 200;

function getPcoAuthConfig() {
  return {
    auth: {
      username: process.env.PCO_USERNAME,
      password: process.env.PCO_PASSWORD,
    },
  };
}

function normalizePcoLink(link) {
  if (!link) return null;
  if (link.startsWith("http://") || link.startsWith("https://")) return link;
  return `${PCO_BASE_URL}${link}`;
}

async function iteratePcoUsersByPage(initialUrl, onUsers) {
  let nextUrl = initialUrl;
  let cycleCount = 0;
  let total = 0;

  while (nextUrl) {
    cycleCount += 1;
    if (cycleCount > MAX_PCO_PAGE_CYCLE) {
      throw new Error("PCO pagination exceeded allowed cycle count.");
    }

    const response = await axios.get(nextUrl, getPcoAuthConfig());
    const users = Array.isArray(response?.data?.data) ? response.data.data : [];
    total += users.length;

    if (typeof onUsers === "function") {
      await onUsers(users);
    }

    nextUrl = normalizePcoLink(response?.data?.links?.next || null);
  }

  return total;
}

async function getPcoUsersByLastName(lastName) {
  const users = [];
  const url = `${PCO_BASE_URL}/people/v2/people?where[last_name]=${encodeURIComponent(
    lastName
  )}`;
  await iteratePcoUsersByPage(url, (pageUsers) => users.push(...pageUsers));
  return users;
}

async function queuePcoUsersFromUrl(req, url) {
  req.amqp.channel.assertQueue("usersMigrationQueue");

  return iteratePcoUsersByPage(url, async (users) => {
    for (const user of users) {
      req.amqp.channel.sendToQueue(
        "usersMigrationQueue",
        Buffer.from(JSON.stringify(user)),
        {
          persistent: true,
        }
      );
    }
  });
}

function normalizePositiveInt(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

async function previewPcoUsersFromUrl(url, page = 1, limit = DEFAULT_PREVIEW_LIMIT) {
  const users = [];
  const safePage = normalizePositiveInt(page, 1);
  const safeLimit = normalizePositiveInt(limit, DEFAULT_PREVIEW_LIMIT, MAX_PREVIEW_LIMIT);
  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;
  let total = 0;

  await iteratePcoUsersByPage(url, async (pageUsers) => {
    for (const user of pageUsers) {
      if (total >= startIndex && total < endIndex) {
        users.push(user);
      }
      total += 1;
    }
  });

  return {
    users,
    count: total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.preview = async (req, res, next) => {
  const { lastName } = req.query;
  const { page, limit } = req.query;

  if (!lastName) {
    return next({
      status: 401,
      message: "Last name query is required.",
    });
  }

  try {
    const url = `${PCO_BASE_URL}/people/v2/people?where[last_name]=${encodeURIComponent(
      lastName
    )}`;
    const preview = await previewPcoUsersFromUrl(url, page, limit);

    res.send({
      status: 200,
      message: "Users preview fetched.",
      data: {
        ...preview,
      },
    });
  } catch (error) {
    return next({
      status: 520,
      message: error.message,
    });
  }
};

module.exports.previewAll = async (req, res, next) => {
  const { page, limit } = req.query;

  try {
    const preview = await previewPcoUsersFromUrl(
      `${PCO_BASE_URL}/people/v2/people`,
      page,
      limit
    );

    res.send({
      status: 200,
      message: "All users preview fetched.",
      data: {
        ...preview,
      },
    });
  } catch (error) {
    return next({
      status: 520,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { lastName } = req.query;

  if (!lastName) {
    return next({
      status: 401,
      message: "Last name query is required.",
    });
  }

  try {
    const url = `${PCO_BASE_URL}/people/v2/people?where[last_name]=${encodeURIComponent(
      lastName
    )}`;
    const total = await queuePcoUsersFromUrl(req, url);

    res.send({
      status: 200,
      message: "Users added to queue.",
      data: {
        count: total,
      },
    });
  } catch (error) {
    return next({
      status: 520,
      message: error.message,
    });
  }
};

module.exports.invokeAll = async (req, res, next) => {
  try {
    const total = await queuePcoUsersFromUrl(req, `${PCO_BASE_URL}/people/v2/people`);

    res.send({
      status: 200,
      message: "All PCO users added to queue.",
      data: {
        count: total,
      },
    });
  } catch (error) {
    return next({
      status: 520,
      message: error.message,
    });
  }
};
