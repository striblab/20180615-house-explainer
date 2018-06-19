const gulp = require('gulp');
const archiePipe = require('archieml-pipe').default;
const gulpPublish = require('./gulp-publish');
const ejs = require('gulp-ejs');
const _ = require('lodash');

let c = gulpPublish.getConfig();

const config = {
  googleDocId: c.archie.googleDocId,
  googleClientId: c.archie.googleClientId,
  googleClientSecret: c.archie.googleClientSecret,
  redirectPort: c.archie.redirectPort, // defaults to 6006
  exportPath: c.archie.exportPath, // defaults to ./data.json
  tokenPath: c.archie.tokenPath // defaults to ./archie-token.json
};

gulp.task('archie', (cb) => {
    archiePipe(config);
    cb();
});