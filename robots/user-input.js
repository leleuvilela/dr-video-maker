const readline = require("readline-sync");

function robot(content) {
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  function askAndReturnSearchTerm() {
    return readline.question("Digite um termo da Wikipedia para pesquisar: ");
  }

  function askAndReturnPrefix() {
    const prefixes = ["Quem é", "O que é", "A história do"];
    const selectedPrefixIndex = readline.keyInSelect(prefixes);

    return prefixes[selectedPrefixIndex];
  }
}
module.exports = robot;
