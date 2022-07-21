// This file is used only for manifest version 3

// Represents if importAllScripts has been run
// eslint-disable-next-line
let scriptsLoaded = false;

const testMode = process.env.IN_TEST;

const loadTimeLogs = [];

// eslint-disable-next-line import/unambiguous
function tryImport(...fileNames) {
  try {
    const startTime = new Date().getTime();
    // eslint-disable-next-line
    importScripts(...fileNames);
    const endTime = new Date().getTime();
    loadTimeLogs.push({
      name: fileNames[0],
      value: endTime - startTime,
      children: [],
      startTime,
      endTime,
    });

    return true;
  } catch (e) {
    console.error(e);
  }

  return false;
}

function importAllScripts() {
  // Bail if we've already imported scripts
  if (scriptsLoaded) {
    return;
  }

  const files = [];

  // In testMode individual files are imported, this is to help capture load time stats
  const loadFile = (fileName) => {
    if (testMode) {
      tryImport(fileName);
    } else {
      files.push(fileName);
    }
  };

  const startImportScriptsTime = Date.now();
  // value of applyLavaMoat below is dynamically replaced at build time with actual value
  const applyLavaMoat = process.env.APPLY_LAVAMOAT;

  loadFile('./globalthis.js');
  loadFile('./sentry-install.js');

  // Always apply LavaMoat in e2e test builds, so that we can capture initialization stats
  if (testMode || applyLavaMoat) {
    loadFile('./runtime-lavamoat.js');
    loadFile('./lockdown-more.js');
    loadFile('./policy-load.js');
  } else {
    loadFile('./init-globals.js');
    loadFile('./lockdown-install.js');
    loadFile('./lockdown-run.js');
    loadFile('./lockdown-more.js');
    loadFile('./runtime-cjs.js');
  }

  // Mark scripts as loaded
  scriptsLoaded = true;

  // This environment variable is set to a string of comma-separated relative file paths.
  const rawFileList = process.env.FILE_NAMES;
  const fileList = rawFileList.split(',');
  fileList.forEach((fileName) => loadFile(fileName));

  // Import all required resources
  tryImport(...files);

  const endImportScriptsTime = Date.now();

  // for performance metrics/reference
  console.log(
    `SCRIPTS IMPORT COMPLETE in Seconds: ${
      (Date.now() - startImportScriptsTime) / 1000
    }`,
  );

  // In testMode load time logs are output to console
  if (testMode) {
    console.log(
      `Time for each import: ${JSON.stringify(
        {
          name: 'Total',
          children: loadTimeLogs,
          startTime: startImportScriptsTime,
          endTime: endImportScriptsTime,
          value: endImportScriptsTime - startImportScriptsTime,
          version: 1,
        },
        undefined,
        '    ',
      )}`,
    );
  }
}

// eslint-disable-next-line no-undef
self.addEventListener('install', importAllScripts);

/*
 * Message event listener below loads script if they are no longer available.
 * chrome below needs to be replaced by cross-browser object,
 * but there is issue in importing webextension-polyfill into service worker.
 * chrome does seems to work in at-least all chromium based browsers
 */
// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(importAllScripts);
