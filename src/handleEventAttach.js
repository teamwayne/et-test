import { checkIfETShouldBeDisabled } from './_helpers';
import { formTrackingHandler } from './handleFormTracking';
import { clickTrackingHandler } from './handleClickTracking';

/**
 *  Attaches a click, change or input event to the document.body to listen out for Engagement Tracking Interactions.
 */
export const attach = () => {
  try {
    if (document.querySelector) {
      ['click', 'change', 'input'].forEach(eventName => {
        document.querySelector('body').addEventListener(eventName, event => {
          switch (true) {
            // Skip if no event.target.
            case !event.target:
              break;
            // Skip if Engagement Tracking should be disabled.
            case checkIfETShouldBeDisabled(event):
              break;
            /** Use the 'change' event for all form elements apart from text and text area.
             * This is because the 'input' event doesn't work on form elements rendered in Safari or IE which accounts for 1/2 of IAG traffic.
             * See https://docs.google.com/spreadsheets/d/1a3Rr43se-VdkpuUuOacNe6_xL_sPdAZRFxyrg0yk1Fs/edit?usp=sharing
             */
            case eventName === 'change' &&
              /INPUT|SELECT/.test(event.target.tagName) &&
              !/text/.test(event.target.type.toLowerCase()):
              formTrackingHandler(event);
              break;
            /** Use the 'input' event for form text and text area.
             * The 'input' event is best suited to text and text area form elements as it will track the first keystroke.
             * The 'change' event only tracks once the text and text area has been unfocused.
             */
            case eventName === 'input' &&
              (event.target.tagName === 'INPUT' ||
                event.target.tagName === 'TEXTAREA') &&
              /text/.test(event.target.type.toLowerCase()):
              formTrackingHandler(event);
              break;
            // Handle submit button form events (they register as clicks)
            case eventName === 'click' &&
              event.target.tagName === 'INPUT' &&
              event.target.type === 'submit':
              formTrackingHandler(event);
              break;
            // Handle all other click events (but not on the form elements INPUT & SELECT)
            case eventName === 'click' &&
              !/INPUT|SELECT/.test(event.target.tagName):
              clickTrackingHandler(event, eventName);
              break;
            default:
            // TODO: fireSplunkEvent()
          }
        });
      });
    }
  } catch (e) {
    // TODO: fireSplunkEvent()
  }
};
