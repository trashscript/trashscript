/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Author: <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    user_banner: "// ==UserScript==\n" +
                 "// @name	   <%= pkg.name %>\n" +
                 "// @author	 <%= pkg.author.name %>\n" +
                 "// @namespace  <%= pkg.homepage %>\n" +
                 "// @version	<%= pkg.version %>\n" +
                 "// @description  <%= pkg.description %>\n" +
                 "// @run-at		document-start\n" +
                 "// @include	*://8chan.co/*\n" +
                 "// ==/UserScript==\n",
    // Task configuration.
    concat: {
      dist: {
        src: ['lib/3rd/zepto.min.js', 'lib/*.lib.js', 'lib/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.no-css.js'
      }
    },
    cssmin: {
      dist: {
          src: ['css/hover.css'],
          dest: 'dist/hover.min.css'
      }
    },
    includes: {
      dist: {
          options: {
            includeRegexp: /@()([\S]+?)@/i
          },
          src: ['<%= concat.dist.dest %>'],
          dest: 'tmp',
          cwd: '.',
          flatten: true
      }
    },
    uglify: {
      options: {
        stripBanners: true,
        banner: '<%= user_banner %>'
      },
      dist: {
        src: '<%= includes.dist.dest %>/<%= pkg.name %>-<%= pkg.version %>.no-css.js',
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.user.js'
      }
    },
    obfuscator: {
      files: ['<%= uglify.dist.dest %>'],
      entry: '<%= uglify.dist.dest %>',
      out: 'dist/<%= pkg.name %>-<%= pkg.version %>.omin.js',
      strings: true,
      root: __dirname
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        //newcap: true,
        noarg: true,
        sub: true,
        //undef: true,
        //unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/*.js', 'test/**/*.js']
      }
    },
    qunit: {
      files: ['test/**/*.js']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    },
    'string-replace': {
      deploy: {
          options: {
              replacements: [
                  {pattern: /\$userscript\$/g, replacement: "<%= pkg.name %>-<%= pkg.version %>.min.user.js"}
              ]
          },
          files: [
              {expand: true, src: "static/**/*.html", dest: "tmp/"}
          ]
      }
    },
    'ftp-deploy': {
      deploy: {
          auth: {
              host: "ftp.trashscript.x10.mx",
              port: 21,
              authKey: 'key1'
          },
          src: "deploy/",
          dest: "/"
      }
    },
    copy: {
        deploy: {
            desti: "deploy/",
            files: [
                {expand: true, cwd: 'static/', src: '**', dest: "<%= copy.deploy.desti %>", filter: function(src) {
                    if (src.match(/.+(\.scss|\.map)/i)) {
                        return false;
                    }
                    return true;
                }},
                {expand: true, cwd: 'tmp/static/', src: '**', dest: "<%= copy.deploy.desti %>"},
                {expand: true, src: '<%= uglify.dist.dest %>', dest: "<%= copy.deploy.desti %>"}
            ]
        }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-obfuscator");
  grunt.loadNpmTasks("grunt-includes");
  grunt.loadNpmTasks("grunt-string-replace");
  grunt.loadNpmTasks("grunt-ftp-deploy");
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
    grunt.registerTask('minify', ['jshint', 'cssmin', 'concat:dist', 'includes', 'uglify']);
    grunt.registerTask('_deploy', ['string-replace:deploy', 'copy:deploy', 'ftp-deploy:deploy']);

    grunt.registerTask('deploy', "task", function() {
        grunt.task.run(['minify', '_deploy']);
    });

};
