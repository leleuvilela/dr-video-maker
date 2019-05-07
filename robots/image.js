const { google } = require("googleapis");
const state = require("./state");
const imageDownloader = require("image-downloader");

const googleSearchCredentials = require("../credentials/google-search");

const customSearch = google.customsearch("v1");

async function robot() {
  const content = state.load();

  // await fetchImagesOfAllSentences(content);

  await downloadAllImages(content);

  // state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (const sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await fetchGoogleAndReturnImagesLinks(query);

      sentence.googleSearchQuery = query;
    }
  }

  async function fetchGoogleAndReturnImagesLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      searchType: "image",
      imgSize: "huge",
      num: 2
    });

    const imagesUrl = response.data.items.map(item => item.link);

    return imagesUrl;
  }

  async function downloadAllImages(content) {
    content.downloadedImages = [];
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      const images = content.sentences[sentenceIndex].images;

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex];

        try {
          if (content.downloadedImages.includes(imageUrl)) {
            throw new Error("Imagem já baixada");
          }
          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageUrl);
          console.log(`foi ${imageUrl}`);
          break;
        } catch (error) {
          console.log(`deu ruim ${imageUrl}: ${error}`);
        }
      }
    }
  }

  async function downloadAndSave(url, filename) {
    return imageDownloader.image({ url, dest: `./content/${filename}` });
  }
}

module.exports = robot;
