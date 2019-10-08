import path from 'path';

function getContentType(url) {
  const extname = path.extname(url);

  /* eslint-disable key-spacing */
  const contentTypes = {
    '.jpeg': 'image/jpeg',
    '.jpg' : 'image/jpeg',
    '.gif' : 'image/gif',
    '.ico' : 'image/x-icon',
    '.png' : 'image/png',
    '.svg' : 'image/svg+xml',
    '.webp': 'image/webp',
    '.css' : 'text/css',
    '.js'  : 'application/javascript',
  };
  /* eslint-enable */

  const defaultContentType = 'text/plain';
  const contentType = contentTypes[extname];

  if (!contentType) return defaultContentType;
  return contentType;
}

export default getContentType;
