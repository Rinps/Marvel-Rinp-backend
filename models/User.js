const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  salt: String,
  hash: String,
  token: String,
  account: {
    userName: String,
    favorites: {
      comics: [
        {
          comicId: String,
          title: String,
          description: String,
          picture: String,
        },
      ],
      characters: [
        {
          characterId: String,
          name: String,
          description: String,
          picture: String,
        },
      ],
    },
  },
});

module.exports = User;
