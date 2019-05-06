const readline = require("readline-sync");
const state = require("./state");

function robot() {
  const content = {
    maximumSentences: 7
  };

  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();
  content.language = askAndReturnLanguage();

  state.save(content);

  function askAndReturnSearchTerm() {
    return readline.question("Digite um termo da Wikipedia para pesquisar: ");
  }

  function askAndReturnPrefix() {
    const prefixes = ["Quem é", "O que é", "A história do"];
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
