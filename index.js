'use strict';
require('dotenv').config();
const browserify = require('browserify-middleware');
const Library = require('./library');
const StoryModel = require('./storyModel');
const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates http server
const token = process.env.TOKEN; // verification token
const port = process.env.PORT;
const ratings = {
  'Really helpful': 5,
  'It helped a bit': 4,
  'It was ok': 3,
  'Not much': 2,
  'Not at all': 1
};

const sessions = {};

const library = new Library(StoryModel);

app.get('/js/charts.js', browserify(__dirname + '/charts.js'));

app.use('/admin', express.static('client'));

app.get('/stats/data.json', async (req, res, next) => {
  const ooh_story1P = library.getStoryData('ooh_story1');
  const ooh_story2P = library.getStoryData('ooh_story2');
  const ooh_story3P = library.getStoryData('ooh_story3');
  const ooh_story4P = library.getStoryData('ooh_story4');

  let stories;
  try {
    stories = await Promise.all([ooh_story1P, ooh_story2P, ooh_story3P, ooh_story4P]);
  } catch(e) {
    next(e);

    return e;
  }

  res.json(stories);
});

app.get('/', (req, res) => {
  // check if verification token is correct
  if (req.query.token !== token) {
    return res.sendStatus(401);
  }

  return res.end(req.query.challenge);
});

app.post('/', (req, res) => {
  // check if verification token is correct
  if (req.query.token !== token) {
    return res.sendStatus(401);
  }

  const result = req.body.result;
  const response = {
    parameters: { save: 'me' },
  };

  if (result.interaction.name.substring(0, 15) === 'choose ooh_story') {
    switch (result.interaction.name) {
      case 'choose ooh_story1':
        library.logStoryChoice(result.interaction.name.substring(7, 16));
        break;
      case 'choose ooh_story2':
        library.logStoryChoice(result.interaction.name.substring(7, 16));
        break;
      case 'choose ooh_story3':
        library.logStoryChoice(result.interaction.name.substring(7, 16));
        break;
      case 'choose ooh_story4':
        library.logStoryChoice(result.interaction.name.substring(7, 16));
        break;
    }
  } else if (result.interaction.name.substring(0, 15) === 'end of ooh_story') {
    switch (result.interaction.name) {
      case 'end of ooh_story1':
        library.logStoryCompleted(result.interaction.name.substring(7, 16));
        break;
      case 'end of ooh_story2':
        library.logStoryCompleted(result.interaction.name.substring(7, 16));
        break;
      case 'end of ooh_story3':
        library.logStoryCompleted(result.interaction.name.substring(7, 16));
        break;
      case 'end of ooh_story4':
        library.logStoryCompleted(result.interaction.name.substring(7, 16));
        break;
    }
  } else if (result.interaction.name.substring(0, 13) === 'rate ooh_story') {
    switch (result.interaction.name) {
      case 'rate ooh_story1':
        console.log('resolved query', result.resolvedQuery);
        library.addStoryRating(
          result.interaction.name.substring(5, 14),
          ratings[result.resolvedQuery]
        );
        break;
      case 'rate ooh_story2':
        console.log('resolved query', result.resolvedQuery);
        library.addStoryRating(
          result.interaction.name.substring(5, 14),
          ratings[result.resolvedQuery]
        );
        break;
      case 'rate ooh_story3':
        library.addStoryRating(
          result.interaction.name.substring(5, 14),
          ratings[result.resolvedQuery]
        );
        break;
      case 'rate ooh_story4':
        library.addStoryRating(
          result.interaction.name.substring(5, 14),
          ratings[result.resolvedQuery]
        );
        break;
    }
  }

  return res.json(response);
});

app.listen(port, () => console.log('[BotEngine] Webhook is listening'));
