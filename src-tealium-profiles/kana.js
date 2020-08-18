// Safely read config from central global object 'window.load.config.eTrack'
window.load = window.load || {};
window.load.config = window.load.config || {};
window.load.config.eTrack = window.load.config.eTrack || {};

/** Enable on the following brands only.
 * @param {array regex} whitelistBrands e.g.
 * /nrma/,
 * /sgio/,
 */
window.load.config.eTrack.whitelistBrands = [/nrma/];

/** Always disable on the following pages.
 * @param {array regex} blacklistPages e.g.
 * /\/contact-us(\/phone)?$/,
 * /\/faq$/,
 */
window.load.config.eTrack.blacklistPages = false;

/** Always disable Engagement Tracking on elements which contain the IAG suppress attribute.
 * @param {string} suppressAttribute
 */
window.load.config.eTrack.suppressAttribute = 'data-et-suppress';

/** Always disable Engagement Tracking on elements containing the below attribute value pair(s).
 * @param {object regex} blacklistAttributes
 * id: /^tcChat_txtInput_input$/,
 * class: /tcChat/,
 */
window.load.config.eTrack.blacklistAttributes = false;

/** List of elements where if no click priority attributes found, track clicks on these elements. This has been switched off as it's too costly in Adobe.
 * @param {array string} clickTrackingDefaultElements
 *  e.g: 'a',
 * 'li',
 * 'button',
 * 'span',
 * 'i',
 * 'file',
 */
window.load.config.eTrack.clickTrackingDefaultElements = false;
