const process = require("process");
const core = require("@actions/core");
const fs = require("fs");
const runCommand = require("./run-command");
const spotify = require("./spotify-playlists");

const README_FILE_PATH = core.getInput("readme_path");
const GITHUB_TOKEN = core.getInput("gh_token");
core.setSecret(GITHUB_TOKEN);

const ITEMS_PER_ROW = 4;
const MAX_ROWS = 4;

const buildReadme = (previousContent, newContent) => {
  const tagToLookFor = `<!-- MY_PLAYLISTS:`;
  const closingTag = "-->";
  const tagNewlineFlag = null;
  const startOfOpeningTagIndex = previousContent.indexOf(
    `${tagToLookFor}START`
  );
  const endOfOpeningTagIndex = previousContent.indexOf(
    closingTag,
    startOfOpeningTagIndex
  );
  const startOfClosingTagIndex = previousContent.indexOf(
    `${tagToLookFor}END`,
    endOfOpeningTagIndex
  );
  if (
    startOfOpeningTagIndex === -1 ||
    endOfOpeningTagIndex === -1 ||
    startOfClosingTagIndex === -1
  ) {
    // Exit with error if comment is not found on the readme
    core.error(
      `Cannot find the comment tag on the readme:\n<!-- ${tagToLookFor}:START -->\n<!-- ${tagToLookFor}:END -->`
    );
    process.exit(1);
  }
  return [
    previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
    tagNewlineFlag ? "\n" : "",
    newContent,
    tagNewlineFlag ? "\n" : "",
    previousContent.slice(startOfClosingTagIndex),
  ].join("");
};

const commitReadme = async () => {
  try {
    core.info("Pushing changes...");
    // Getting config
    const committerUsername = core.getInput("committer_username");
    const committerEmail = core.getInput("committer_email");
    const commitMessage = core.getInput("commit_message");
    // Doing commit and push
    await runCommand("git", [
      "config",
      "--global",
      "user.email",
      committerEmail,
    ]);
    if (GITHUB_TOKEN) {
      core.info("TOKEN: " + GITHUB_TOKEN);
      core.info("REPO: " + process.env.GITHUB_REPOSITORY);
      // git remote set-url origin
      await runCommand("git", [
        "remote",
        "set-url",
        "origin",
        `https://${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`,
      ]);
    }
    await runCommand("git", [
      "config",
      "--global",
      "user.name",
      committerUsername,
    ]);
    await runCommand("git", ["add", README_FILE_PATH]);
    await runCommand("git", ["commit", "-m", commitMessage]);
    await runCommand("git", ["push"]);
    core.info("Readme updated successfully in the upstream repository");
  } catch (error) {
    core.error(error);
  }
};

spotify.getPlaylists().then((playlists) => {
  core.info("Pulling changes...");
  runCommand("git", ["config", "pull.rebase", "true"])
    .then(() => runCommand("git", ["pull"]))
    .then(() => {
      try {
        let render = (playlist) => {
          var img = playlist.img ? `<img align="left" width="150px" src="${playlist.img}"/>` : ``;
          return `<a href='${playlist.link}' target='_blank'>` + img + `</a>\n`;
        };

        let makeRow = (list) => {
          return list.reduce((acc, cur, index) => acc + render(cur), "\n");
        };
        let current = 0;
        let list = "";
        while (current < ITEMS_PER_ROW * MAX_ROWS) {
          list += makeRow(playlists.slice(current, current + ITEMS_PER_ROW));
          current += ITEMS_PER_ROW;
        }

        const readmeData = fs.readFileSync(README_FILE_PATH, "utf8");
        const newReadme = buildReadme(readmeData, list);
        if (newReadme !== readmeData) {
          fs.writeFileSync("README.md", newReadme);
          commitReadme().then(() => {
            process.exit(0);
          });
        } else {
          core.info("No change detected, skipping");
        }
      } catch (error) {
        core.error(error);
        process.exit(1);
      }
    });
});
