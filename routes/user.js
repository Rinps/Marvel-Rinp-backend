// Load packages
const mongoose = require("mongoose");
const express = require("express");
const axios = require("axios");
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const SHA256 = require("crypto-js/sha256");

// Load models
const User = require("../models/User");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

// Define routes
// Allow a client to signup and create an account. Require these BODY parameters: "username" (String), "email" (String) and "password" (String).
router.put("/user/signup", async (req, res) => {
  try {
    const { username, email, password } = req.fields;
    const existingUsername = await User.find({
      account: { username: username },
    });
    const existingEmail = await User.find({ email: email });

    if (username && email && password) {
      if (existingUsername.length === 0 && existingEmail.length === 0) {
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);
        const newUser = new User({
          email: email,
          salt: salt,
          hash: hash,
          token: token,
          account: {
            userName: username,
            favorites: {
              comics: [],
              characters: [],
            },
          },
        });
        await newUser.save();

        res.status(200).json({ message: "Account created" });
      } else {
        res.status(400).json({ message: "Account already created" });
      }
    } else {
      res.status(400).json({ message: "Missing something" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Allow a user to login. Require these QUERY parameters: "username" (String) and "password" (String).
router.get("/user/login", async (req, res) => {
  try {
    const { username, password } = req.query;

    const user = await User.findOne({ "account.userName": username });
    if (user) {
      const salt = user.salt;
      const dataBaseHash = user.hash;
      const token = user.token;
      const userHash = SHA256(password + salt).toString(encBase64);

      if (dataBaseHash === userHash) {
        res.status(200).json(token);
      } else {
        res.status(400).json({ message: "Incorrect username or password" });
      }
    } else {
      res.status(400).json({ message: "Incorrect username or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Allow a user to access its profile's data. Does not require any parameter, but the request must have a valid bearer token.
router.get("/user/access", isAuthenticated, async (req, res) => {
  try {
    const user = req.user.account;
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a favorite character to a user profile. Require a valid bearer token and these BODY parameter: "characterId" (String), "name" (String), "description" (String) and picture (String).
router.put("/user/favCharacter", isAuthenticated, async (req, res) => {
  try {
    // Extract character's data and user's data from the request.
    const { characterId, name, description, picture } = req.fields;
    const user = req.user;
    const account = user.account;

    // Search if this character is already in the favorite list.
    const alreadyFav = account.favorites.characters.filter((favorite) => {
      return characterId === favorite.characterId;
    });

    // If it's not, or if there's nothing in the favorite character's array, add it to the user's profile.
    if (alreadyFav.length > 0 && account.favorites.characters.length > 0) {
      res
        .status(400)
        .json({ message: "This character is already a favorite." });
    } else {
      const newObject = {
        characterId: characterId,
        name: name,
        description: description,
        picture: picture,
      };
      account.favorites.characters.push(newObject);
      await user.save();
      const response = user.account;
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a favorite character to a user profile. Require a valid bearer token and a BODY parameter: "characterId" (String).
router.delete("/user/favCharacter", isAuthenticated, async (req, res) => {
  try {
    const { characterId } = req.fields;
    const user = req.user;
    const favoriteCharacters = user.account.favorites.characters;

    // We will iterate through the user's favorite characters list. When the item has the same value as the request characterId, we just ignore it.
    const newTab = [];
    for (let i = 0; i < favoriteCharacters.length; i++) {
      if (favoriteCharacters[i].characterId !== characterId) {
        newTab.push(favoriteCharacters[i]);
      }
    }
    user.account.favorites.characters = newTab;
    await user.save();
    const response = user.account;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a favorite comic to a user profile. Require a valid bearer token and these BODY parameter: "comicId" (String), "title" (String), "description" (String) and picture (String).
router.put("/user/favComic", isAuthenticated, async (req, res) => {
  try {
    // Extract comics's data and user's data from the request.
    const { comicId, title, description, picture } = req.fields;
    const user = req.user;
    const account = user.account;

    // Search if this comic is already in the favorite list.
    const alreadyFav = account.favorites.comics.filter((favorite) => {
      return comicId === favorite.comicId;
    });

    // If it's not, or if there's nothing in the favorite comic's array, add it to the user's profile.
    if (alreadyFav.length > 0 && account.favorites.comics.length > 0) {
      res.status(400).json({ message: "This comic is already a favorite." });
    } else {
      const newObject = {
        comicId: comicId,
        title: title,
        description: description,
        picture: picture,
      };
      account.favorites.comics.push(newObject);
      user.account = account;
      await user.save();
      const response = user.account;
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a favorite comic to a user profile. Require a valid bearer token and a BODY parameter: "comicId" (String).
router.delete("/user/favComic", isAuthenticated, async (req, res) => {
  try {
    const { comicId } = req.fields;
    const user = req.user;
    const favoriteComics = user.account.favorites.comics;
    // We will iterate through the user's favorite characters list. When the item has the same value as the request characterId, we just ignore it.
    const newTab = [];
    for (let i = 0; i < favoriteComics.length; i++) {
      if (favoriteComics[i].comicId !== comicId) {
        newTab.push(favoriteComics[i]);
      }
    }
    user.account.favorites.comics = newTab;
    await user.save();
    const response = user.account;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
