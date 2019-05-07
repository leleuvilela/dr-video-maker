const robots = {
  userInput: require("./robots/user-input"),
  text: require("./robots/text"),
  state: require("./robots/state"),
  image: require("./robots/image")
};

async function start() {
  // robots.userInput();
  // await robots.text();
  await robots.image();

  // const content = robots.state.load();
  // console.dir(content, { depth: null });
}

start();
