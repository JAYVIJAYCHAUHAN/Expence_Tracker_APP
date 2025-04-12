const Note = require('../models/Note');

// Get all notes for the logged-in user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.userId })
      .sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error });
  }
};

// Get a specific note by ID
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id,
      user: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching note', error });
  }
};

// Create a new note
const createNote = async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      user: req.user.userId
    });
    
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note', error });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error updating note', error });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error });
  }
};

// Toggle pin status
const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id,
      user: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    note.isPinned = !note.isPinned;
    await note.save();
    
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error toggling pin status', error });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin
}; 