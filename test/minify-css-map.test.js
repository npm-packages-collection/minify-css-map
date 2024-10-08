import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';

const DIRECTORY_META_NAME = fileURLToPath(new URL('.', import.meta.url));
const TEST_DIRECTORY = path.join(DIRECTORY_META_NAME, 'css');

try {
  if (fs.existsSync(TEST_DIRECTORY)) {
    fs.rmSync(TEST_DIRECTORY, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIRECTORY, { recursive: true });
} catch (err) {}

// Sample CSS content to test
const basicCssContent =
`body {
  font-size: 16px;
  background-color: #fff;
}`;

const commentedCssContent =
`/* This is a comment */

${basicCssContent}`;

const variablesInCssContent =
`:root {
  --main-bg-color: #fff;
}

body {
  font-size: 16px;
  background-color: var(--main-bg-color);
}`;

const combinedCssContent =
`/* This is a comment */
${variablesInCssContent}`;

/**
 * Create test directories and add sample CSS files.
 */
function setupTestEnvironment(dir, cssContent) {
  const dirPath = path.join(TEST_DIRECTORY, dir);

  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the CSS file
    const cssFilePath = path.join(dirPath, 'styles.css');
    fs.writeFileSync(cssFilePath, cssContent);
  } catch (err) {}
}

/**
 * Clean up the test environment (delete generated files and directories).
 */
function cleanupTestEnvironment() {
  try {
    if (fs.existsSync(TEST_DIRECTORY)) {
      fs.rmSync(TEST_DIRECTORY, { recursive: true, force: true });
    }
  } catch (err) {}
}

/**
 * Normalize CSS strings by removing unnecessary spaces and trimming.
 * This will help with consistent comparisons between expected and actual values.
 */
function normalizeCss(css) {
  return css.replace(/\s+/g, ' ').replace(/\s*([{}:;])\s*/g, '$1').trim();
}

describe('CSS Minification with Source Maps', function () {
  after(function () {
    cleanupTestEnvironment();
  });

  describe('Simple CSS', function () {
    before(function () {
      setupTestEnvironment('simple', basicCssContent);
    });

    it('should minify simple CSS', function (done) {
      exec(`node bin/minify-css-map.mjs ${TEST_DIRECTORY}`, (error, stdout, stderr) => {
        if (error) {
          return done(new Error(`Error executing minification: ${stderr}`));
        }

        const minCssPath = path.join(TEST_DIRECTORY, 'simple', 'styles.min.css');
        expect(fs.existsSync(minCssPath)).to.be.true;

        const minifiedCss = fs.readFileSync(minCssPath, 'utf-8');
        expect(normalizeCss(minifiedCss)).to.include(normalizeCss('body{font-size:16px;background-color:#fff}'));

        done();
      });
    });

    it('should generate a valid source map for simple CSS', function (done) {
      exec(`node bin/minify-css-map.mjs ${TEST_DIRECTORY}`, (error, stdout, stderr) => {
        if (error) {
          return done(new Error(`Error executing minification: ${stderr}`));
        }

        const mapPath = path.join(TEST_DIRECTORY, 'simple', 'styles.css.map');
        expect(fs.existsSync(mapPath)).to.be.true;

        const sourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

        // Check the source map structure
        expect(sourceMap.version).to.equal(3);
        expect(sourceMap.file).to.equal('styles.css');
        expect(sourceMap.sources).to.deep.equal(['styles.css']);
        expect(sourceMap.mappings).to.be.a('array');

        done();
      });
    });
  });

  describe('Commented CSS', function () {
    before(function () {
      setupTestEnvironment('comments', commentedCssContent);
    });

    it('should minify commented CSS', function (done) {
      exec(`node bin/minify-css-map.mjs ${TEST_DIRECTORY}`, (error, stdout, stderr) => {
        if (error) {
          return done(new Error(`Error executing minification: ${stderr}`));
        }

        const minCssPath = path.join(TEST_DIRECTORY, 'comments', 'styles.min.css');
        expect(fs.existsSync(minCssPath)).to.be.true;

        const minifiedCss = fs.readFileSync(minCssPath, 'utf-8');
        expect(normalizeCss(minifiedCss)).to.not.include('/* This is a comment */');
        expect(normalizeCss(minifiedCss)).to.include(normalizeCss('body{font-size:16px;background-color:#fff}'));

        done();
      });
    });

    it('should generate a valid source map for commented CSS', function (done) {
      exec(`node bin/minify-css-map.mjs ${TEST_DIRECTORY}`, (error, stdout, stderr) => {
        if (error) {
          return done(new Error(`Error executing minification: ${stderr}`));
        }

        const mapPath = path.join(TEST_DIRECTORY, 'comments', 'styles.css.map');
        expect(fs.existsSync(mapPath)).to.be.true;

        const sourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

        // Check the source map structure
        expect(sourceMap.version).to.equal(3);
        expect(sourceMap.file).to.equal('styles.css');
        expect(sourceMap.sources).to.deep.equal(['styles.css']);
        expect(sourceMap.mappings).to.be.a('array');

        done();
      });
    });
  });

  describe('CSS with Variables', function () {
    before(function () {
      setupTestEnvironment('variables', variablesInCssContent);
    });

    it('should process CSS with variables and minify it', function (done) {
      exec(`node bin/minify-css-map.mjs ${TEST_DIRECTORY}`, (error, stdout, stderr) => {
        if (error) {
          return done(new Error(`Error executing minification: ${stderr}`));
        }

        const minCssPath = path.join(TEST_DIRECTORY, 'variables', 'styles.min.css');
        expect(fs.existsSync(minCssPath)).to.be.true;

        const minifiedCss = fs.readFileSync(minCssPath, 'utf-8');
        expect(normalizeCss(minifiedCss)).to.include(normalizeCss(':root{--main-bg-color:#fff}'));
        expect(normalizeCss(minifiedCss)).to.include(normalizeCss('body{font-size:16px;background-color:var(--main-bg-color)}'));

        done();
      });
    });

    it('should generate a valid source map for CSS with variables', function (done) {
      exec(`node bin/minify-css-map.mjs ${TEST_DIRECTORY}`, (error, stdout, stderr) => {
        if (error) {
          return done(new Error(`Error executing minification: ${stderr}`));
        }

        const mapPath = path.join(TEST_DIRECTORY, 'variables', 'styles.css.map');
        expect(fs.existsSync(mapPath)).to.be.true;

        const sourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

        // Check the source map structure
        expect(sourceMap.version).to.equal(3);
        expect(sourceMap.file).to.equal('styles.css');
        expect(sourceMap.sources).to.deep.equal(['styles.css']);
        expect(sourceMap.mappings).to.be.a('array');

        done();
      });
    });
  });

  describe('Combined CSS', function () {
    before(function () {
      setupTestEnvironment('combined', combinedCssContent);
    });

    it('should minify combined CSS', function (done) {
      exec(`node bin/minify-css-map.mjs ${TEST_DIRECTORY}`, (error, stdout, stderr) => {
        if (error) {
          return done(new Error(`Error executing minification: ${stderr}`));
        }

        const minCssPath = path.join(TEST_DIRECTORY, 'combined', 'styles.min.css');
        expect(fs.existsSync(minCssPath)).to.be.true;

        const minifiedCss = fs.readFileSync(minCssPath, 'utf-8');
        expect(normalizeCss(minifiedCss)).to.not.include('/* This is a comment */');
        expect(normalizeCss(minifiedCss)).to.include(normalizeCss(':root{--main-bg-color:#fff}'));
        expect(normalizeCss(minifiedCss)).to.include(normalizeCss('body{font-size:16px;background-color:var(--main-bg-color)}'));

        done();
      });
    });

    it('should generate a valid source map for combined CSS', function (done) {
      exec(`node bin/minify-css-map.mjs ${TEST_DIRECTORY}`, (error, stdout, stderr) => {
        if (error) {
          return done(new Error(`Error executing minification: ${stderr}`));
        }

        const mapPath = path.join(TEST_DIRECTORY, 'combined', 'styles.css.map');
        expect(fs.existsSync(mapPath)).to.be.true;

        const sourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

        // Check the source map structure
        expect(sourceMap.version).to.equal(3);
        expect(sourceMap.file).to.equal('styles.css');
        expect(sourceMap.sources).to.deep.equal(['styles.css']);
        expect(sourceMap.mappings).to.be.a('array');

        done();
      });
    });
  });

  it('should clean up the test environment', function () {
    after(() => {
      // After the cleanup, the directory should no longer exist
      expect(fs.existsSync(TEST_DIRECTORY)).to.be.false;
    });
  });
});
