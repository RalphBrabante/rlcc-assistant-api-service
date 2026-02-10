'use strict';

const { GroupJoinRequest, GroupUsers } = require('../../models');

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
  const requestId = Number(req.params.requestId);
  const decision = String(req.body?.decision || '').trim().toUpperCase();

  if (!Number.isInteger(requestId) || requestId < 1) {
    return next({
      status: 400,
      message: 'Invalid join request id.',
    });
  }

  if (!['APPROVE', 'REJECT'].includes(decision)) {
    return next({
      status: 400,
      message: 'decision must be APPROVE or REJECT.',
    });
  }

  if (!canReviewJoinRequests(user, group)) {
    return next({
      status: 403,
      message: 'Forbidden. You cannot review join requests for this circle.',
    });
  }

  const joinRequest = await GroupJoinRequest.findOne({
    where: {
      id: requestId,
      groupId: group.id,
      status: 'PENDING',
    },
  });

  if (!joinRequest) {
    return next({
      status: 404,
      message: 'Pending join request not found.',
    });
  }

  res.locals.joinRequest = joinRequest;
  res.locals.joinRequestDecision = decision;
  return next();
};

module.exports.invoke = async (req, res, next) => {
  const { user, group, joinRequest, joinRequestDecision } = res.locals;

  try {
    if (joinRequestDecision === 'APPROVE') {
      await GroupUsers.findOrCreate({
        where: {
          userId: joinRequest.userId,
          groupId: group.id,
        },
        defaults: {
          userId: joinRequest.userId,
          groupId: group.id,
        },
      });

      joinRequest.status = 'APPROVED';
    } else {
      joinRequest.status = 'REJECTED';
    }

    joinRequest.reviewedBy = user.id;
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    res.send({
      status: 200,
      message:
        joinRequestDecision === 'APPROVE'
          ? 'Join request approved.'
          : 'Join request rejected.',
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
