const algorithmia = require("algorithmia");
const credentialsAlgorithmia = require("../credentials/algorithmia");

async function robot(content) {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  // breakContentIntoSentences(content)

  async function fetchContentFromWikipedia(content) {
    const algorithmiaAuthenticated = algorithmia(credentialsAlgorithmia.apiKey);
    const wikipediaAlgorithm = await algorithmiaAuthenticated
      .algo("web/WikipediaParser/0.1.2?timeout=300")
      .pipe(content.searchTerm);
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
    console.log(withoutDatesInParentheses);

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
}

module.exports = robot;
