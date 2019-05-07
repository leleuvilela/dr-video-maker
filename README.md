# dr-video-maker

Projeto para fazer vídeos automaticamente

# Credentials format

## Algorithmia

File: `algorithmia.js`

```
module.exports = {
  apiKey: "sim90vW8AhynU76/DAFqj0NSiNA1"
};

```

## Watson Natural Language Understanding

File: `watson-nlu.js`

```
module.exports = {
  apikey: "tMBf9pDJH0uJv7IPlwpN82otwZIv7NiBSGoethnzuaOV",
  iam_apikey_description:
    "Auto-generated for key c666dcbb-56c6-4abd-88f8-4c108ceb6af9",
  iam_apikey_name: "Auto-generated service credentials",
  iam_role_crn: "crn:v1:bluemix:public:iam::::serviceRole:Manager",
  iam_serviceid_crn:
    "crn:v1:bluemix:public:iam-identity::a/acc5cf4713a04fb8916f2138889585e2::serviceid:ServiceId-15b3611f-8376-4500-80f4-18b826a39b2e",
  url: "https://gateway.watsonplatform.net/natural-language-understanding/api"
};

```

## Google Search

File: `google-search.js`

```
module.exports = {
  apiKey: "AIzaSyDxrunRLfLys1av7fqYJrjWAG1sxGZdsow",
  searchEngineId: "013135696213239610325:0p6xq648dn4"
};


```

## Youtube

File: `youtube.js`

```
module.exports = {
  web: {
    client_id:
      "668121262211-lpt0esadftg9cci4j24mhdmcuvbalpi4eb9n.apps.googleusercontent.com",
    project_id: "projectcontroller",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "Q64-_4Rm5s7XEF6lfpQ1jFVusa",
    redirect_uris: ["http://localhost:5000/oauth2callback"],
    javascript_origins: ["http://localhost:5000"]
  }
};
```
