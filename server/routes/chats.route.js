const router = require('express').Router();
let Chat = require('../models/chat.model');

router.route('/').get((req, res) => {
  Chat.find()
    .then(chats => res.json(chats))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Chat.findById(req.parems.id)
    .then(chats => res.json(chats))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').post((req, res) => {
  const username = req.body.username;
  const chat = req.body.chat;
  const room = req.body.room;
  const newChat = new Chat({username, chat, room,});

  newChat.save()
    .then(() => res.json('Chat added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/:id').patch((req, res) => {
  Chat.findById(req.params.id)
    .then(chat => {
      chat.username = req.body.username;
      chat.chat = req.body.chat;

      chat.save()
        .then(() => res.json('Chat updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Chat.findByIdAndDelete(req.params.id)
  .then(() => res.json('Chat deleted.'))
  .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;