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
    // Check if this is a demo user request
    const isDemoUser = req.user.email === 'demo@example.com';
    
    if (isDemoUser) {
      console.log('Demo user attempting to create note');
      
      // Manually check note limit for demo users
      const noteCount = await Note.countDocuments({ user: req.user.userId });
      console.log(`Demo user current note count: ${noteCount}`);
      
      if (noteCount >= 3) {
        console.log('Demo user exceeded note limit - rejected from controller');
        return res.status(403).json({
          message: 'Demo account cannot create more than 3 notes'
        });
      }
    }
    
    const note = new Note({
      ...req.body,
      user: req.user.userId
    });
    
    console.log(`Creating note for user: ${req.user.email} (${req.user.userId})`);
    console.log('Note data:', JSON.stringify(req.body));
    
    await note.save();
    
    console.log('Note created successfully');
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(400).json({ message: 'Error creating note', error: error.message });
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