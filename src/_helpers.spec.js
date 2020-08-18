import * as config from './config';
import * as _helpers from './_helpers';

describe('Helper Functions Testing', () => {
  window._pageId = 'MOCK_PAGE_ID';
  window.utag_data = {};

  // brandPageMatcher
  describe('brandPageMatcher Function Testing', () => {
    it('brandPageMatcher should return true if brand = nrma', () => {
      window._pageId = '';
      window.utag_data.pageId = '/nrma/ /personal/car-insurance';
      expect(_helpers.brandPageMatcher(config.WHITELIST_BRANDS)).toBe(true);
    });
  });

  // suppressAttrMatcher
  describe('suppressAttrMatcher Function Testing', () => {
    it('suppressAttrMatcher should return not undefined if data-et-suppress exists', () => {
      const dummyEventNode = {
        attributes: {
          'data-et-suppress': true,
        },
      };
      expect(
        _helpers.suppressAttrMatcher(dummyEventNode, config.SUPPRESS_ATTRIBUTE),
      ).toBe(true);
    });
  });

  // blackListAttrMatcher
  describe('blackListAttrMatcher Function Testing', () => {
    it('blackListAttrMatcher should return true if an EventNode Attribute matches a BlackList Attribute', () => {
      const dummyEventNode = {
        attributes: [
          {
            name: 'class',
            value: 'tcChat',
          },
        ],
      };

      const blackListAttributes = {
        id: /^tcChat_txtInput_input$/,
        class: /tcChat/,
      };

      expect(
        _helpers.blackListAttrMatcher(dummyEventNode, blackListAttributes),
      ).toBe(true);
    });
  });
  // parentalHandler
  describe('parentalHandler Function Testing', () => {
    it('parentalHandler should traverse 2 parent nodes', () => {
      const dummyEvent = {
        target: {
          parentNode: {
            parentNode: {
              attributes: {
                'data-et-suppress': true,
              },
            },
          },
        },
      };

      expect(
        _helpers.parentalHandler(
          _helpers.suppressAttrMatcher,
          dummyEvent,
          config.SUPPRESS_ATTRIBUTE,
        ),
      ).toBe(true);
    });
  });

  // checkForPII Name
  describe('checkForPII Function Testing', () => {
    // Name
    it('checkForPII Name', () => {
      const bannedString = "My Name Is Michael Paine, and I'm a nosy neighbour";
      expect(_helpers.checkForPII(bannedString)).toBe(false);
    });
    // Street Address
    it('checkForPII Street Address', () => {
      const bannedString = '155 George Street, Sydney NSW 2000';
      expect(_helpers.checkForPII(bannedString)).toBe(false);
    });
    // checkForPII email
    it('checkForPII Email', () => {
      const bannedString = 'michaelcaine@hotmail.com';
      expect(_helpers.checkForPII(bannedString)).toBe(false);
    });
    // checkForPII phone
    it('checkForPII Phone', () => {
      const bannedString = 'michaelcaine@hotmail.com';
      expect(_helpers.checkForPII(bannedString)).toBe(false);
    });
    // checkForPII DOB
    it('checkForPII DOB', () => {
      const bannedString = '07/09/1944';
      expect(_helpers.checkForPII(bannedString)).toBe(false);
    });
  });

  // getAdvAttributes No attribute
  describe('getAdvAttributes Function Testing', () => {
    it('getAdvAttributes No Attribute', () => {
      const dummyEventNode = {};
      expect(
        _helpers.getAdvAttributes(dummyEventNode, config.ADVANCED_ATTRIBUTES),
      ).toEqual({
        attributes: {
          et_adv_attribute: `no advT (no value)`,
        },
      });
    });

    // getAdvAttributes PII
    it('getAdvAttributes PII', () => {
      const dummyEventNode = {
        innerText: "My Name Is Michael Paine, and I'm a nosy neighbour",
      };
      expect(
        _helpers.getAdvAttributes(dummyEventNode, config.ADVANCED_ATTRIBUTES),
      ).toEqual({
        attributes: {
          et_adv_attribute: `no advT (pii)`,
        },
      });
    });

    // getAdvAttributes Valid
    it('getAdvAttributes Valid', () => {
      const dummyEventNode = {
        innerText: 'Blah',
      };
      expect(
        _helpers.getAdvAttributes(dummyEventNode, config.ADVANCED_ATTRIBUTES),
      ).toEqual({
        attributes: {
          et_adv_attribute: 'innerText',
          et_adv_attribute_value: 'Blah',
        },
      });
    });
  });
});
