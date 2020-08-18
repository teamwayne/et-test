import { arrayPrototypeFindPolyFill } from './_polyFills';
import { attach } from './handleEventAttach';

const bindEvents = () => {
  attach();
};

try {
  arrayPrototypeFindPolyFill();
  bindEvents();
} catch (e) {
  console.log(e);
}
