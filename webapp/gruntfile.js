module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
              banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
              src: 'src/js/index.js',
              dest: 'dist/js/<%= pkg.name %>.min.js'
            }
          },
        sass: {                              // Task
            dist: {                            // Target
                options: {                       // Target options
                    style: 'expanded'
                },
                
                files: {
                    'dist/style/main.css': 'src/style/style.scss',
                }
            }
        },
        copy: {
          main: {
            files: [
              // includes files within path
              {expand: true, src: ['src/res'], dest: 'dist/res', filter: 'isFile'},
              {expand: true, src: ['node_modules/jquery/dist/jquery.js'], dest: 'dist/lib/jquery/jquery.js', filter: 'isFile'}

        
            ],
          },
        },
        watch: {
          scripts: {
            files: ['src/style/**/*.scss','src/js/**/*.js'],
            tasks: ['style','jsugly'],
            options: {
              spawn: false,
            },
          },
        },
    })
    
    grunt.loadNpmTasks('grunt-contrib-sass')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-copy')

    grunt.registerTask('style', ['sass'])
    grunt.registerTask('jsugly', ['uglify'])
}