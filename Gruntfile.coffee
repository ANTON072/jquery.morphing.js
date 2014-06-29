pkg = require './package.json'

###
grunt設定
###
module.exports = (grunt) ->

  for taskName of pkg.devDependencies
    if taskName.substring(0, 6) == 'grunt-' then grunt.loadNpmTasks taskName

  config =

    pkg: grunt.file.readJSON('package.json')
    banner: """
      /*! <%= pkg.name %> (<%= pkg.repository.url %>)
       * lastupdate: <%= grunt.template.today("yyyy-mm-dd") %>
       * version: <%= pkg.version %>
       * author: <%= pkg.author.name %>
       * License: MIT */

      """

    ###
    grunt-contrib-jshint
    ###
    jshint:
      options:
        jshintrc: '.jshintrc'
      source:
        expand: true
        cwd: '.'
        src: [ 'jquery.morphing.js' ]
        filter: 'isFile'

    ###
    grunt-contrib-uglify
    ###
    uglify:
      options:
        banner: '<%= banner %>'
      source:
        src : 'jquery.morphing.js'
        dest: 'jquery.morphing.min.js'

    ###
    grunt-contrib-connect
    @ ローカルサーバー
    ###
    connect:
      server:
        options:
          port    : 3000
          base    : './'
          hostname: '0.0.0.0'
          spawn   : false

    ###
    grunt-notify
    @ ビルド通知
    ###
    notify:
      build:
        options:
          title  : 'ビルド完了'
          message: 'タスクが正常終了しました。'
      watch:
        options:
          title  : '監視開始'
          message: 'ローカルサーバーを起動しました'

    ###
    grunt-contrib-watch
    @ 更新監視
    ###
    watch:
      options:
        livereload: true
        spawn     : false
      js:
        files: [ './*.js' ]
        tasks: [
          'jshint'
          'uglify'
          'notify:build'
        ]

  grunt.initConfig( config )

  grunt.registerTask 'default', []

  grunt.registerTask 'start', [
    'jshint'
    'uglify'
    'notify:watch'
    'connect'
    'watch'
  ]

  grunt.registerTask 'build', [
    'jshint'
    'uglify'
    'notify:build'
  ]
