// Read config from central global object 'window.load.config.etrack'
window.load = window.load || {};
window.load.config = window.load.config || {};
window.load.config.eTrack = window.load.config.eTrack || {};

/** WHITE AND BLACK LIST CONSTANTS */

/** Enable on the following brands only.
 * @const {array regex} WHITELIST_BRANDS e.g. /nrma/
 */
export const WHITELIST_BRANDS = window.load.config.eTrack.whitelistBrands || [
  /nrma/,
  /sgio/,
  /sgic/,
  /cgu/,
  /coles/,
  /state/,
  /ami/,
  /easysure/,
];

/**
 * Disable PII Checking on brochureware websites.
 */
export const WHITELIST_APP = window.load.config.apptype === 'brochureware';

/** Always disable on the following pages.
 * @const {array regex} BLACKLIST_PAGES e.g.
 * /\/contact-us(\/phone)?$/,
 * /\/faq$/,
 */
export const BLACKLIST_PAGES =
  window.load.config.eTrack.blacklistPages || false;

/** Always disable Engagement Tracking on elements which contain the IAG suppress attribute.
 * @const {string} SUPPRESS_ATTRIBUTE
 */
export const SUPPRESS_ATTRIBUTE =
  window.load.config.eTrack.suppressAttribute || 'data-et-suppress';

/** Always disable Engagement Tracking on elements containing the below attribute value pair(s).
 * @const {object regex} BLACKLIST_ATTRIBUTES
 * id: /^tcChat_txtInput_input$/,
 * class: /tcChat/,-
 */
export const BLACKLIST_ATTRIBUTES =
  window.load.config.eTrack.blacklistAttributes || false;

/** PII REGEX */

/** PII data Regex. This is used for every data point captured.
 * @const {object regex} PII_CHECKS
 */
export const PII_CHECKS = {
  email: /\b[\w.-]+@[\w.-]+\.\w{2,4}\b/,
  address: /^\d+\s[A-z]+\s[A-z]+|^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$/,
  phone: /^((\+61\s?)?(\((0|02|03|04|07|08)\))?)?\s?\d{1,4}\s?\d{1,4}\s?\d{0,4}$/,
  dob: /(\d{4}).*(\d{2}).*(\d{2})|(\d{2}).*(\d{2}).*(\d{4})|(\d{1}).*[A-z].*(\d{4})/,
  name: /[Hh]ello\s|[Ww]elcome\s|[Hh]i\s|[Mm]y\s[Nn]ame|Nice\sto|meet\syou|[Mm][rs]{1,2}\s/,
};

/** CLICK TRACKING CONSTANTS */

// List of priority attributes (attributes defined by IAG app developers). Any DOM element can be tracked.
// They are searched in order of priority, and will take priority over default attributes.
export const CLICK_TRACKING_PRIORITY_ATTRIBUTES = [
  'data-tracking', // Default used by most IAG applications.
  'data-target', // Default used by easysure.
  'data-track', // Here in case there's a typo in data-tracking.
  'data-title', // Data-title is used by some IAG Applications (I think for CGU?).
  'class', // Old CGU applications will prefix the class with either "track-"" or "track_".
];

// If no priority attribute is found, this list of DOM elements will be considered for default click tracking.
/* 'a',
 * 'li',
 * 'button',
 * 'span',
 * 'i',
 * 'file',
 */
export const CLICK_TRACKING_DEFAULT_ELEMENTS =
  window.load.config.eTrack.clickTrackingDefaultElements || false;

// These attributes will be searched in order of priority for every click tracking default element above.
export const CLICK_TRACKING_DEFAULT_ATTRIBUTES = ['id', 'class', 'label'];

/** FORM TRACKING CONSTANTS */

// List of form attributes to track in order of prioritisation.
export const FORM_TRACKING_PRIORITY_ATTRIBUTES = [
  'data-tracking', // Not currently used by IAG applications, bt put this in to be consistent with click tracking.
  'name', // Most IAG forms contain a name attribute.
  'id', // Some input's are not even forms, so try and use Id.
  'class', // Some input's are not even forms, so try and use class.
  'className', // className (not class) as sometimes we use 'event.target.type' for forms and not 'event.target.tagName'
  'label', // Label
  'placeholder', // Placeholder text as a last resort.
];

/** ADVANCED TRACKING CONSTANTS */
// Set boolean from global object to enable Advanced Tracking
export const ADVANCED_ENABLE = window.load.config.advanced;

// List of attributes to report in advanced tracking for clicks and forms. Use with caution as could contain PII.
export const ADVANCED_ATTRIBUTES = ['value', 'innerText'];

// Regex list of elements to report in advanced tracking for clicks and forms. Anything not listed will be disabled.
export const ADVANCED_ELEMENTS = /select|checkbox|radio|submit|^a$|^li$|button|span|^i$|file/;
