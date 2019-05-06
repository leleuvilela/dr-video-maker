const algorithmia = require("algorithmia");
const credentialsAlgorithmia = require("../credentials/algorithmia");
const sentenceBoundaryDetection = require("sbd");

const credentialsWatson = require("../credentials/watson-nlu");
const NaturalLanguageUnderstandingV1 = require("ibm-watson/natural-language-understanding/v1.js");

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: credentialsWatson.apikey,
  version: "2018-04-05",
  url: "https://gateway.watsonplatform.net/natural-language-understanding/api/"
});

const state = require("./state");

async function robot() {
  const content = state.load();

  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);
  limitMaximumSentences(content);
  await fetchKeywordsOfAllSentences(content);

  state.save(content);

  async function fetchContentFromWikipedia(content) {
    const algorithmiaAuthenticated = algorithmia(credentialsAlgorithmia.apiKey);
    const wikipediaAlgorithm = await algorithmiaAuthenticated
      .algo("web/WikipediaParser/0.1.2?timeout=300")
      .pipe({ lang: content.language, articleName: content.searchTerm });
    const wikipediaContent = wikipediaAlgorithm.get();

    content.sourceContentOriginal = wikipediaContent.content;
  }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(
      content.sourceContentOriginal
    );
    const withoutDatesInParentheses = removeDatesInParentheses(
      withoutBlankLinesAndMarkdown
    );

    content.sourceContentSanitized = withoutDatesInParentheses;

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split("\n");
      const withoutBlankLinesAndMarkdown = allLines.filter(line => {
        if (line.trim().length === 0 || line.trim().startsWith("=")) {
          return false;
        }
        return true;
      });
      return withoutBlankLinesAndMarkdown.join(" ");
    }

    function removeDatesInParentheses(text) {
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, "").replace(/  /, " ");
    }
  }

  function breakContentIntoSentences(content) {
    content.sentences = [];

    const sentences = sentenceBoundaryDetection.sentences(
      content.sourceContentSanitized
    );

    sentences.forEach(sentence => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      });
    });
  }

  function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  }

  async function fetchKeywordsOfAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await fetchWatsonAndReturnKeyWords(sentence.text);
    }
  }

  async function fetchWatsonAndReturnKeyWords(sentence) {
    return new Promise((resolve, reject) => {
      nlu.analyze(
        {
          text: sentence,
          features: {
            keywords: {}
          }
        },
        (error, response) => {
          if (error) {
            throw error;
          }

          const keywords = response.keywords.map(keyword => keyword.text);
          resolve(keywords);
        }
      );
    });
  }
}

module.exports = robot;
