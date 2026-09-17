const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✓ Connected to MongoDB!');
  })
  .catch((error) => {
    console.log('✗ MongoDB connection error:', error.message);
    console.log('Connection string being used:', process.env.MONGODB_URI ? 'Present' : 'Missing');
  });

// Moment Schema - supports personalization with custom content
const momentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  emoji: { type: String, required: true },
  color: { type: String, required: true },
  response: { type: String, default: '' }, // Personal message/story for this moment
  responseType: { type: String, enum: ['text', 'story', 'advice', 'memory'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

const Moment = mongoose.model('Moment', momentSchema);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// GET all moments
app.get('/api/moments', async (req, res) => {
  try {
    const moments = await Moment.find().sort({ id: 1 });
    res.json(moments);
  } catch (error) {
    console.error('Error fetching moments:', error);
    res.status(500).json({ error: 'Failed to fetch moments' });
  }
});

// GET a specific moment by ID
app.get('/api/moments/:id', async (req, res) => {
  try {
    const moment = await Moment.findOne({ id: parseInt(req.params.id) });
    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    res.json(moment);
  } catch (error) {
    console.error('Error fetching moment:', error);
    res.status(500).json({ error: 'Failed to fetch moment' });
  }
});

// POST - Add a new moment (or update existing)
app.post('/api/moments', async (req, res) => {
  try {
    const { id, title, emoji, color, response, responseType } = req.body;

    const moment = await Moment.findOneAndUpdate(
      { id },
      { title, emoji, color, response, responseType },
      { upsert: true, new: true }
    );

    res.json(moment);
  } catch (error) {
    console.error('Error saving moment:', error);
    res.status(500).json({ error: 'Failed to save moment' });
  }
});

// PUT - Update a moment's personalized content
app.put('/api/moments/:id', async (req, res) => {
  try {
    const { response, responseType } = req.body;

    const moment = await Moment.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { response, responseType },
      { new: true }
    );

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    res.json(moment);
  } catch (error) {
    console.error('Error updating moment:', error);
    res.status(500).json({ error: 'Failed to update moment' });
  }
});

// POST - Initialize database with all 119 moments
app.post('/api/init-moments', async (req, res) => {
  try {
    // Check if moments already exist
    const count = await Moment.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Moments already initialized', count });
    }

    const momentsData = [
      { id: 1, title: 'When you first receive this', emoji: '💌', color: '#f5d5e0' },
      { id: 2, title: 'When you have a bad day', emoji: '☔', color: '#e8b8cc' },
      { id: 3, title: 'When you miss me', emoji: '💔', color: '#f0c9d9' },
      { id: 4, title: 'When you need to laugh', emoji: '😂', color: '#f8e0eb' },
      { id: 5, title: 'When you can\'t sleep', emoji: '🌙', color: '#e9cfd9' },
      { id: 6, title: 'When you\'re feeling insecure', emoji: '✨', color: '#f0b5c5' },
      { id: 7, title: 'When you\'re happy', emoji: '😊', color: '#f8e0eb' },
      { id: 8, title: 'When you\'re lonely', emoji: '🤍', color: '#f0c9d9' },
      { id: 9, title: 'When you\'re worried about something', emoji: '😟', color: '#e8b8cc' },
      { id: 10, title: 'When you need a pep talk', emoji: '💪', color: '#f5d5e0' },
      { id: 11, title: 'When it\'s your birthday', emoji: '🎂', color: '#f8e0eb' },
      { id: 12, title: 'When it\'s Christmas Day', emoji: '🎄', color: '#f0c9d9' },
      { id: 13, title: 'When it\'s Valentine\'s Day', emoji: '💕', color: '#e9cfd9' },
      { id: 14, title: 'When it\'s the start of a new year', emoji: '🎆', color: '#f5d5e0' },
      { id: 15, title: 'When you feel like giving up', emoji: '🌟', color: '#f8e0eb' },
      { id: 16, title: 'When you\'re frustrated with work', emoji: '😤', color: '#e8b8cc' },
      { id: 17, title: 'When you\'re sick', emoji: '🤒', color: '#f0c9d9' },
      { id: 18, title: 'When our plans get cancelled', emoji: '😞', color: '#f5d5e0' },
      { id: 19, title: 'When you\'re doubting yourself', emoji: '🤔', color: '#e9cfd9' },
      { id: 20, title: 'When you need a hug', emoji: '🤗', color: '#f8e0eb' },
      { id: 21, title: 'When you need to hear a compliment', emoji: '😌', color: '#f0c9d9' },
      { id: 22, title: 'When you\'ve made a mistake', emoji: '😅', color: '#e8b8cc' },
      { id: 23, title: 'When you need motivation', emoji: '🔥', color: '#f5d5e0' },
      { id: 24, title: 'When you need movie/TV show recommendations', emoji: '🎬', color: '#f8e0eb' },
      { id: 25, title: 'When you\'re excited about something', emoji: '🎉', color: '#f0c9d9' },
      { id: 26, title: 'When you\'re bored', emoji: '😐', color: '#e9cfd9' },
      { id: 27, title: 'When you need to make a big decision', emoji: '⚖️', color: '#f5d5e0' },
      { id: 28, title: 'When you\'re sick of social media', emoji: '📱', color: '#e8b8cc' },
      { id: 29, title: 'When you\'re really angry', emoji: '😠', color: '#f8e0eb' },
      { id: 30, title: 'When you get your heart broken', emoji: '💔', color: '#f0c9d9' },
      { id: 31, title: 'When we have an argument', emoji: '😔', color: '#f5d5e0' },
      { id: 32, title: 'When you want to hear about my favourite memory with you', emoji: '📸', color: '#e9cfd9' },
      { id: 33, title: 'When we haven\'t spoken in a while', emoji: '📞', color: '#f8e0eb' },
      { id: 34, title: 'When I don\'t pick up my phone', emoji: '📲', color: '#e8b8cc' },
      { id: 35, title: 'When you feel like giving up on your goals', emoji: '🎯', color: '#f0c9d9' },
      { id: 36, title: 'When you do something embarrassing', emoji: '😳', color: '#f5d5e0' },
      { id: 37, title: 'When you lose someone or something precious to you', emoji: '😢', color: '#e9cfd9' },
      { id: 38, title: 'When you wish I was there', emoji: '👫', color: '#f8e0eb' },
      { id: 39, title: 'When you feel like crying', emoji: '😭', color: '#e8b8cc' },
      { id: 40, title: 'When you do something you\'re proud of', emoji: '🏆', color: '#f0c9d9' },
      { id: 41, title: 'When you\'re holding back', emoji: '🤐', color: '#f5d5e0' },
      { id: 42, title: 'When you want to see my favourite photos of us', emoji: '📷', color: '#e9cfd9' },
      { id: 43, title: 'When you\'re having a bad mental health day', emoji: '🧠', color: '#f8e0eb' },
      { id: 44, title: 'When you want to escape', emoji: '✈️', color: '#e8b8cc' },
      { id: 45, title: 'When you need extra cash', emoji: '💰', color: '#f0c9d9' },
      { id: 46, title: 'When you\'re travelling alone', emoji: '🗺️', color: '#f5d5e0' },
      { id: 47, title: 'When I\'m driving you crazy', emoji: '😵', color: '#e9cfd9' },
      { id: 48, title: 'When you\'re stressed out', emoji: '😩', color: '#f8e0eb' },
      { id: 49, title: 'When you feel out of place', emoji: '🌍', color: '#e8b8cc' },
      { id: 50, title: 'When you need a change', emoji: '🔄', color: '#f0c9d9' },
      { id: 51, title: 'When you want to hear a secret', emoji: '🤫', color: '#f5d5e0' },
      { id: 52, title: 'When you feel scared', emoji: '😨', color: '#e9cfd9' },
      { id: 53, title: 'When the weather is gloomy', emoji: '⛅', color: '#f8e0eb' },
      { id: 54, title: 'When the weather is beautiful', emoji: '☀️', color: '#e8b8cc' },
      { id: 55, title: 'When you don\'t feel like yourself', emoji: '🎭', color: '#f0c9d9' },
      { id: 56, title: 'When you need bucket-list ideas', emoji: '✍️', color: '#f5d5e0' },
      { id: 57, title: 'When your reality isn\'t meeting your expectations', emoji: '🌈', color: '#e9cfd9' },
      { id: 58, title: 'When you need to focus', emoji: '🎓', color: '#f8e0eb' },
      { id: 59, title: 'When you\'re feeling homesick', emoji: '🏠', color: '#e8b8cc' },
      { id: 60, title: 'When you need some self-love tips', emoji: '💖', color: '#f0c9d9' },
      { id: 61, title: 'When you regret doing something', emoji: '😔', color: '#f5d5e0' },
      { id: 62, title: 'When you need a reminder of how strong you are', emoji: '💎', color: '#e9cfd9' },
      { id: 63, title: 'When you need a reason to be thankful', emoji: '🙏', color: '#f8e0eb' },
      { id: 64, title: 'When you need a distraction', emoji: '🎮', color: '#e8b8cc' },
      { id: 65, title: 'When you need someone to calm you down', emoji: '🧘', color: '#f0c9d9' },
      { id: 66, title: 'When you feel grief', emoji: '🕊️', color: '#f5d5e0' },
      { id: 67, title: 'When it\'s 3 AM and your thoughts are keeping you awake', emoji: '🌃', color: '#e9cfd9' },
      { id: 68, title: 'When you\'re pretending to be okay', emoji: '🎪', color: '#f8e0eb' },
      { id: 69, title: 'When you need a book recommendation', emoji: '📚', color: '#e8b8cc' },
      { id: 70, title: 'When you don\'t know what you\'re doing with your life', emoji: '🗺️', color: '#f0c9d9' },
      { id: 71, title: 'When you\'re trying to quit a bad habit', emoji: '🚫', color: '#f5d5e0' },
      { id: 72, title: 'When you do something you never thought you\'d be able to do', emoji: '🎊', color: '#e9cfd9' },
      { id: 73, title: 'When you have no plans', emoji: '⏰', color: '#f8e0eb' },
      { id: 74, title: 'When you want to hear a poem about yourself', emoji: '✒️', color: '#e8b8cc' },
      { id: 75, title: 'When you don\'t feel like talking', emoji: '🤫', color: '#f0c9d9' },
      { id: 76, title: 'When you want to learn something you never knew about me', emoji: '🔍', color: '#f5d5e0' },
      { id: 77, title: 'When you want to hear how I describe you to others', emoji: '🗣️', color: '#e9cfd9' },
      { id: 78, title: 'When you\'re feeling lucky', emoji: '🍀', color: '#f8e0eb' },
      { id: 79, title: 'When you want to reminisce', emoji: '🎞️', color: '#e8b8cc' },
      { id: 80, title: 'When you need to feel loved', emoji: '💕', color: '#f0c9d9' },
      { id: 81, title: 'When you\'re angry at me', emoji: '😤', color: '#f5d5e0' },
      { id: 82, title: 'When I\'m angry at you', emoji: '😠', color: '#e9cfd9' },
      { id: 83, title: 'When you do something new', emoji: '🆕', color: '#f8e0eb' },
      { id: 84, title: 'When it\'s our anniversary', emoji: '💑', color: '#e8b8cc' },
      { id: 85, title: 'When you\'re celebrating an accomplishment', emoji: '🎖️', color: '#f0c9d9' },
      { id: 86, title: 'When you need new music recommendations', emoji: '🎵', color: '#f5d5e0' },
      { id: 87, title: 'When there\'s an important occasion I can\'t be there for', emoji: '🎁', color: '#e9cfd9' },
      { id: 88, title: 'When you want to learn about the things that remind me of you', emoji: '💭', color: '#f8e0eb' },
      { id: 89, title: 'When you need food recommendations', emoji: '🍽️', color: '#e8b8cc' },
      { id: 90, title: 'When you need a vacation', emoji: '🏖️', color: '#f0c9d9' },
      { id: 91, title: 'When you need fitness motivation', emoji: '🏃', color: '#f5d5e0' },
      { id: 92, title: 'When you do something you\'re not proud of', emoji: '😞', color: '#e9cfd9' },
      { id: 93, title: 'When you need a gentle reminder', emoji: '💌', color: '#f8e0eb' },
      { id: 94, title: 'When something didn\'t go how you planned', emoji: '📍', color: '#e8b8cc' },
      { id: 95, title: 'When you don\'t feel like getting out of bed', emoji: '🛏️', color: '#f0c9d9' },
      { id: 96, title: 'When you need a reason to keep going', emoji: '⭐', color: '#f5d5e0' },
      { id: 97, title: 'When you get some bad news', emoji: '😞', color: '#e9cfd9' },
      { id: 98, title: 'When you get some good news', emoji: '😄', color: '#f8e0eb' },
      { id: 99, title: 'When you want to hear something weird', emoji: '👽', color: '#e8b8cc' },
      { id: 100, title: 'When you want to hear a story', emoji: '📖', color: '#f0c9d9' },
      { id: 101, title: 'When you\'ve had a rough week', emoji: '📅', color: '#f5d5e0' },
      { id: 102, title: 'When you have a bad dream', emoji: '👻', color: '#e9cfd9' },
      { id: 103, title: 'When someone lets you down', emoji: '😞', color: '#f8e0eb' },
      { id: 104, title: 'When you feel hurt', emoji: '💔', color: '#e8b8cc' },
      { id: 105, title: 'When it all feels too much', emoji: '😵', color: '#f0c9d9' },
      { id: 106, title: 'When you don\'t feel appreciated', emoji: '🎀', color: '#f5d5e0' },
      { id: 107, title: 'When you\'re feeling anxious', emoji: '😰', color: '#e9cfd9' },
      { id: 108, title: 'When you want to scream', emoji: '😤', color: '#f8e0eb' },
      { id: 109, title: 'When you need someone to listen', emoji: '👂', color: '#e8b8cc' },
      { id: 110, title: 'When you want attention', emoji: '👀', color: '#f0c9d9' },
      { id: 111, title: 'When you\'re hungover', emoji: '🤕', color: '#f5d5e0' },
      { id: 112, title: 'When I feel too far away', emoji: '📍', color: '#e9cfd9' },
      { id: 113, title: 'When you\'re procrastinating', emoji: '⏳', color: '#f8e0eb' },
      { id: 114, title: 'When you feel blue for no reason', emoji: '💙', color: '#e8b8cc' },
      { id: 115, title: 'When you\'re confused', emoji: '❓', color: '#f0c9d9' },
      { id: 116, title: 'When you want to hear my favourite traits about you', emoji: '💫', color: '#f5d5e0' },
      { id: 117, title: 'When you\'re unsure about the future', emoji: '🔮', color: '#e9cfd9' },
      { id: 118, title: 'When you need my advice', emoji: '💡', color: '#f8e0eb' },
      { id: 119, title: 'When I\'m watching a match and not answering you', emoji: '⚽', color: '#e8b8cc' },
    ];

    const result = await Moment.insertMany(momentsData);
    res.json({
      message: `Successfully initialized ${result.length} moments!`,
      count: result.length
    });
  } catch (error) {
    console.error('Error initializing moments:', error);
    res.status(500).json({ error: 'Failed to initialize moments' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export for Vercel
module.exports = app;