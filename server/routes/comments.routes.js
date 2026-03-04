const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments.controller');
const verifyToken = require('../middleware/auth');
const sanitizeCommentMiddleware = require('../middleware/sanitizeCommentMiddleware')

router.put('/:id', verifyToken, sanitizeCommentMiddleware, commentsController.updateComment);
router.delete('/:id', verifyToken, commentsController.deleteComment);

module.exports = router;
