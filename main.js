const fs = require("fs");
const path = require("path");
const winOpacity = require(".");

if (process.argv.includes("list")) {
  winOpacity.getWindows().forEach((element) => {
    console.log(winOpacity.getOpacity(element), element);
  });
  return;
}

/**
 * Applies the desired opacity levels to different windows
 * @param {object[]} config The different opacity settings
 */
const applyOpacities = (config) => {
  // Parse the patterns into regular expressions
  const patterns = config.windows.map(({ pattern, opacity }) => ({
    pattern: new RegExp(pattern),
    opacity,
  }));

  // // Grab all of the visible windows
  const windows = winOpacity.getWindows();
  for (const window of windows) {
    for (const { opacity, pattern } of patterns) {
      // Apply the desired opacity to a window on the first pattern it matches
      if (pattern.test(window.title)) {
        winOpacity.setOpacity(window, opacity);
        if (config.debug)
          console.log(
            new Date().toLocaleTimeString(),
            `- opacity:${opacity} - title:${window.title}`
          );
        break;
      }
    }
  }
};

const getConfig = () => {
  let configPath = "config.json";
  if (!fs.existsSync("config.json")) {
    configPath = path.join(__dirname, "config.json");
    // Copy the example config if a user config does not exist
    if (!fs.existsSync(configPath)) {
      fs.copyFileSync(path.join(__dirname, "config.example.json"), configPath);
    }
  }
  console.log("Example config: ", path.join(__dirname, "config.example.json"));
  console.log("Current config: ", path.resolve(configPath));

  // Read the configuration in fresh in case the user updated it
  const configSource = fs.readFileSync(configPath).toString();
  const config = JSON.parse(configSource);
  if (config.debug) console.log("Config: ", configSource);
  return config;
};

/**
 * Periodically update the opacity of windows
 */
const poll = ((config) => {
  try {
    // If the user has specified a polling interval,
    // wait that long before applying it again
    t = config.pollInMilliseconds > 0 ? config.pollInMilliseconds : 1000;
    setInterval(() => {
      // Set the opacity of any configured windows
      applyOpacities(config);
    }, t);
  } catch (e) {
    console.log(e);
    fs.appendFileSync(path.join(__dirname, "error.log"), e);
  }
})(getConfig());
