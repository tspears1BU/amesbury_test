module.exports = function (grunt) {
	// Require external packages.
	const autoprefixer = require("autoprefixer")
	const sass = require("node-sass")

	// 1. All configuration goes here
	grunt.initConfig({
		// 2. All functions go here.
		watch: {
			grunt: {
				files: ["Gruntfile.js"],
				options: {
					reload: true,
				},
			},
			scripts: {
				files: ["js-dev/**/*.js"],
				tasks: ["scripts"],
				options: {
					spawn: false,
				},
			},
			styles: {
				files: ["css-dev/**/*.scss"],
				tasks: ["styles"],
				options: {
					spawn: false,
				},
			},
			phplint: {
				files: ["**/*.php"],
				tasks: ["phplint"],
				options: {
					spawn: false,
				},
			},
		},
		browserify: {
			options: {
				watch: true,
				browserifyOptions: {
					debug: false,
					transform: [["babelify"]],
				},
			},
			dist: {
				files: [
					{
						expand: true, // Enable dynamic expansion.
						cwd: "js-dev/", // Src matches are relative to this path.
						src: ["*.js"], // Actual pattern(s) to match. Targets root JS files.
						dest: "js/", // Destination path prefix.
					},
				],
			},
		},
		uglify: {
			scripts: {
				options: {
					sourceMap: true,
				},
				expand: true,
				cwd: "js/",
				src: ["*.js"],
				dest: "js/",
			},
			vendor: {
				options: {
					sourceMap: true,
				},
				expand: true,
				cwd: "js/vendor",
				src: ["*.js", "!*.min.js"],
				dest: "js/vendor",
			},
		},
		sass: {
			options: {
				outputStyle: "compressed",
				implementation: sass,
				sourceMap: true,
				indentType: "space",
				indentWidth: 2,
				precision: "5",
				includePaths: [
					"node_modules/normalize-scss/sass",
					"node_modules/mathsass/dist/",
				],
				bundleExec: true,
			},
			devl: {
				options: {
					outputStyle: "expanded",
				},
				files: {
					"style.css": "css-dev/style.scss",
					"ie.css": "css-dev/ie.scss",
				},
			},
			prod: {
				files: {
					"style.min.css": "css-dev/style.scss",
					"ie.min.css": "css-dev/ie.scss",
					"admin/admin.css": "css-dev/admin.scss",
				},
			},
		},
		postcss: {
			defaults: {
				options: {
					map: {
						inline: false, // Save all sourcemaps as separate files.
					},
					processors: [
						autoprefixer, // add vendor prefixes.
					],
				},
				src: ["style.css", "style.min.css"],
			},
			admin: {
				options: {
					map: {
						inline: false, // Save all sourcemaps as separate files.
						annotation: "admin/", // Save to this specified directory.
					},
					processors: [
						autoprefixer, // add vendor prefixes.
					],
				},
				src: ["admin/admin.css"],
			},
		},
		version: {
			functions: {
				options: {
					prefix: "['\"]RESPONSIVE_\\w*_VERSION['\"],\\s*'",
				},
				src: ["functions.php"],
			},
			styles: {
				options: {
					prefix: "Version:\\s*",
				},
				src: ["css-dev/style.scss"],
			},
		},
		copy: {
			hooks: {
				options: {
					mode: true,
				},
				src: "hooks/post-merge",
				dest: ".git/hooks/post-merge",
			},
		},
		phplint: {
			options: {
				phpArgs: {
					"-l -f": null,
				},
			},
			all: {
				src: "**/*.php",
			},
		},
		addtextdomain: {
			options: {
				textdomain: "amesbury",
			},
			update_all_domains: {
				options: {
					updateDomains: true,
				},
				src: [
					"*.php",
					"**/*.php",
					"!.git/**/*",
					"!bin/**/*",
					"!node_modules/**/*",
					"!tests/**/*",
					"!vendor/**/*",
				],
			},
			target: {
				files: {
					src: [
						"**.php",
						"**/*.php",
						"!node_modules/**",
						"!node_modules/**",
						"!bin/**",
						"!vendor/**",
					],
				},
			},
		},
		makepot: {
			target: {
				options: {
					domainPath: "/languages",
					potFilename: "amesbury.pot",
					mainFile: "functions.php",
					potHeaders: {
						poedit: true,
						"x-poedit-keywordslist": true,
					},
					type: "wp-theme",
					updateTimestamp: true,
				},
			},
		},
		clean: {
			languages: ["languages/*"],
			js: ["js/**/*.js", "js/**/*.map"],
		},
		sasslint: {
			target: "css-dev/**/*.scss",
			// see .sasslintrc for options.
		},
	})

	// 3. Where we tell Grunt we plan to use this plug-in.
	grunt.loadNpmTasks("grunt-browserify")
	grunt.loadNpmTasks("grunt-contrib-watch")
	grunt.loadNpmTasks("grunt-contrib-concat")
	grunt.loadNpmTasks("grunt-contrib-copy")
	grunt.loadNpmTasks("grunt-contrib-uglify")
	grunt.loadNpmTasks("grunt-postcss")
	grunt.loadNpmTasks("grunt-sass")
	grunt.loadNpmTasks("grunt-notify")
	grunt.loadNpmTasks("grunt-version")
	grunt.loadNpmTasks("grunt-phplint")
	grunt.loadNpmTasks("grunt-wp-i18n")
	grunt.loadNpmTasks("grunt-contrib-clean")
	grunt.loadNpmTasks("grunt-sass-lint")

	// 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
	grunt.registerTask("install", ["copy:hooks", "build"])
	grunt.registerTask("i18n", ["clean:languages", "addtextdomain", "makepot"])
	grunt.registerTask("styles", ["version:styles", "sass", "postcss"])
	grunt.registerTask("scripts", [
		"version:functions",
		"clean:js",
		"browserify",
		"uglify",
	])
	grunt.registerTask("build", ["styles", "phplint", "scripts", "i18n"])
	grunt.registerTask("default", ["watch"])
}
