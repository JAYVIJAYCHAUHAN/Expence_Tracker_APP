const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const demoRestrictions = require('../middleware/demoRestrictions');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin
} = require('../controllers/note.controller');

// All routes require authentication
router.use(authMiddleware.verifyToken);
router.use(demoRestrictions);

// Get all notes for the logged-in user
router.get('/', getNotes);

// Get a specific note
router.get('/:id', getNoteById);

// Create a new note
router.post('/', createNote);

// Update a note
router.put('/:id', updateNote);
router.patch('/:id', updateNote);

// Delete a note
router.delete('/:id', deleteNote);

// Toggle pin status
router.patch('/:id/toggle-pin', togglePin);

module.exports = router; 