var gulp = require('gulp');
 
require('require-dir')('./build')

gulp.task('default', gulp.series('build'), function() {
   return null;
}); 