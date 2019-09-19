// eslint-disable-next-line import/prefer-default-export
export const pageUrlToFileName = (pageUrl) => {
  const withoutProtocol = pageUrl.replace(new RegExp('https?://'), '');
  const withoutDotHtml = withoutProtocol.replace(new RegExp('.html(,|$)'), '');
  return `${withoutDotHtml.replace(/\W/g, '-')}.html`;
};

export const makeSpinner = () => {
  const spinnerChars = ['\\', '|', '/', '-'];

  let x = 0;
  const intervalId = setInterval(() => {
    process.stdout.write(`\r${spinnerChars[x]}`);
    x += 1;
    // eslint-disable-next-line no-bitwise
    x &= 3;
  }, 250);

  return () => clearInterval(intervalId);
};
