import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIRECTORY_META_NAME = fileURLToPath(new URL('.', import.meta.url));

// Get the directory to process from command-line arguments
const targetDirectory = process.argv[2] || DIRECTORY_META_NAME;

/**
 * Minifies a CSS string by removing whitespace and comments.
 * @param {string} css - The CSS content to minify.
 * @returns {string} - The minified CSS.
 */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove comments
    .replace(/\s+/g, ' ')              // Replace multiple spaces with a single space
    .replace(/\s*([{}:;])\s*/g, '$1')  // Remove spaces around {}, :, and ;
    .replace(/;}/g, '}');              // Remove unnecessary semicolons before }
}

/**
 * Generates a CSS source map.
 * @param {string} cssContent - The original CSS content.
 * @param {string} cssFileName - The name of the CSS file.
 * @returns {object} - The source map object.
 */
function generateSourceMap(cssContent, cssFileName) {
  const lines = cssContent.split('\n');
  const mapEntries = lines.map((line, index) => ({
    original: line,
    generated: `${index + 1}:0`, // Line number and column
  }));

  return {
    version: 3,
    file: cssFileName,
    sources: [cssFileName], // Name of the original CSS file
    mappings: mapEntries,
  };
}

/**
 * Minifies a CSS file and creates a .min.css and a .css.map file.
 * @param {string} cssFilePath - The path to the CSS file to minify.
 */
function minifyCssFile(cssFilePath) {
  const cssContent = fs.readFileSync(cssFilePath, 'utf-8');

  // Minify the CSS content
  const minifiedCss = minifyCss(cssContent);

  // Generate output paths
  const cssDir = path.dirname(cssFilePath);
  const baseFileName = path.basename(cssFilePath, '.css');
  const minCssFilePath = path.join(cssDir, `${baseFileName}.min.css`);
  const mapFilePath = path.join(cssDir, `${baseFileName}.css.map`);

  // Write the minified CSS file
  fs.writeFileSync(minCssFilePath, minifiedCss);

  // Generate and write the source map
  const sourceMap = generateSourceMap(cssContent, `${baseFileName}.css`);
  fs.writeFileSync(mapFilePath, JSON.stringify(sourceMap, null, 2));

  console.log(`Minified ${cssFilePath} -> ${minCssFilePath}`);
}

/**
 * Recursively processes the project directory to find and minify CSS files.
 * @param {string} dirPath - The base directory path.
 */
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.css') && !file.endsWith('.min.css')) {
      // Minify and create .min.css and .css.map
      minifyCssFile(filePath);
    }
  });
}

/**
 * Starts the minification process.
 */
function startMinification() {
  const rootDirectory = targetDirectory;
  console.log('Starting CSS minification in:', rootDirectory);

  // Ensure the target directory exists before processing
  if (!fs.existsSync(rootDirectory)) {
    console.error('Target directory does not exist:', rootDirectory);
    return;
  }

  // Process the entire directory
  processDirectory(rootDirectory);

  console.log('CSS minification completed.');
}

// Run the script
startMinification();
