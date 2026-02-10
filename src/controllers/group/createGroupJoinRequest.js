'use strict';

const { GroupUsers, GroupJoinRequest } = require('../../models');

module.exports.validate = async (req, res, next) => {
  const { user, group } = res.locals;

  try {
    if (!group?.isActive) {
      return next({
        status: 400,
        message: 'Only active circles can accept join requests.',
      });
    }

    const membership = await GroupUsers.findOne({
      where: { userId: user.id, groupId: group.id },
      attributes: ['id'],
    });

    if (membership) {
      return next({
        status: 409,
        message: 'You are already a member of this circle.',
      });
    }

    const pendingRequest = await GroupJoinRequest.findOne({
      where: {
        userId: user.id,
        groupId: group.id,
        status: 'PENDING',
      },
      attributes: ['id'],
    });

    if (pendingRequest) {
      return next({
        status: 409,
        message: 'A join request is already pending for this circle.',
      });
    }

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { user, group } = res.locals;

  try {
    const joinRequest = await GroupJoinRequest.create({
      userId: user.id,
      groupId: group.id,
      status: 'PENDING',
    });

    res.send({
      status: 201,
      message: 'Join request submitted.',
      joinRequest,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
