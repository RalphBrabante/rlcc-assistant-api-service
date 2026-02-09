const { Group, GroupType } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const name = String(req.body?.group?.name || "").trim();
  const groupTypeId = Number(req.body?.group?.groupTypeId);

  if (!name) {
    return next({
      status: 400,
      message: "Circle name is required.",
    });
  }

  if (!Number.isInteger(groupTypeId) || groupTypeId < 1) {
    return next({
      status: 400,
      message: "Circle type is required.",
    });
  }

  try {
    const groupType = await GroupType.findByPk(groupTypeId, { attributes: ["id"] });
    if (!groupType) {
      return next({
        status: 400,
        message: "Selected circle type does not exist.",
      });
    }

    res.locals.groupPayload = { name, groupTypeId };
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { group } = req.body;

  const { user } = res.locals;
  const { groupPayload } = res.locals;

  try {
    const newGroup = await Group.create({
      name: groupPayload?.name || group.name,
      userId: user.id,
      groupTypeId: groupPayload?.groupTypeId || group.groupTypeId,
    });

    res.send({
      status: 200,
      group: newGroup,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
