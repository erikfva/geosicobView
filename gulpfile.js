/*
* Dependencias
*/
var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  pump = require('pump'),
  htmlmin = require('gulp-htmlmin'),
  extract = require('gulp-extract'),
  cleanCSS = require('gulp-clean-css'),
  preprocess = require('gulp-preprocess'),
  jshint = require('gulp-jshint');
var browserSync = require('browser-sync').create();
var php = require('gulp-connect-php');
var reload  = browserSync.reload;
var argv = require('yargs').argv,
    gulpif = require('gulp-if');
var inject = require('gulp-inject');
var wrap = require("gulp-wrap");
/*
* Configuración de la tarea para concatenar listado de mapas bases 'mb'
*/

gulp.task('mapas-base', function () {

  gulp.src('src/mapas_base/*.html')
  .pipe(gulpif(argv.prod,concat('mapas_base.min.html'),concat('mapas_base.html')))
  .pipe(gulpif(argv.prod, 
  	htmlmin(
  		{	collapseWhitespace: true, 
  			minifyJS:true, 
  			removeComments: true,
  			processScripts : ['text/x-tmpl']
  		}
  	)
  ))
  .pipe(gulp.dest('build/'));
  gulp.src('src/mapas_base/bmpp/*.css').pipe(gulpif(argv.prod,concat('mapas_base.min.css'),concat('mapas_base.css')))
  .pipe(gulpif(argv.prod,cleanCSS({compatibility: 'ie8'})))
  .pipe(gulp.dest('build/'));
});

gulp.task('test-mapas-base', function () {
  gulp.src('test/mapas_base.js').pipe(jshint()).pipe(jshint.reporter('default'))
  .pipe(concat('mapas_base.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('test/'));  
});

gulp.task('geoprocess', function () {
	gulp.src('src/geoprocess/*.css').pipe(gulpif(argv.prod,concat('geoprocess.min.css'),concat('geoprocess.css')))
  .pipe(gulpif(argv.prod,cleanCSS({compatibility: 'ie8'})))
  .pipe(gulp.dest('build/geoprocess/'));
  
  gulp.src('src/geoprocess/*.html')
  .pipe(gulpif(argv.prod,concat('geoprocess.min.html'),concat('geoprocess.html')))
  .pipe(gulpif(argv.prod, 
  	htmlmin(
  		{	collapseWhitespace: true, 
  			minifyJS:true, 
  			removeComments: true,
  			processScripts : ['text/x-tmpl']
  		}
  	)
  ))
  .pipe(gulp.dest('build/geoprocess'));
  
  gulp.src('src/geoprocess/*.js').pipe(jshint()).pipe(jshint.reporter('default'))
  .pipe(gulpif(argv.prod,concat('geoprocess.min.js'),concat('geoprocess.js')))
  .pipe(gulpif(argv.prod,uglify()))
  .pipe(gulp.dest('build/geoprocess/'));  
 
});

gulp.task('landsat8', function () {
  gulp.src('src/landsat8/*.html')
  .pipe(gulpif(argv.prod,concat('landsat8.min.html'),concat('landsat8.html')))
  .pipe(gulpif(argv.prod, 
  	htmlmin(
  		{	collapseWhitespace: true, 
  			minifyJS:true, 
  			minifyCSS: true,
  			removeComments: true,
  			processScripts : ['text/x-tmpl']
  		}
  	)
  ))
  .pipe(gulp.dest('build/'))
});

gulp.task('uploadgeofile', function (cb) {
  gulp.src('src/uploadgeofile/*.html')
  .pipe(gulpif(argv.prod,concat('uploadfrm.min.html'),concat('uploadfrm.html')))
  .pipe(gulpif(argv.prod,
  	htmlmin(
  		{	collapseWhitespace: true, 
  			minifyJS:true, 
  			removeComments: true,
  			processScripts : ['text/x-tmpl']
  		}
  	)
  ))
  .pipe(gulp.dest('build/uploadgeofile/'));
 
  pump([
        gulp.src('src/uploadgeofile/*.js').pipe(jshint()).pipe(jshint.reporter('default'))
        .pipe(gulpif(argv.prod,concat('uploadfrm.min.js'),concat('uploadfrm.js'))),
        gulpif(argv.prod,uglify()),
        gulp.dest('build/uploadgeofile/')
    ],
    cb
  );
  
	gulp.src('src/uploadgeofile/*.css').pipe(gulpif(argv.prod,concat('uploadfrm.min.css'),concat('uploadfrm.css')))
  .pipe(gulpif(argv.prod,cleanCSS({compatibility: 'ie8'})))
  .pipe(gulp.dest('build/uploadgeofile/'));
  
});

gulp.task('popupinfo', function (cb) {
  gulp.src('src/popupinfo/*.html')
  .pipe(gulpif(argv.prod,concat('popupinfo.min.html'),concat('popupinfo.html')))
  .pipe(gulpif(argv.prod,
  	htmlmin(
  		{	collapseWhitespace: true, 
  			minifyJS:true, 
  			removeComments: true,
  			processScripts : ['text/x-tmpl']
  		}
  	)
  ))
  .pipe(gulp.dest('build/popupinfo/'));
 
  pump([
        gulp.src('src/popupinfo/*.js').pipe(jshint()).pipe(jshint.reporter('default'))
        .pipe(gulpif(argv.prod,concat('popupinfo.min.js'),concat('popupinfo.js'))),
        gulpif(argv.prod,uglify()),
        gulp.dest('build/popupinfo/')
    ],
    cb
  );
  
	gulp.src('src/popupinfo/*.css').pipe(gulpif(argv.prod,concat('popupinfo.min.css'),concat('popupinfo.css')))
  .pipe(gulpif(argv.prod,cleanCSS({compatibility: 'ie8'})))
  .pipe(gulp.dest('build/popupinfo/'));
  
});

gulp.task('login', function (cb) {
  gulp.src('src/login/*.html')
  .pipe(gulpif(argv.prod,concat('login.min.html'),concat('login.html')))
  .pipe(gulpif(argv.prod,
  	htmlmin(
  		{	collapseWhitespace: true, 
  			minifyJS:true, 
  			removeComments: true,
  			processScripts : ['text/x-tmpl']
  		}
  	)
  ))
  .pipe(gulp.dest('build/login/'));
 
  pump([
        gulp.src('src/login/*.js').pipe(jshint()).pipe(jshint.reporter('default'))
        .pipe(gulpif(argv.prod,concat('login.min.js'),concat('login.js'))),
        gulpif(argv.prod,uglify()),
        gulp.dest('build/login/')
    ],
    cb
  );
  
	gulp.src('src/login/*.css').pipe(gulpif(argv.prod,concat('login.min.css'),concat('login.css')))
  .pipe(gulpif(argv.prod,cleanCSS({compatibility: 'ie8'})))
  .pipe(gulp.dest('build/login/'));
  
});

gulp.task('build-index',['login','mapas-base','landsat8','uploadgeofile', 'popupinfo','geoprocess'], function () {
	gulp.src('src/index.html')
	.pipe(inject(gulp.src(!!argv.prod?'build/landsat8.min.html':'build/landsat8.html'), {
    starttag: '<!-- inject:landsat8:{{ext}} -->',
    removeTags : true,
    transform: function (filePath, file) {
      // return file contents as string 
      return file.contents.toString('utf8')
    }
  }))
 	.pipe(inject(gulp.src(!!argv.prod?'build/mapas_base.min.html':'build/mapas_base.html'), {
    starttag: '<!-- inject:mapas_base:{{ext}} -->',
    removeTags : true,
    transform: function (filePath, file) {
      // return file contents as string 
      return file.contents.toString('utf8')
    }
  }))
	.pipe(
		inject(
			gulp.src(['build/uploadgeofile/*.*']), 
			{
    		starttag: '<!-- inject:uploadfrm:all -->',
    		removeTags : true,
    		transform: function (filePath, file) {
    			return wrapTags(filePath, file, !!argv.prod);
    		}
  		}
  	))
	.pipe(
		inject(
			gulp.src(['build/geoprocess/*.*']), 
			{
    		starttag: '<!-- inject:geoprocess:all -->',
    		removeTags : true,
    		transform: function (filePath, file) {
    			return wrapTags(filePath, file, !!argv.prod);
    		}
  		}
  	))
	.pipe(
		inject(
			gulp.src(['build/popupinfo/*.*']), 
			{
    		starttag: '<!-- inject:popupinfo:all -->',
    		removeTags : true,
    		transform: function (filePath, file) {
    			return wrapTags(filePath, file, !!argv.prod);
    		}
  		}
  	))
 	.pipe(
		inject(
			gulp.src(['build/login/*.*']), 
			{
    		starttag: '<!-- inject:login:{{ext}} -->',
    		removeTags : true,
    		transform: function (filePath, file) {
    			return wrapTags(filePath, file, !!argv.prod);
    		}
  		}
  	))
	.pipe(gulp.dest('./'))
});

function wrapTags(filePath, file, isprod){
    			var starttag = '', endtag = '';
    			var path = require('path');

    			switch(path.extname(filePath).slice(1)){
    				case 'css' :
    					starttag = '<style>';
    					endtag = '</style>';
    					break;
    				case 'js'	:
    					starttag = '<script type="text/javascript">';
    					endtag = '</script>';
    					break;
    			}
    			
    			if(isprod){ //si es produccion
    				if(filePath.indexOf('.min.')!== -1){
    					return starttag + file.contents.toString('utf8') + endtag;
    				}
    				return '';
    			}
    			//No es produccion
    			if(filePath.indexOf('.min.')== -1){
    				return starttag + file.contents.toString('utf8') + endtag;
    			}
      		return '';     		
}


gulp.task('build-index-prod',['mapas-base-prod','landsat8-prod','uploadgeofile-prod'],  function () {
	gulp.src('src/index.html')
  .pipe(preprocess({context: { NODE_ENV: 'production', DEBUG: true}})) //To set environment variables in-line 
	.pipe(gulp.dest('./'))
});

gulp.task('test-preprocess', function () {
  gulp.src('src/templates/*.html')
  .pipe(preprocess({context: { NODE_ENV: 'production', DEBUG: false}}))  
  .pipe(concat('mapas_base.min.html'))
  .pipe(gulp.dest('build/'))
});

gulp.task('test-extractjs', function () {
  gulp.src('src/templates/*.html')
  
  .pipe(concat('mapas_base.js'))
  /*
  .pipe(extract({
      sel: "script,code.javascript"
  }))*/
  .pipe(jshint.extract('auto|always|never'))
  .pipe(gulp.dest('build/'))
});


gulp.task('build-uploadshp-prod',['uploadgeofile-prod'],  function () {
	gulp.src('src/uploadshp.html')
  .pipe(preprocess({context: { NODE_ENV: 'production', DEBUG: true}})) //To set environment variables in-line 
	.pipe(concat('uploadshp.php'))
	.pipe(gulp.dest('./'))
	//.pipe(browserSync.stream());
});

gulp.task('php', function() {
    php.server({  port: 8010, keepalive: true});
});

gulp.task('serve-uploadshp', ['php','build-uploadshp-prod'], function() {

    browserSync.init({
        proxy: '127.0.0.1:8010/uploadshp.php',
        port: 8080,
        open: true,
        notify: false
    });
/*
    gulp.watch("src/uploadgeofile/*.*", ['build-uploadshp-prod']);
    gulp.watch("build/*.html").on('change', browserSync.reload);
    */
    gulp.watch(['./*.php'], [reload]);
});