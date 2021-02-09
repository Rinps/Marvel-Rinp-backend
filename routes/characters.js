// Import packages
const express = require("express");
const axios = require("axios");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

// Every request will be made to the marvel-api, so we're storing the URL into a constant in order to have a clean code.
const apiURL = "https://lereacteur-marvel-api.herokuapp.com";

// Get the API entire Heroes database. Require a QUERY parameter: the API key, wich is store in an environment variable.
// This returns an object containing the characters sheets.
router.get("/characters/all", async (req, res) => {
  try {
    const apiResponse = await axios.get(
      `${apiURL}/characters?apiKey=${process.env.MARVEL_API}`
    );

    const apiResults = apiResponse.data.results;
    // The heroesLength function is used to get the total amount of heroes in the Marvel universe. It is totally useless for now, but I wanted to know and the API only provide 100 results after a request to familiarize a bit with the API.
    // Since the API only send a maximum of 100 heroes per request, "heroesLength" is a recursive function that will iterate through the entire database in order to get every characters.
    const heroesLength = async (heroesToSkip) => {
      // Send a request to the API and store the results
      const newApiResponse = await axios.get(
        `${apiURL}/characters?apiKey=${process.env.MARVEL_API}&skip=${heroesToSkip}`
      );
      const heroesList = newApiResponse.data.results;

      // If the length of the result is 100 (the maximum amount of characters info the API can send), call heroesLength again, but skip these 100 first heroes. Each result is concatenated in order to have a single array at the end.
      if (heroesList.length === 100) {
        const skipped = heroesToSkip + 100;
        return heroesList.concat(await heroesLength(newHeroesList, skipped));
      } else {
        return heroesList;
      }
    };

    const allHeroes = await heroesLength(apiResults, 0);
    console.log("nombre de héros: ", allHeroes.length);

    res.status(200).json(allHeroes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ask the API for a fixed number of characters, can also be used to look for a certain name. Can use these BODY parameters: "limit" (Number, between 1 and 100), skip (Integer) and name (String).
router.get(`/characters/search/`, async (req, res) => {
  try {
    const { limit, skip, name } = req.query;
    let requestURL = `${apiURL}/characters?apiKey=${process.env.MARVEL_API}`;
    if (limit) {
      requestURL += `&limit=${limit}`;
    }
    if (skip) {
      requestURL += `&skip=${skip}`;
    }
    if (name) {
      requestURL += `&name=${name}`;
    }

    const apiResponse = await axios.get(requestURL);
    res.status(200).json(apiResponse.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export routes
module.exports = router;
