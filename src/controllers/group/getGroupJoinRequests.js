'use strict';

const { GroupJoinRequest, User } = require('../../models');

function canReviewJoinRequests(user, group) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return (
    roles.includes('SUPERUSER') ||
    roles.includes('ADMINISTRATOR') ||
    Number(group?.leaderId) === Number(user?.id)
  );
}

module.exports.validate = async (req, res, next) => {
  const { user, group } = res.locals;
  const status = String(req.query?.status || 'pending').trim().toUpperCase();

  if (!canReviewJoinRequests(user, group)) {
    return next({
      status: 403,
      message: 'Forbidden. You cannot review join requests for this circle.',
    });
  }

  if (!['PENDING', 'APPROVED', 'REJECTED', 'ALL'].includes(status)) {
    return next({
      status: 400,
      message: 'status must be one of: pending, approved, rejected, all.',
    });
  }

  res.locals.joinRequestStatus = status;
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { group } = res.locals;
  const status = res.locals.joinRequestStatus;

  try {
    const where = {
      groupId: group.id,
    };

    if (status !== 'ALL') {
      where.status = status;
    }

    const joinRequests = await GroupJoinRequest.findAll({
      where,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'emailAddress', 'avatar', 'pcoId'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.send({
      status: 200,
      joinRequests,
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
