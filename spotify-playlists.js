var qs = require("qs");
var axios = require("axios");

PAGE_SIZE = 50;
SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
SPOTIFY_SECRET_ID = process.env.SPOTIFY_SECRET_ID;
SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

getAuth = () => {
  return Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_SECRET_ID).toString(
    "base64"
  );
};

async function refreshToken() {
  var data = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: SPOTIFY_REFRESH_TOKEN,
  });
  let headers = {
    Authorization: `Basic ${getAuth()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  var config = {
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    headers: headers,
    data: data,
  };
  return axios(config) //
    .catch(function (error) {
      console.log(error);
    });
}

async function me(accessToken) {
  let headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  var config = {
    method: "get",
    url: "https://api.spotify.com/v1/me",
    headers: headers,
  };
  return axios(config) //
    .catch(function (error) {
      console.log(error);
    });
}

async function getPlaylistsPage(accessToken, offset) {
  let headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  var config = {
    method: "get",
    url: `https://api.spotify.com/v1/me/playlists?limit=${PAGE_SIZE}&offset=${offset}`,
    headers: headers,
  };
  return await axios(config) //
    .catch(function (error) {
      console.log(error);
    });
}

async function getPlaylists() {
  const tokenResponse = await refreshToken();
  const accessToken = tokenResponse.data.access_token;
  const userData = await me(accessToken);
  let userId = userData.data.id;

  current = 0;
  all_items = [];
  let page = await getPlaylistsPage(accessToken, current);
  total = page.data.total;

  while (current < total) {
    all_items.push(...page.data.items);
    current += PAGE_SIZE;
    page = await getPlaylistsPage(accessToken, current);
  }
  return all_items //
    .filter((pl) => pl.owner.id === userId) //
    .map((pl) => {
      return {
        name: pl.name,
        link: pl.href,
        img: pl.images[0].url,
      };
    });
}

module.exports.getPlaylists = getPlaylists;

// getPlaylists().then((p) => console.log(p));
