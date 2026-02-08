// routes/index.js
const express = require("express");
const router = express.Router();
const createGroup = require("../controllers/group/createGroup");
const assignUserToGroup = require("../controllers/group/assignUserToGroup");
const getAndCountGroup = require("../controllers/group/getAndCountGroup");
const countAllActiveGroups = require("../controllers/group/countAllActiveGroups");
const getGroupById = require("../controllers/group/getGroupById");
const updateGroup = require("../controllers/group/updateGroup");
const setUserAsGroupLeader = require("../controllers/group/setUserAsGroupLeader");
const deleteGroup = require("../controllers/group/deleteGroup");
const getUnassignedUsers = require("../controllers/group/getUnassignedUsers");
const joinGroup = require("../controllers/group/joinGroup");
const removeUserFromGroup = require("../controllers/group/removeUserFromGroup");
const getGroupMessages = require("../controllers/groupChat/getGroupMessages");
const sendGroupMessage = require("../controllers/groupChat/sendGroupMessage");
const deleteGroupMessage = require("../controllers/groupChat/deleteGroupMessage");
const getGroupTopics = require("../controllers/groupTopic/getGroupTopics");
const createGroupTopic = require("../controllers/groupTopic/createGroupTopic");
const getAllGroupTopics = require("../controllers/groupTopic/getAllGroupTopics");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const initGroupResource = require("../middlewares/initGroupResource");
const initUserResource = require("../middlewares/initUserResource");
const initGroupChatAccess = require("../middlewares/initGroupChatAccess");
const initGroupTopicCreateAccess = require("../middlewares/initGroupTopicCreateAccess");
const initGroupTopicReadAccess = require("../middlewares/initGroupTopicReadAccess");
const asyncHandler = require("../utils/asyncHandler");
const { cacheRead, invalidateCache } = require("../middlewares/cacheMiddleware");

router.get(
  "",
  authenticate,
  authorize(["get_all_group", "read_own_group"]),
  cacheRead("groups"),
  getAndCountGroup.validate,
  getAndCountGroup.invoke
);

router.get(
  "/unassigned-users",
  authenticate,
  authorize(["get_all_group"]),
  cacheRead("groups"),
  getUnassignedUsers.validate,
  getUnassignedUsers.invoke
);

router.get(
  "/topics",
  authenticate,
  authorize(["read_all_group_topics"]),
  cacheRead("group-topics"),
  getAllGroupTopics.validate,
  getAllGroupTopics.invoke
);

router.post(
  "/:id/join",
  authenticate,
  authorize(["join_group"]),
  initGroupResource,
  asyncHandler(joinGroup.validate),
  asyncHandler(joinGroup.invoke)
);

router.get(
  "/:id/topics",
  authenticate,
  authorize(["read_group_topics", "read_all_group_topics"]),
  initGroupResource,
  initGroupTopicReadAccess,
  cacheRead("group-topics"),
  getGroupTopics.validate,
  getGroupTopics.invoke
);

router.post(
  "/:id/topics",
  authenticate,
  authorize(["create_group_topic"]),
  initGroupResource,
  initGroupTopicCreateAccess,
  invalidateCache(["group-topics"]),
  createGroupTopic.validate,
  createGroupTopic.invoke
);

router.get(
  "/:id/chat/messages",
  authenticate,
  initGroupResource,
  initGroupChatAccess,
  cacheRead("group-messages"),
  getGroupMessages.validate,
  getGroupMessages.invoke
);

router.post(
  "/:id/chat/messages",
  authenticate,
  initGroupResource,
  initGroupChatAccess,
  invalidateCache(["group-messages"]),
  sendGroupMessage.validate,
  sendGroupMessage.invoke
);

router.delete(
  "/:id/chat/messages/:messageId",
  authenticate,
  initGroupResource,
  initGroupChatAccess,
  invalidateCache(["group-messages"]),
  deleteGroupMessage.validate,
  deleteGroupMessage.invoke
);

router.patch(
  "/:id/administrator/:userId",
  authenticate,
  authorize(["update_group"]),
  initUserResource,
  initGroupResource,
  invalidateCache(["groups"]),
  setUserAsGroupLeader.validate,
  setUserAsGroupLeader.invoke
);

router.patch(
  "/:id/user/:userId",
  authenticate,
  authorize(["update_group"]),
  initUserResource,
  initGroupResource,
  invalidateCache(["groups"]),
  setUserAsGroupLeader.validate,
  setUserAsGroupLeader.invoke
);

router.delete(
  "/:id/user/:userId",
  authenticate,
  authorize(["assign_user_to_group"]),
  initUserResource,
  initGroupResource,
  invalidateCache(["groups"]),
  removeUserFromGroup.validate,
  removeUserFromGroup.invoke
);

router.patch(
  "/:id",
  authenticate,
  authorize(["update_group"]),
  initGroupResource,
  invalidateCache(["groups"]),
  updateGroup.validate,
  updateGroup.invoke
);

router.post(
  "",
  authenticate,
  authorize(["create_group"]),
  invalidateCache(["groups"]),
  createGroup.validate,
  createGroup.invoke
);

router.post(
  "/assign",
  authenticate,
  authorize(["assign_user_to_group"]),
  invalidateCache(["groups"]),
  assignUserToGroup.validate,
  assignUserToGroup.invoke
);

router.get(
  "/count",
  authenticate,
  authorize(["get_all_group", "read_own_group"]),
  countAllActiveGroups.validate,
  countAllActiveGroups.invoke
);

router.delete(
  "/:id",
  authenticate,
  authorize(["delete_group"]),
  initGroupResource,
  invalidateCache(["groups"]),
  deleteGroup.validate,
  deleteGroup.invoke
);

router.get(
  "/:id",
  authenticate,
  authorize(["read_own_group", "read_all_groups"]),
  cacheRead("groups"),
  getGroupById.validate,
  getGroupById.invoke
);

module.exports = router;
