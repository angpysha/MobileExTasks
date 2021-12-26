var gulp = require('gulp');
var ts = require('gulp-typescript');
var install = require('gulp-install');


var buildProject = function(name){
    gulp.src(["./tasks/" + name + "/package.json"])
        .pipe(install());

    var tsProject = ts.createProject("./tasks/" + name + "/tsconfig.json");
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("./tasks/" + name));
};

gulp.task('PatchAndroidResource', function(){
    return buildProject("PatchAndroidResource");
});

gulp.task('build', gulp.series('PatchAndroidResource'), function(){
    return null;
});