const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const profileController = require('../controllers/profileController');
const projectController = require('../controllers/projectController');
const technologyController = require('../controllers/technologyController');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.post('/profiles', asyncHandler(profileController.create));
router.get('/profiles/:id', asyncHandler(profileController.findById));

router.post('/technologies', asyncHandler(technologyController.create));
router.get('/technologies', asyncHandler(technologyController.findAll));

router.post('/projects', asyncHandler(projectController.create));
router.get('/projects', asyncHandler(projectController.findAll));
router.put('/projects/:projectId/upvote', asyncHandler(projectController.upvote));
router.post('/projects/:projectId/feedbacks', asyncHandler(feedbackController.create));
router.get('/projects/:projectId/feedbacks', asyncHandler(feedbackController.findByProjectId));

module.exports = router;