
const fs = require('fs');

function isDirectory(path) {
  try {
      // Get the stats of the file/directory
      const stats = fs.statSync(path);
      // Check if it's a directory
      return stats.isDirectory();
  } catch (err) {
      // Handle the error, e.g., if the path does not exist
      console.error('Error checking if path is a directory:', err.message);
      return false;
  }
}

module.exports = isDirectory