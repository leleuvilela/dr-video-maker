const readline = require("readline-sync");
const state = require("./state");

function robot() {
  const content = {
    maximumSentences: 7
  };

  content.language = askAndReturnLanguage();
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  state.save(content);

  function askAndReturnSearchTerm() {
    return readline.question("Digite um termo da Wikipedia para pesquisar: ");
  }

  function askAndReturnPrefix() {
    let prefixes;
    if (content.language == "pt") {
      prefixes = ["Quem é", "O que é", "A história do"];
    } else {
      prefixes = ["Who is", "What is", "History of"];
    }
    const selectedPrefixIndex = readline.keyInSelect(prefixes);

    return prefixes[selectedPrefixIndex];
  }

  function askAndReturnLanguage() {
    const languages = ["pt", "en"];
    const selectedLanguageIndex = readline.keyInSelect(languages);

    return languages[selectedLanguageIndex];
  }
}
module.exports = robot;
