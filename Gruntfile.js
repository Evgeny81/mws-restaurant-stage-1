module.exports = function (grunt) {

    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {
                    sizes: [{
                        width: 400,
                        suffix: '_sm',
                        quality: 50,
                        rename: false,
                    },
                        {
                        width: 600,
                        suffix: '_md',
                        quality: 50,
                        rename: false,
                    }
                    ]
                },

                files: [
                    {
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img/',
                    dest: 'img/responsive'
                },
                ]
            }
        },

        /* Clear out the images directory if it exists */
        clean: {
            dev: {
                src: ['img/responsive'],
            },
        },
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('default', ['clean', 'responsive_images']);

};
