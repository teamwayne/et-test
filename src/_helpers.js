import * as config from './config';

/**
 * Tries to find the pageId used in Adobe Reporting by searching a bunch of global variables. TODO: This should be moved to a helper function in load.js
 */
export const getPageId = () =>
  window._pageId ||
  window.__pageId ||
  (window.utag_data && window.utag_data.pageId) ||
  window.pageId ||
  'pageId not set';

/**
 * Tries to more safely find brand
 */
export const getBrand = () =>
  (window.utag_data && window.utag_data.brand) ||
  (window.load && window.load.config && window.load.config.brand) ||
  '';

/**
 * Part of checkIfETShouldBeDisabled(), this will check if the page is a brand whitelist, or a page blacklist.
 * @param {Array} brandOrPageArray from two arrays: config.WHITELIST_BRANDS and config.BLACKLIST_PAGES
 */
export const brandPageMatcher = brandOrPageArray => {
  if (
    brandOrPageArray.some(regex =>
      regex.test((getBrand() + getPageId()).toLowerCase()),
    )
  ) {
    return true;
  }
  return false;
};

/**
 * Part of checkIfETShouldBeDisabled(), this will evaluate if event.target and parents contain the Suppression Attribute. This won't track that element.
 * @param {NodeList} eventNode The event.target from current and parent levels. Managed by parentalHandler().
 * @param {Array} suppressAttribute the string from config.SUPPRESS_ATTRIBUTE.
 */
export const suppressAttrMatcher = (eventNode, suppressAttribute) =>
  !!eventNode.attributes && eventNode.attributes[suppressAttribute];

/**
 * Part of checkIfETShouldBeDisabled(), this will match element attributes which should be blacklisted. This won't track that element.
 * @param {NodeList} eventNode The event.target from current and parent levels. Managed by parentalHandler().
 * @param {Object} blackListAttributes the object from config.BLACKLIST_ATTRIBUTES.
 */
export const blackListAttrMatcher = (eventNode, blackListAttributes) => {
  if (eventNode.attributes) {
    const blackList = Object.keys(eventNode.attributes)
      .map(key => eventNode.attributes[key])
      .some(
        attribute =>
          blackListAttributes[attribute.name] &&
          blackListAttributes[attribute.name].test(attribute.value),
      );
    return blackList;
  }
  return false;
};

/**
 * Part of checkIfETShouldBeDisabled(), this will check the attributes from the existing and parentNodes, 2 levels deep.
 * @param {Function} matcherFunction Passes either suppressAttrMatcher() or blackListAttrMatcher() functions above.
 * @param {NodeList} event The event NodeList attached by the addEventListener().
 * @param {Array} attributes Either config.SUPPRESS_ATTRIBUTE or config.BLACKLIST_ATTRIBUTES.
 */
export const parentalHandler = (matcherFunction, event, attributes) => {
  const parent = [
    event.target,
    event.target.parentNode,
    event.target.parentNode.parentNode,
  ].some(chaperone => matcherFunction(chaperone, attributes));
  return parent;
};

/**
 * Primary function to check if Engagement Tracking should be disabled.
 * @param {NodeList} event The event NodeList attached by the addEventListener().
 */
export const checkIfETShouldBeDisabled = event =>
  !brandPageMatcher(config.WHITELIST_BRANDS) || // Disable Engagement Tracking if brand not in whitelist
  (config.BLACKLIST_ATTRIBUTES && brandPageMatcher(config.BLACKLIST_PAGES)) || // Disable Engagement Tracking if page name in blacklist
  parentalHandler(suppressAttrMatcher, event, config.SUPPRESS_ATTRIBUTE) || // Disable Engagement Tracking if Suppress Attribute Found. Also checks 2 parentNode levels.
  (config.BLACKLIST_ATTRIBUTES &&
    parentalHandler(blackListAttrMatcher, event, config.BLACKLIST_ATTRIBUTES)); // Disable Engagement Tracking if a BlackList Attribute is found. Also checks 2 parentNode levels.

/**
 * Evaluates whether a given string value from an attribute contains PII by conducting a regex text against a set of PII regex.
 * @param {String} attribute a string value from an attribute to compare against config.PII_CHECKS.
 */
export const checkForPII = attribute => {
  if (!attribute) return false;
  if (config.WHITELIST_APP) return true;
  if (
    Object.keys(config.PII_CHECKS)
      .map(key => config.PII_CHECKS[key])
      .some(regex => regex.test(attribute))
  ) {
    return false;
  }
  return true;
};

/**
 * Finds Advanced Attributes. Managed by handleAdvClickAttributes() in click and form tracking.
 * @param {NodeList} eventNode For clicks, this is the nodeList from standard attributes stored in CLICK_DATA.standard.eventLocation. For forms, this is just event.target.
 * @param {Array} attributes from config.ADVANCED_ATTRIBUTES (['value', 'innerText'])
 */
export const getAdvAttributes = (eventNode, attributes) => {
  // Find first attribute to match config.ADVANCED_ATTRIBUTES
  const advancedAttr = attributes.find(attribute => {
    if (eventNode[attribute]) {
      return true;
    }
    return false;
  });
  // Disable Advanced Tracking if attribute.value or attribute.innerText doesn't exist.
  if (!advancedAttr) {
    return {
      attributes: {
        et_adv_attribute: `no advT (no value)`,
      },
    };
  }
  // Disable Advanced Tracking if attribute.value or attribute.innerText contains PII.
  if (!checkForPII(eventNode[advancedAttr])) {
    return {
      attributes: {
        et_adv_attribute: `no advT (pii)`,
      },
    };
  }
  // Return Advanced Tracking attribute.value
  return {
    attributes: {
      et_adv_attribute: advancedAttr,
      et_adv_attribute_value: eventNode[advancedAttr].trim(),
    },
  };
};

/**
 * Manages naming inconsistencies in a nodeList so the Engagement Tracking reports are more accurate and useful. Run in returnAttributeObject() below.
 * @param {NodeList} eventNode the eventNode passed by returnAttributeObject().
 */
export const manageTypeCases = eventNode => {
  const type = eventNode.type || eventNode.tagName;
  if (eventNode.type === 'checkbox') {
    return eventNode.checked ? `${type}-check` : `${type}-uncheck`;
  }
  if (eventNode.tagName === 'BUTTON' && eventNode.type === 'submit') {
    return 'BUTTON';
  }
  if (eventNode.tagName === 'INPUT' && eventNode.type === 'submit') {
    return 'submit-raw';
  }
  return type;
};

/**
 * For CGU cases, if class contains track_ or track-, strip other class names. This will produce a cleaner Adobe Report.
 * @param {NodeList} attributeValue the et_std_attribute_value passed by returnAttributeObject().
 */
export const cleanTrackValue = attributeValue => {
  const cleanValue = attributeValue.split(' ').filter(attribute => {
    if (/track[_-]/.test(attribute)) {
      return attribute;
    }
    return false;
  });
  return cleanValue[0] || attributeValue;
};

/**
 * Universal mapping function returning the attribute object from click and form tracking.
 * @param {NodeList} eventNode the eventNode passed by getPriorityClickAttributes(), getDefaultClickAttributes() and getStdFormAttributes().
 * @param {Array} attribute the standard attribute string sent by the functions mentioned above.
 */
export const returnAttributeObject = (eventNode, attribute, lastCheck) => {
  if (attribute || lastCheck) {
    return {
      attributes: {
        et_tag_name: manageTypeCases(eventNode) || 'no tag name',
        et_std_attribute: attribute || 'no attribute',
        et_std_attribute_value:
          (attribute &&
            eventNode.attributes[attribute] &&
            cleanTrackValue(eventNode.attributes[attribute].value.trim())) ||
          'no attribute value',
      },
      eventLocation: eventNode,
    };
  }
  return false;
};

/**
 *  Function which pushes data to the dataLayer and logs data to console.
 * @param {String} action either 'click-tracking' or 'form-tracking'. Sent by the clickTrackingHandler() or formTrackingHandler().
 * @param {Object} value The object assembled by the two functions mentioned above.
 */
// Primary dataLayer push function(with load.js logging)
export const dataLayerPush = (action, value) => {
  window.load.tools = window.load.tools || {
    log(logit) {
      if (localStorage && localStorage.getItem('siteTrackingDebug'))
        // eslint-disable-next-line no-console
        console.log(logit);
    },
  };

  const dataLayerValues = value;
  dataLayerValues.event = action;
  dataLayerValues.pageId = getPageId();
  try {
    if (window.load.config.dataLayerName) {
      // @dataLayerName: refers to the value from the load.js config setup.
      const { dataLayerName } = window.load.config;
      window[dataLayerName] = window[dataLayerName] || [];
      window[dataLayerName].push(dataLayerValues);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(dataLayerValues);
    }
    // Log only if utag isn't loaded. If utag is loaded, this is handled by the dataLayer pub sub extension.
    // eslint-disable-next-line no-console
    if (!window.utag) window.load.tools.log(dataLayerValues);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};
