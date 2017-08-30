/* jshint node: true */
'use strict';

var gulp        = require('gulp'),
    g           = require('gulp-load-plugins')({lazy: false}),
    bowerFiles  = require('main-bower-files'),
    bower       = require('./bower'),
    es          = require('event-stream'),
    lazypipe    = require('lazypipe'),
    stylish     = require('jshint-stylish'),
    queue       = require('streamqueue'),
    rimraf      = require('rimraf'),
    noop        = g.util.noop,
    minifyCSS   = require('gulp-minify-css'),
    sass        = require('gulp-sass'),
    os          = require('os'),
    open        = require('gulp-open'),
    isWatching  = false;

  var htmlminOpts = {
    removeComments: true,
    collapseWhitespace: true,
    removeEmptyAttributes: false,
    collapseBooleanAttributes: true,
    removeRedundantAttributes: true
  };

  /**
   * JS Hint
   */
  gulp.task('jshint', function () {
    return gulp.src([
      './gulpfile.js',
      './src/**/*.js'
    ])
      .pipe(g.cached('jshint'))
      .pipe(jshint('./.jshintrc'))
      .pipe(livereload());
  });

  /**
   * CSS
   */
  gulp.task('clean-css', function (done) {
    rimraf('./.tmp/assets/css', done);
  });

  gulp.task('styles', ['clean-css'], function () {
    return gulp.src('./src/assets/scss/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(g.concat('style.css'))
      //.pipe(minifyCSS())
      .pipe(gulp.dest('./.tmp/assets/css'))
      .pipe(gulp.dest('./src/assets/css'))
      .pipe(g.cached('built-css'))
      .pipe(livereload());
  });

  gulp.task('styles-dist', ['styles'], function () {
    return cssFiles().pipe(dist('css', bower.name));
  });

  gulp.task('csslint', ['styles'], function () {
    return cssFiles()
      .pipe(g.cached('csslint'))
      .pipe(g.csslint('./.csslintrc'))
      .pipe(g.csslint.reporter());
  });

  /**
   * Scripts
   */
  gulp.task('scripts-dist', ['templates-dist'], function () {
    return appFiles().pipe(dist('js', bower.name, {ngAnnotate: true}));
  });

  /**
   * Templates
   */
  gulp.task('templates', function () {
    return templateFiles().pipe(buildTemplates());
  });

  gulp.task('templates-dist', function () {
    return templateFiles({min: true}).pipe(buildTemplates());
  });

  /**
   * Vendors
   */
  gulp.task('vendors', function () {
    var files = bowerFiles();

    var vendorJs = fileTypeFilter(files, 'js');
    var vendorCss = fileTypeFilter(files, 'css');
    var q = new queue({objectMode: true});
    if (vendorJs.length) {
      q.queue(gulp.src(vendorJs).pipe(dist('js', 'vendors')));
    }
    if (vendorCss.length) {
      console.log(vendorCss);
      q.queue(gulp.src(vendorCss).pipe(dist('css', 'vendors')));
    }
    return q.done();
  });

  /**
   * Index
   */
  gulp.task('index', index);
  gulp.task('build-all', ['styles', 'templates'], index);

  function index () {
    var opt = {read: false};
    return gulp.src('./src/index.html')
      .pipe(g.inject(gulp.src(bowerFiles(), opt), {ignorePath: 'bower_components', starttag: '<!-- inject:vendor:{{ext}} -->'}))
      .pipe(g.inject(es.merge(appFiles(), cssFiles(opt)), {ignorePath: ['.tmp', 'src']}))
      .pipe(gulp.dest('./src'))
      .pipe(g.embedlr())
      .pipe(gulp.dest('./.tmp/'))
      .pipe(livereload());
  }

  /**
   * Assets
   */
  gulp.task('assets', ['fonts'], function () {
    return gulp.src('./src/images/**')
      .pipe(gulp.dest('./dist/images'));
    return gulp.src('./src/fonts/**')
      .pipe(gulp.dest('./dist/fonts'));
  });

  gulp.task('fonts', function () {
    return gulp.src('./src/fonts/**')
      .pipe(gulp.dest('./dist/fonts'));
  });

  /**
   * Dist
   */
  gulp.task('dist', ['vendors', 'assets', 'styles-dist', 'scripts-dist'], function () {
    return gulp.src('./src/index.html')
      .pipe(g.inject(gulp.src('./dist/{js,css}/vendors.min.{js,css}'), {ignorePath: 'dist', starttag: '<!-- inject:vendor:{{ext}} -->'}))
      .pipe(g.inject(gulp.src('./dist/{js,css}/' + bower.name + '.min.{js,css}'), {ignorePath: 'dist'}))
      .pipe(g.htmlmin(htmlminOpts))
      .pipe(gulp.dest('./dist/'));
  });

  /**
   * Static file server
   */
  gulp.task('statics', ['open'], g.serve({
    port: 3000,
    root: ['./.tmp', './.tmp/src', './src', './bower_components']
  }));

  var browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? 'google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));

  /* Open an URL in a given browser
  */
  gulp.task('open', function(){
    var options = {
      uri: 'http://localhost:3000/',
      app: browser
    };
    gulp.src(__filename)
    .pipe(open(options));
  });

  /**
   * Watch
   */
  gulp.task('serve', ['watch']);
  gulp.task('watch', ['statics', 'default'], function () {
    isWatching = true;
    // Initiate livereload server:
    g.livereload.listen();
    gulp.watch('./src/**/*.js', ['jshint']).on('change', function (evt) {
      if (evt.type !== 'changed') {
        gulp.start('index');
      } else {
        g.livereload.changed(evt);
      }
    });
    gulp.watch('./src/index.html', ['index']);
    gulp.watch(['./src/**/*.html', '!./src/index.html'], ['templates']);
    gulp.watch(['./src/assets/scss/*.scss'], ['csslint']).on('change', function (evt) {
      if (evt.type !== 'changed') {
        gulp.start('index');
      } else {
        g.livereload.changed(evt);
      }
    });
  });

  /**
   * Default task
   */
  gulp.task('default', ['lint', 'build-all']);

  /**
   * Lint everything
   */
  gulp.task('lint', ['jshint', 'csslint']);

  /**
   * Test
   */
  gulp.task('test', ['templates'], function () {
    return testFiles()
      .pipe(g.karma({
        configFile: 'karma.conf.js',
        action: 'run'
      }));
  });

  /**
   * Inject all files for tests into karma.conf.js
   * to be able to run `karma` without gulp.
   */
  gulp.task('karma-conf', ['templates'], function () {
    return gulp.src('./karma.conf.js')
      .pipe(g.inject(testFiles(), {
        starttag: 'files: [',
        endtag: ']',
        addRootSlash: false,
        transform: function (filepath, file, i, length) {
          return '  \'' + filepath + '\'' + (i + 1 < length ? ',' : '');
        }
      }))
      .pipe(gulp.dest('./'));
  });

  /**
   * Test files
   */
  function testFiles() {
    return new queue({objectMode: true})
      .queue(gulp.src(fileTypeFilter(bowerFiles(), 'js')))
      .queue(gulp.src('./bower_components/angular/angular.js'))
      .queue(gulp.src('./bower_components/angular-mocks/angular-mocks.js'))
      .queue(appFiles())
      .queue(gulp.src(['./src/components/**/*.spec.js', './.tmp/components/**/*.spec.js']))
      .done();
  }

  /**
   * All CSS files as a stream
   */
  function cssFiles (opt) {
    return gulp.src('./.tmp/assets/css/**/*.css', opt);
  }

  /**
   * All AngularJS application files as a stream
   */
  function appFiles () {
    var files = [
      './.tmp/' + bower.name + '-templates.js',
      './.tmp/src/components/**/*.js',
      '!./.tmp/src/components/**/*.spec.js',
      './src/components/**/*.js',
      '!./src/components/**/*.spec.js'
    ];
    return gulp.src(files)
      .pipe(g.angularFilesort());
  }

  /**
   * All AngularJS templates/partials as a stream
   */
  function templateFiles (opt) {
    return gulp.src(['./src/**/*.html', '!./src/index.html'], opt)
      .pipe(opt && opt.min ? g.htmlmin(htmlminOpts) : noop());
  }

  /**
   * Build AngularJS templates/partials
   */
  function buildTemplates () {
    return lazypipe()
      .pipe(g.ngHtml2js, {
        moduleName: bower.name,
        prefix: '/' + bower.name + '/',
        stripPrefix: '/src'
      })
      .pipe(g.concat, bower.name + '-templates.js')
      .pipe(gulp.dest, './.tmp')
      .pipe(livereload)();
  }

  /**
   * Filter an array of files according to file type
   *
   * @param {Array} files
   * @param {String} extension
   * @return {Array}
   */
  function fileTypeFilter (files, extension) {
    var regExp = new RegExp('\\.' + extension + '$');
    return files.filter(regExp.test.bind(regExp));
  }

  /**
   * Concat, rename, minify
   *
   * @param {String} ext
   * @param {String} name
   * @param {Object} opt
   */
  function dist (ext, name, opt) {
    opt = opt || {};
    return lazypipe()
      .pipe(g.concat, name + '.' + ext)
      .pipe(gulp.dest, (ext === 'js') ? './dist/components' : './dist/assets/css')
      .pipe(opt.ngAnnotate ? g.ngAnnotate : noop)
      .pipe(opt.ngAnnotate ? g.rename : noop, name + '.annotated.' + ext)
      .pipe(opt.ngAnnotate ? gulp.dest : noop, './dist/components')
      .pipe(ext === 'js' ? g.uglify : g.minifyCss)
      .pipe(g.rename, name + '.min.' + ext)
      .pipe(gulp.dest, (ext === 'js') ? './dist/components' : './dist/assets/css')();
  }

  /**
   * Livereload (or noop if not run by watch)
   */
  function livereload () {
    return lazypipe()
      .pipe(isWatching ? g.livereload : noop)();
  }

  /**
   * Jshint with stylish reporter
   */
  function jshint (jshintfile) {
    return lazypipe()
      .pipe(g.jshint, jshintfile)
      .pipe(g.jshint.reporter, stylish)();
  }
