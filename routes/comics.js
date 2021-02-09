// Import packages
const express = require("express");
const axios = require("axios");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

// Every request will be made to the marvel-api, so we're storing the URL into a constant in order to have a clean code.
const apiURL = process.env.MARVEL_API_URL;

// Search through the API comics database. Can contain one of these BODY parameters: limit (number of comics the the API has to return), skip (number of comics we're skipping, this must be inferior to the limit parameter) or title
router.get("/comics/search/", async (req, res) => {
  try {
    const { limit, skip, title } = req.query;
    let requestURL = `${apiURL}/comics?apiKey=${process.env.MARVEL_API}`;
    if (limit) {
      requestURL += `&limit=${limit}`;
    }
    if (skip) {
      requestURL += `&skip=${skip}`;
    }
    if (title) {
      requestURL += `&title=${title}`;
    }

    const apiResponse = await axios.get(requestURL);

    console.log(apiResponse.data);
    res.status(200).json(apiResponse.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ask the API every comics where a given character appears. Require this PARAMS parameter: "characterId" (String, mongoose ID).
// WARNING: The URL https://lereacteur-marvel-api.herokuapp.com/comics/5fcf9533d8a2480017b91a00?apiKey=shIhfcBh4f3vPv0F causes a comic to be send twice by the API.
router.get("/comics/charactersComics/:characterId", async (req, res) => {
  try {
    // Extract the QUERY params
    const { characterId } = req.params;
    console.log("id", characterId);

    // Ask the API for the comics
    const apiComicsResponse = await axios.get(
      `${apiURL}/comics/${characterId}?apiKey=${process.env.MARVEL_API}`
    );

    console.log(
      "url",
      `${apiURL}/comics/${characterId}?apiKey=${process.env.MARVEL_API}`
    );

    const comics = apiComicsResponse.data.comics;
    res.status(200).json(comics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export routes
module.exports = router;
