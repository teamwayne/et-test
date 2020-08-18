import * as config from './config';
import {
  checkForPII,
  getPageId,
  returnAttributeObject,
  getAdvAttributes,
  dataLayerPush,
} from './_helpers';

const tracked = [];

/**
 * Manages standard form attributes.
 * @param {NodeList} eventNode The event.target from event. Executed directly by the ormTrackingHandler().
 * @param {Array} attributes From config.FORM_TRACKING_PRIORITY (data-tracking, name etc.).
 */
const getStdFormAttributes = (eventNode, attributes) => {
  // Find first attribute to match from config.FORM_TRACKING_PRIORITY
  const standardAttributes = attributes.find(attribute => {
    if (
      eventNode.attributes[attribute] &&
      checkForPII(eventNode.attributes[attribute].value)
    ) {
      return true;
    }
    return false;
  });
  return returnAttributeObject(eventNode, standardAttributes, true);
};

/**
 * Executes getAdvAttributes() in _helpers.js to return advanced attributes.
 * @param {NodeList} eventNode The same nodeList from standard attributes stored in CLICK_DATA.standard.eventLocation.
 * @param {Array} attributes from config.ADVANCED_ATTRIBUTES (['value', 'innerText'])
 * @param {Array} advancedElements from config.ADVANCED_ELEMENTS, this regex text will disable TEXT and TEXT AREA.
 */
const handleAdvFormAttributes = (eventNode, attributes, advancedElements) => {
  // Disable Advanced Tracking if there no true in config.ADVANCED_ENABLE.
  if (!config.ADVANCED_ENABLE) {
    return {
      attributes: {
        et_adv_attribute: `no advT (config)`,
      },
    };
  }
  // Disable Advanced Tracking if target.type doesn't contain an advancedElement.
  if (!advancedElements.test(eventNode.type.toLowerCase())) {
    return {
      attributes: {
        et_adv_attribute: `no advT (${eventNode.type})`,
      },
    };
  }
  return getAdvAttributes(eventNode, attributes);
};

/**
 * Main function to retrieve, filter and assemble data for form tracking.
 * @param {NodeList} event The event NodeList attached by the addEventListener() from handleEventAttach.js
 */
export const formTrackingHandler = event => {
  const FORM_DATA = {
    adobeString: {},
    standard: {
      attributes: {},
    },
    advanced: {
      attributes: {},
    },
  };

  // Get standard attributes after checking for PII
  FORM_DATA.standard = getStdFormAttributes(
    event.target,
    config.FORM_TRACKING_PRIORITY_ATTRIBUTES,
  );

  // Safety add form name to standard attributes.
  FORM_DATA.standard.attributes.et_event_name =
    (event.target.form && event.target.form.name) ||
    (event.target.form && event.target.form.id) ||
    'no form name'.trim();

  // Only if config.ADVANCED_ENABLE is true, grab target.value or target.innerText for select, check-box and radio elements only. Do not add for text fields as PII.
  FORM_DATA.advanced = handleAdvFormAttributes(
    event.target,
    config.ADVANCED_ATTRIBUTES,
    config.ADVANCED_ELEMENTS,
  );

  // Format: '1:form-input|2:[form name]Contact Us Form|3:[tag name/value]select|4:[std attribute]name|5:[std attribute value]suburb|'
  // form-(start|complete|error) controlled by app also sent here.
   // Sent to Engagement Form Tracking(v84) for IAG and Engagement Form Tracking (v98) for Wesfarmers.
  FORM_DATA.adobeString.form_interaction =
    `form-input|${FORM_DATA.standard.attributes.et_event_name}|` + // e.g. Contact Us Form
    `${FORM_DATA.standard.attributes.et_tag_name}|` + // e.g. text, text area, select etc.
    `${FORM_DATA.standard.attributes.et_std_attribute}|` + // e.g. data-tracking, name, id, className, label.
    `${FORM_DATA.standard.attributes.et_std_attribute_value}`; // e.g. suburb

  // Only fire if a click on a text area element is not the same as the last text area.
  if (
    tracked[tracked.length - 1] !==
    FORM_DATA.adobeString.form_interaction + getPageId()
  ) {
    // Push to the DataLayer.
    dataLayerPush('form-input', {
      ...FORM_DATA.adobeString,
      data: {
        ...FORM_DATA.adobeString,
        ...FORM_DATA.standard.attributes,
        ...FORM_DATA.advanced.attributes,
      },
    });
    // Add text and textarea to tracked array so subsequent keystrokes do not fire multiple events (only used by the Input event.)
    if (event.target.type && /text/.test(event.target.type.toLowerCase())) {
      tracked.push(FORM_DATA.adobeString.form_interaction + getPageId());
    }
  }
};
