const getErrorMessage = (error) => {
  if (error.message) {
    return error.message;
  }

  if (error.response) {
    if (error.response.statusText) {
      return error.response.statusText;
    }
  }

  return 'Something went wrong. Try again.';
};

export default getErrorMessage;
