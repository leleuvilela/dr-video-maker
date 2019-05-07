const algorithmia = require("algorithmia");
const credentialsAlgorithmia = require("../credentials/algorithmia");
const sentenceBoundaryDetection = require("sbd");
const summary = require("lexrank.js");
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
    try {
      const algorithmiaAuthenticated = algorithmia(
        credentialsAlgorithmia.apiKey
      );
      const wikipediaAlgorithm = await algorithmiaAuthenticated
        .algo("web/WikipediaParser/0.1.2?timeout=300")
        .pipe({ lang: content.language, articleName: content.searchTerm });
      const wikipediaContent = wikipediaAlgorithm.get();
      // console.log(wikipediaContent.content);
      content.sourceContentOriginal = wikipediaContent.content;
    } catch (error) {
      console.log(error);
    }
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
      const withoutBlankLinesAndMarkdown = allLines.filter(
        line => !(line.trim().length === 0 || line.trim().startsWith("="))
      );
      return withoutBlankLinesAndMarkdown.join(" ");
    }

    function removeDatesInParentheses(text) {
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, "").replace(/  /, " ");
    }
  }

  async function breakContentIntoLexicalRankedSentences(content) {
    return new Promise((resolve, reject) => {
      content.sentences = [];

      summary.lexrank(content.sourceContentSanitized, (error, result) => {
        if (error) {
          throw error;
          return reject(error);
        }

        sentences = result[0].sort(function(a, b) {
          return b.weight.average - a.weight.average;
        });

        console.log(sentences);

        sentences.forEach(sentence => {
          content.sentences.push({
            text: sentence.text,
            keywords: [],
            images: []
          });
        });

        resolve(sentences);
      });
    });
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
      sentence.keywords = await fetchWatsonAndReturnKeyWords(
        sentence.text,
        content.language
      );
    }
  }

  async function fetchWatsonAndReturnKeyWords(sentence, language) {
    return new Promise((resolve, reject) => {
      nlu.analyze(
        {
          text: sentence,
          features: {
            keywords: {}
          },
          language: language
        },
        (error, response) => {
          if (error) reject(error);

          const keywords = response.keywords.map(keyword => keyword.text);
          resolve(keywords);
        }
      );
    });
  }
}

module.exports = robot;
