const path = require('path');
const mkdirp = require('mkdirp');
const imagemagickCli = require('imagemagick-cli');
const androidManifestIcons = require('./AndroidManifest.icons.json');

const BORDER_SIZE = 15;

async function resizeImage(source, target, size) {
  return imagemagickCli.exec(`convert "${source}" -resize ${size} -strip "${target}"`);
  // return imagemagickCli.exec(`convert "${source}" -resize ${size} -gravity center -bordercolor white -border ${BORDER_SIZE}x${BORDER_SIZE} -background white -strip "${target}"`);
};

//  Generate Android Manifest icons given a manifest file.
module.exports = async function generateManifestIcons(sourceIcon, manifest) {
  //  Create the object we will return.
  const results = {
    icons: [],
  };

  //  We've got the manifest file, get the parent folder.
  const manifestFolder = path.dirname(manifest);

  //  Generate each image in the full icon set, updating the contents.
  await Promise.all(androidManifestIcons.icons.map(async (icon) => {
    const targetPath = path.join(manifestFolder, icon.path);
    // const iconSize = icon.size.split("x").map(v => Math.round(parseInt(v) - BORDER_SIZE * 2)).join("x");

    //  Each icon lives in its own folder, so we'd better make sure that folder
    //  exists.
    await mkdirp(path.dirname(targetPath));
    results.icons.push(icon.path);

    return resizeImage(sourceIcon, targetPath, icon.size);
  }));
  //  Before writing the contents file, sort the contents (otherwise
  //  they could be in a different order each time).
  results.icons.sort();
  return results;
};
