
# CSS Minify and Map NPM Package

Welcome to the CSS Minify and Map NPM package! This tool is designed to minify CSS files while also generating source maps, providing a streamlined way to optimize your web application's performance.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [CLI Usage](#cli-usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The CSS Minify and Map NPM package provides a simple way to minify your CSS files and automatically generate source maps. It removes unnecessary whitespace, comments, and optimizes CSS files for better performance, ensuring that the original file structure can still be traced using the accompanying source maps.

## Features

- Minifies CSS files by removing comments and redundant spaces.
- Automatically generates source maps to maintain readability for debugging.
- Recursively processes entire directories to find and minify all `.css` files.
- CLI integration for ease of use in any project.

## Installation

To install the package, use npm:

```bash
npm install css-minify-map
```

Or use yarn:

```bash
yarn add css-minify-map
```

## Usage

### JavaScript API

You can use the CSS Minify and Map package programmatically within your Node.js projects.

```javascript
import { minifyCssFile } from 'css-minify-map';

// Minify a specific CSS file
minifyCssFile('/path/to/styles.css');
```

### CLI Usage

The package also provides a command-line interface for quick usage.

```bash
npx css-minify-map <target-directory>
```

This will recursively process all `.css` files in the given directory and create `.min.css` and `.css.map` files.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
