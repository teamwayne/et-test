import { arrayPrototypeFindPolyFill } from './_polyFills';
import { attach } from './handleEventAttach';

const bindEvents = () => {
  attach();
};

const engagementTrackingAttach = () => {
  try {
    arrayPrototypeFindPolyFill();
    bindEvents();
  } catch (e) {
    console.log(e);
  }
};

export default engagementTrackingAttach;
