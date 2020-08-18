# Engagement Tracking Library
Please refer main Confluence article here:  https://confluence.iag.com.au/pages/viewpage.action?pageId=315302176

## Install
Clone the repo and `npm install`.

## src-tealium-profiles directory
Contains the config Extension for each Tealium profile. You will need to manually cut and paste this into Tealium.


### Build Scripts
`npm test` run Jest unit testing.
`npm run build:local` will build an unminified, Bable transpiled file for use with the local server (see "Local Testing" below), located at: `./dist/local/engagement-tracking-local.js`
`npm run build:dev` will build an unminified, Bable transpiled file (for Tealium dev) located at: `./dist/dev/engagement-tracking-dev.js`. After building you will need to manually cut and paste this into Tealium.
`npm run build:prod` will build a minified, Bable transpiled file (for Tealium prod) located at: `./dist/prod/engagement-tracking-prod.js`. After building you will need to manually cut and paste this into Tealium.
`npm run build` builds all 3 distributions: `local`, `dev` and `prod`

### Local Testing
`npm run local` will run the `./devTest.html` file which loads `./dist/local/engagement-tracking-local.js`. This file contains many testing scenarios you can use while developing new Engagement Tracking functionality.
