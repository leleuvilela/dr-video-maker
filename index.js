const robots = {
  userInput: require("./robots/user-input"),
  text: require("./robots/text"),
  state: require("./robots/state"),
  image: require("./robots/image"),
  video: require("./robots/video"),
  youtube: require("./robots/youtube")
};

async function start() {
  robots.userInput();
  await robots.text();
  await robots.image();
  await robots.video();
  await robots.youtube();

  // const content = robots.state.load();
  // console.dir(content, { depth: null });
}

start();
