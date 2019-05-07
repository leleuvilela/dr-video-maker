const state = require("./state");
const express = require("express");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const youtube = google.youtube({ version: "v3" });
const fs = require("fs");

async function robot() {
  const content = state.load();

  await authenticateWithOAuth();
  const videoInformation = await uploadVideo(content);
  await uploadThumbnail(videoInformation);

  async function authenticateWithOAuth() {
    const webServer = await startWebServer();
    const OAuthClient = await createOAuthClient();
    requestUserConsent(OAuthClient);
    const authorizationToken = await waitForGoogleCallback(webServer);
    await requestGoogleForAccessTokens(OAuthClient, authorizationToken);
    setGlobalGoogleAuthentication(OAuthClient);
    await stopWebServer(webServer);

    async function startWebServer() {
      return new Promise((resolve, reject) => {
        const port = 5000;
        const app = express();

        const server = app.listen(port, () => {
          console.log(`> Servidor ligado: http://localhost:${port}`);

          resolve({ app, server });
        });
      });
    }

    async function createOAuthClient() {
      const crednetials = require("../credentials/youtube");

      const OAuthClient = new OAuth2(
        crednetials.web.client_id,
        crednetials.web.client_secret,
        crednetials.web.redirect_uris[0]
      );

      return OAuthClient;
    }

    function requestUserConsent(OAuthClient) {
      const consentUrl = OAuthClient.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube"]
      });

      console.log(
        `> Por favor, aceite os termos de consentimento: ${consentUrl}`
      );
    }

    async function waitForGoogleCallback(webServer) {
      return new Promise((resolve, reject) => {
        console.log("> Esperando pelo usuario aceitar os termos...");

        webServer.app.get("/oauth2callback", (req, res) => {
          const authCode = req.query.code;
          console.log(`> Token: ${authCode}`);

          res.send("<h1>Já pode fechar essa aba. :3</h1>");
          resolve(authCode);
        });
      });
    }

    async function requestGoogleForAccessTokens(
      OAuthClient,
      authorizationToken
    ) {
      return new Promise((resolve, reject) => {
        OAuthClient.getToken(authorizationToken, (error, tokens) => {
          if (error) return reject(error);

          console.log("> Tokens de acesso recebidos: ");
          console.log(tokens);
          OAuthClient.setCredentials(tokens);
          resolve();
        });
      });
    }

    function setGlobalGoogleAuthentication(OAuthClient) {
      google.options({
        auth: OAuthClient
      });
    }

    async function stopWebServer(webServer) {
      return new Promise((resolve, reject) => {
        webServer.server.close(() => {
          resolve();
        });
      });
    }
  }

  async function uploadVideo(content) {
    const videoFilePath = "./content/output.mp4";
    const videoFileSize = fs.statSync(videoFilePath).size;
    const videoTitle = `${content.prefix} ${content.searchTerm}`;
    const videoTags = [content.searchTerm, ...content.sentences[0].keywords];
    const videoDescription = content.sentences
      .map(sentence => {
        return sentence.text;
      })
      .join("\n\n");

    const requestParameters = {
      part: "snippet, status",
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: videoTags
        },
        status: {
          privacyStatus: "unlisted"
        }
      },
      media: {
        body: fs.createReadStream(videoFilePath)
      }
    };

    const youtubeResponse = await youtube.videos.insert(requestParameters, {
      onUploadProgress: onUploadProgress
    });

    console.log(
      `> Video disponível em: https://youtu.be/${youtubeResponse.data.id}`
    );
    return youtubeResponse.data;

    function onUploadProgress(event) {
      const progress = Math.round((event.bytesRead / videoFileSize) * 100);
      console.log(`> ${progress}% completo`);
    }
  }

  async function uploadThumbnail(videoInformation) {
    const videoId = videoInformation.id;
    const videoThumbnailFilePath = "./content/youtube-thumbnail.jpg";

    const requestParameters = {
      videoId,
      media: {
        mimeType: "image/jpeg",
        body: fs.createReadStream(videoThumbnailFilePath)
      }
    };

    const youtubeResponse = await youtube.thumbnails.set(requestParameters);
    console.log(`> Thumbnail upada!`);
  }

  state.save(content);
}
module.exports = robot;
