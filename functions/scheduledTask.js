const {Octokit} = require("@octokit/rest");
const axios = require("axios");

// Codificar en Base64
const clientId = "76f4c81711394c61be13104af708f40f";
const clientSecret = "ca263b62099143e3a441f395960fb40b";
const autHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

const refreshToken = "AQA5E34DxwGLy3S1-kghE4C-wazRB" +
                      "FMb12AkgTViTXMLCHaghiwbYhQQNM" +
                      "dnQ_GxVZ2VaBIXa-0Ct8dkXKJPPAo" +
                      "ok6YZi6DY6sFqdr8xusHlpQub94Vb" +
                      "QlYZCavDYM6_MOs";

const playlistId = "7eTz62GltegWwReOgEPPAc";

// Github vars
const githubToken = "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";
const owner = "WeddingInvitations";
const repo = "angelayfernando_wedding";
const filePath = "www/index.html";


exports.updateSpotifyLink = async (req, res) => {
  try {
    // Obtener nuevo token de acceso a Spotify
    // const token = 'await getSpotifyToken();'
    const token = await getSpotifyToken(refreshToken);

    // // Paso 1: Actualizar la playlist como colaborativa en Spotify
    try {
      await axios.put(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          {collaborative: true},
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
      );
    } catch (spotifyError) {
      return res.status(500).send("Error actualizando la playlist");
    }

    // Paso 2: Obtener playlist, incluyendo el enlace colaborativo
    const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
    );

    if (response.status === 200) {
      console.log("Response Data:", response);
      const playlistUrl = response.data.external_urls.spotify;
      res.status(200).send("Enlace colaborativo de la playlist:", playlistUrl);
    } else {
      res.status(500).error("Error al obtener la playlist:", response.status);
    }


    // Paso 2: Actualizar el HTML en Git con el nuevo enlace de la playlist
    const newLink = `https://open.spotify.com/playlist/${playlistId}`;

    try {
      await updateGitHubFile(newLink);
      res.status(200).send("Archivo HTML actualizado en GitHub");
    } catch (githubError) {
      return res.status(500).send("Error actualizando el HTML en GitHub");
    }

    // Si todo se ejecutó correctamente
    res.status(200).send("Lista colaborativa OK");
  } catch (error) {
    if (error.response) {
      res.status(500).send(`Status: ${error.response.status},` +
        `: ${JSON.stringify(error.response.data)}`);
    } else {
      res.status(500).send(`Error inesperado: ${error.message}`);
    }
  }
};


/**
 * Obtiene el token de acceso de Spotify utilizando authorization code.
 * @param {string} refreshToken - El código de autorización recibido de Spotify.
 * @return {string} Token de acceso de Spotify.
 */
async function getSpotifyToken(refreshToken) {
  const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Authorization": `Basic ${autHeader}`,
        },
      },
  );
  console.log("Token de acceso obtenido:", response.data.access_token);
  return response.data.access_token;
}

/**
 * Actualiza el archivo HTML en GitHub con el nuevo enlace de la playlist.
 * @param {string} newLink - El nuevo enlace de la playlist de Spotify.
 */
async function updateGitHubFile(newLink) {
  const octokit = new Octokit({auth: githubToken});

  const {data: fileData} = await octokit.repos.getContent({
    owner,
    repo,
    path: filePath,
  });

  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  const updatedContent = content.replace(
      /https:\/\/open\.spotify\.com\/playlist\/.*?"/,
      `${newLink}"`,
  );

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: "Actualizando el enlace de la playlist de Spotify",
    content: Buffer.from(updatedContent).toString("base64"),
    sha: fileData.sha,
  });
}
