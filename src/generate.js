const chalk = require('chalk');
const findIconsetFolders = require('./ios/find-iconset-folders');
const generateIconsetIcons = require('./ios/generate-iconset-icons');
const findAndroidManifests = require('./android/find-android-manifests');
const generateManifestIcons = require('./android/generate-manifest-icons');
const validateParameters = require('./validate-parameters');

module.exports = async function generate(parameters) {
  //  Validate and coerce the parameters.
  const {
    sourceIcon,
    searchRoot,
    platforms,
  } = validateParameters(parameters || {});

  //  Set up the results object.
  const results = {
    iconsets: [],
    manifests: [],
    adaptiveIconManifests: [],
  };

  const iconSets = await findIconsetFolders(searchRoot);
  await Promise.all(iconSets.map(async (iconset) => {
    if (!platforms.includes('ios')) {
      return null;
    }
    console.log(`Found iOS iconset: ${iconset}...`);

    const { icons } = await generateIconsetIcons(sourceIcon, iconset);
    results.iconsets.push({ iconset, icons });
    icons.forEach((icon) => {
      console.log(`    ${chalk.green('✓')}  Generated icon ${icon}`);
    });
    console.log(`    ${chalk.green('✓')}  Updated Contents.json`);
    return null;
  }));

  const manifests = await findAndroidManifests(searchRoot);

  await Promise.all(manifests.map(async (manifest) => {
    if (!platforms.includes('android')) {
      return null;
    }
    // skip debug
    if(manifest.includes('debug')) {
      return null;
    }
    console.log(`Found Android Manifest: ${manifest}...`);

    const manResult = await generateManifestIcons(sourceIcon, manifest);
    results.manifests.push({ manifest, icons: manResult.icons });
    manResult.icons.forEach((icon) => {
      console.log(`    ${chalk.green('✓')}  Generated icon ${icon}`);
    });

    return null;
  }));
  return results;
};
