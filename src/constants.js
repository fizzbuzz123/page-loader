import emoji from 'node-emoji';

const tada = emoji.get('tada');
const tripleTada = `${tada} ${tada} ${tada}`;
const successMessage = `${tripleTada} Page is successfully downloaded ${tripleTada}`;

// eslint-disable-next-line import/prefer-default-export
export { successMessage };
