function getErrorMessage({ error, pageUrl, options }) {
  if (error.response) {
    return error.response.statusText;
  }

  switch (error.code) {
    case 'ENOTFOUND':
      return `The resource ${pageUrl} not found`;
    case 'ENOENT':
      return `Output directory ${options.output} does not exist`;
    default:
      return 'Something went wrong. Try again.';
  }
}

export default getErrorMessage;
