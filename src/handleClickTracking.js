import * as config from './config';
import {
  checkForPII,
  returnAttributeObject,
  getAdvAttributes,
  dataLayerPush,
} from './_helpers';

/**
 * Manages priority attributes set by IAG app dev teams. Yes, this is a bit complicated, but it has to deal with inconsistencies in implementation.
 * @param {NodeList} eventNode The event.target from current and parent levels. Managed by handlePriorityClickAttributes().
 * @param {Array} attributes from config.CLICK_TRACKING_PRIORITY (data-tracking etc.).
 */
const getPriorityClickAttributes = (eventNode, attributes, lastCheck) => {
  // Find first attribute to match from config.CLICK_TRACKING_PRIORITY_ATTRIBUTES
  const preferredAttr = attributes.find(attribute => {
    // eventNode.attributes is important as it prevents uncaught errors occurring at document.target level.
    if (eventNode && eventNode.attributes && eventNode.attributes[attribute]) {
      if (
        // To cater for old CGU apps, track if class value starts with either "track-"" or "track_". Also check for PII.
        (/class/.test(attribute) &&
          /track[_-]/.test(eventNode.attributes[attribute].value) &&
          checkForPII(eventNode.attributes[attribute].value)) ||
        // For everything else, just check value for PII.
        (!/class/.test(attribute) &&
          checkForPII(eventNode.attributes[attribute].value))
      ) {
        return true;
      }
    }
    return false;
  });
  return returnAttributeObject(eventNode, preferredAttr, lastCheck);
};

/**
 * Executes getPriorityClickAttributes() 3 times to search for Priority click attributes from current event.target and 2 parents deep.
 * @param {NodeList} event The event NodeList attached by the addEventListener()
 * @param {Array} attributes from config.CLICK_TRACKING_PRIORITY (data-tracking etc.).
 */
const handlePriorityClickAttributes = (event, attributes) =>
  getPriorityClickAttributes(event.target, attributes) || // Check event.target for any Priority Attributes.
  getPriorityClickAttributes(event.target.parentNode, attributes) || // Check event target.parentNode for any Priority Attributes (CGU)
  getPriorityClickAttributes(
    event.target.parentNode.parentNode,
    attributes,
    true,
  ); // Check event target.parentNode.parentNode for any Priority Attributes.

/**
 * Manages default attributes if no priority attributes found.
 * @param {NodeList} eventNode The event.target. Managed by handleDefaultClickAttributes().
 * @param {Array} attributes from config.CLICK_TRACKING_DEFAULT (['id', 'class', 'label'])
 */
const getDefaultClickAttributes = (eventNode, attributes) => {
  // Find first attribute to match from config.CLICK_TRACKING_DEFAULT_ATTRIBUTES
  const defaultAttr = attributes.find(attribute => {
    if (eventNode && eventNode.attributes && eventNode.attributes[attribute]) {
      if (checkForPII(eventNode.attributes[attribute].value)) {
        return true;
      }
    }
    return false;
  });
  return returnAttributeObject(eventNode, defaultAttr, true);
};

/**
 * Executes getDefaultClickAttributes() just at event.target level.
 * @param {NodeList} event The event NodeList attached by the addEventListener()
 * @param {Array} attributes from config.CLICK_TRACKING_DEFAULT_ATTRIBUTES (['id', 'class', 'label'])
 */
export const handleDefaultClickAttributes = (event, attributes) =>
  getDefaultClickAttributes(event.target, attributes);

/**
 * Executes getAdvAttributes() in _helpers.js to return advanced attributes.
 * @param {NodeList} eventNode The same nodeList from standard attributes stored in CLICK_DATA.standard.eventLocation.
 * @param {Array} attributes from config.ADVANCED_ATTRIBUTES (['value', 'innerText'])
 */
const handleAdvClickAttributes = (eventNode, attributes) => {
  // Disable Advanced Tracking if there no true in config.ADVANCED_ENABLE.
  if (!config.ADVANCED_ENABLE) {
    return {
      attributes: {
        et_adv_attribute: `no advT (config)`,
      },
    };
  }
  return getAdvAttributes(eventNode, attributes);
};

/**
 * Main function to retrieve, filter and assemble data for click tracking.
 * @param {NodeList} event The event NodeList attached by the addEventListener() from handleEventAttach.js
 * @param {Array} eventName The event name attached by the addEventListener(). Currently this will only equal 'click'.
 */
export const clickTrackingHandler = (event, eventName) => {
  const CLICK_DATA = {
    adobeString: {},
    standard: {
      attributes: {},
    },
    advanced: {
      attributes: {},
    },
  };

  // Get Priority Click Attributes from any element.
  CLICK_DATA.standard = handlePriorityClickAttributes(
    event,
    config.CLICK_TRACKING_PRIORITY_ATTRIBUTES,
  );
  // Get Default Click Attributes if no preferred clicks and only from click element list.
  if (
    CLICK_DATA.standard.attributes.et_std_attribute === 'no attribute' &&
    config.CLICK_TRACKING_DEFAULT_ELEMENTS &&
    config.CLICK_TRACKING_DEFAULT_ELEMENTS.indexOf(
      (event.target.tagName || event.target.type).toLowerCase(),
    ) > -1
  ) {
    CLICK_DATA.standard = handleDefaultClickAttributes(
      event,
      config.CLICK_TRACKING_DEFAULT_ATTRIBUTES,
    );
  }
  // Once Priority and default click handlers have finished, disable engagement tracking if no stdAttributes found or standard.et_std_attribute = no attribute.
  if (CLICK_DATA.standard.attributes.et_std_attribute === 'no attribute')
    return;

  // Add eventName to standard attributes.
  CLICK_DATA.standard.attributes.et_event_name = eventName;
  // Only if config.ADVANCED_ENABLE is true, grab target.value or target.innerText.
  CLICK_DATA.advanced = handleAdvClickAttributes(
    CLICK_DATA.standard.eventLocation || event.target,
    config.ADVANCED_ATTRIBUTES,
  );

  // Assemble Adobe String. Example: '1:click-tracking|2:[eventName]click|3:[tagname]LI|4:[attribute]data-tracking|5:[attribute value]register'
  // Sent to Engagement Click Tracking(v83) for IAG and Engagement Click Tracking (v97) for Wesfarmers.
  CLICK_DATA.adobeString.interaction_value =
    `click-tracking|${CLICK_DATA.standard.attributes.et_event_name}|` + // Can only equal 'click' at the moment.
    `${CLICK_DATA.standard.attributes.et_tag_name}|` + // e.g 'A, LI, SPAN' etc.
    `${CLICK_DATA.standard.attributes.et_std_attribute}|` + // e.g. 'data-tracking, class' etc.
    `${CLICK_DATA.standard.attributes.et_std_attribute_value}`; // e.g. register

  // Push to the DataLayer.
  dataLayerPush('click-tracking', {
    ...CLICK_DATA.adobeString,
    data: {
      ...CLICK_DATA.adobeString,
      ...CLICK_DATA.standard.attributes,
      ...CLICK_DATA.advanced.attributes,
    },
  });
  console.log('******* Manage JS Tracking*******');
  console.log('click-tracking', {
    ...CLICK_DATA.adobeString,
    data: {
      ...CLICK_DATA.adobeString,
      ...CLICK_DATA.standard.attributes,
      ...CLICK_DATA.advanced.attributes,
    },
  });
};
