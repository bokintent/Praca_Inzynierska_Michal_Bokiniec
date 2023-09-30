const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017';
const dbname = 'nazwa_bazy_danych'
const bodyParser = require('body-parser');
const Project = require('./models/project');
const soundRouter = require('./routes/sounds'); 
const Sound = require('./models/sound'); 

const app = express();

mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Pomyślnie połączono z MongoDB');
}).catch((error) => {
  console.error('Błąd podczas łączenia z MongoDB:', error);
});

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use('/sounds', soundRouter);

app.get('/', (req, res) => {
  res.render('index');
});




const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Aplikacja działa na http://localhost:${PORT}`);
});



app.post('/saveAudioData', async (req, res) => {
  const { audioData } = req.body;

  try {


    res.json({ success: true });
  } catch (error) {
    console.error('Błąd podczas zapisywania danych audio:', error);
    res.status(500).send('Wystąpił błąd podczas zapisywania danych audio.');
  }
});

