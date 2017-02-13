# Gulp Tasks

A collection of utilities to help build, deploy, and develop Node.js apps.

## Installation

This isn't a module per se, but more of a set of utilities and guidelines which
can be modified to suit your specific project. I would simply copy these files
into the root of your own project folder such that `gulpfile.js` is at the root,
and so on. This way you can run `gulp task-name` from the root of your project
folder. Once copied, feel free to modify the tasks and tweak them for your
specific needs. That said, I've tried to make them generic enough such that you
don't require too much tweaking (if any) to get up and running.

## Usage

The main tasks defined here are as follows (as they would be executed from the
command line):

```bash
gulp server # Start local Node.js app, used for development
gulp build # Prepare all sourcecode for production environment
gulp rev # Apply revisions by renaming files based on content hash
gulp deploy # Copy all assets to server and restart Node.js app with PM2
gulp watch # Watch for changes to source files and run tasks when changed
```

Most of the time you will likely only ever use `gulp server` and `gulp deploy`
(the deploy task itself calls the `build` and `rev` tasks as part of its
operation). But, sometimes you might want to only `build` or `rev` depending on
what your development needs are.

When running `gulp deploy` be sure to include the `--host` flag to tell this
task which server it should deploy to (e.g., `gulp deploy --host my-host` where
`my-host` is defined in my SSH config file). You can use a fully qualified url
if you are not using the config file too (e.g.,
`gulp deploy --host username:password@hostname:/path`).

These compound tasks are further broken down as follows, although you likely
won't use these tasks since they are called from the above:

```bash
gulp build:assets # Gather all static assets into the build folder
gulp build:styles # Process SASS, concatenate to single file, minify, output to build folder
gulp build:html # Copy html files to build folder
gulp build:vendors # Concatenate vendor code to single file, browserify, minify, output to build folder
gulp build:client # Concatenate app code to single file, browserify, babelify, minify, output to build folder
gulp rev:assets # Rename all static asset files based on file contents hash
gulp rev:css # Rename all .css files based on file contents hash
gulp rev:js # Rename all .js files based on file contents hash
gulp rev:html # Rename file references in .html files based on generated manifest files
gulp deploy:assets # Copy all static assets to remote server
gulp deploy:server # Copy all Node.js app files to remote server
gulp deploy:reload # Install dependencies and reload PM2 instance for Node.js app
gulp clean # Utility task for removing previously built files from build folder
```

Note that the default gulp task launches the `server` task and watches certain
directories for file changes which will then launch other build tasks as needed
(you can modify the `gulpfile.js` to edit which directories get watched).

## Why?

While you can build your apps using any number of existing frameworks and
libraries, sometimes you want to have full control over your code. Sometimes a
big framework is overkill when you're making a little prototype. And other times
you might be looking to build your app in such a way that it doesn't depend on
some specific technology, so you can swap components depending on your changing
needs. Simpler build/deploy strategies exist (you don't need all this if you
just want to "get it online"), but with just a tiny bit of extra effort, using
the following tools and architectures can help get your from zero to real-world
much more quickly without redesigning your app when you're ready to handle some
real loads.

The goal of these gulp tasks, and corresponding server setup, is to 1) get up
and running ASAP, 2) automate repeatable tasks to reduce errors and speed up
continuous integration, and 3) to prepare your app for real-world scenarios so
that when your app is ready to go public, you can continue using the same
architecture to get you off the ground before you need to scale further.

This isn't the only way of doing this, but it's a workable way of doing it which
satisfies a lot of early stage needs for developing a web app. I've chosen to
use some very specific technologies not only because they're ones I know better
personally, but because I believe they help enable teams to hit the ground
running, getting a real working app sooner prior to getting wrapped up in
trying to solve scaling problems.

Tech Stack:

- [Node.js](https://nodejs.org) backend app server (every web dev knows JS)
- [Browserify](http://browserify.org/) client app build (use npm packages for front-end dev)
- [Babel](https://babeljs.io/) transpile ES6+ down to ES5 (use new tools while still supporting old browsers)
- [Nginx](https://www.nginx.com/) reverse proxy/load balancer
- [PM2](https://github.com/Unitech/pm2) app process manager
- [Gulp](http://gulpjs.com/) task runner

## Architecture

This setup makes some assumptions about how you want to setup your project. For
the most part, when I make apps, I'm mostly making "rapid prototypes" to test
out ideas and create proof-of-concepts. I've found that working with Node.js
on the backend and auto-generating browserified front-end scripts, styles, and
assets serves this purpose best. For my target server environment, I like using
nginx as a reverse proxy to my Node.js app which gets loaded by PM2 on an
Ubuntu box. These are all well documented and well used technologies which are
capable of scaling to a medium-sized load to take any project from the
kicking-the-tires stage to signing-up-real-users stage. From there, further
scaling is still possible using this setup, or refactoring some tech for more
app-specific optimizations may be in order. The point is, scaling is decent, but
rapid development is emphasized. IMHO, until you have an app *worth* scaling,
there's no point wasting effort on optimizing for 1M users before you have 1. I
believe this setup should scale fairly well into the thousands of users before
a revision is necessary (e.g., I've transitioned this type of app into an auto-
scaling Elastic Beanstalk app without much trouble, when it was deemed necessary
but otherwise have found it much easier to get up an running quickly with these
simple techniques).

The abstract target environment looks something like this:

```
                            [s3] <------------                   [slave]
                             |                \                     ^
                             |       ---> [pm2/node(1)] <---        |
                             V      /                       \       |
[world] <---> [CDN] <---> [nginx] <-----> [pm2/node(2)] <-----> [database]
                             ^      \                       /
                             |       ---> [pm2/node(n)] <---
                             V
                        [memcached]
```

That said, when prototyping, we will simply use something like this, maybe even
all on the same machine to start off:

```

[world] <---> [nginx] <---> [pm2/node] <---> [database]

```

By leveraging nginx we can serve all static assets directly with its config and
terminate TLS, connecting to the Node.js app behind nginx such that it acts as
a reverse proxy and load balancer to any number of Node.js instances. This works
well up to a certain amount of load before requiring something more
sophisticated. This way, the Node.js app can focus solely on handling requests
which require computation (e.g., not simply sending a static file) without
needing to worry about how TLS is setup (connecting to nginx over an internal,
plain, http connection).

Files are transferred to the remote server using `rsync` and remote commands
are executed using `ssh`. The deploy task takes a "host" parameter which can
either be a fully qualified ssh host or a shortcut which you've defined in your
SSH config file.

## Configuration

These tasks try not to make any assumptions about how you setup your project's
folder structure, allowing you to define locations in the `config/gulp.js` file.
But some explanation of the terminology used is warranted.

This config file is devided into 3 categories:

1. build
2. rev
3. deploy

### Build

For build tasks, there are 4 main options to configure which are simply pointers
to certain paths relative to the project root: root, stylesheets,
javascripts, and one or more "client" paths.

`root` is the target "build" folder to where you want your resulting build files
to be written.

`stylesheets` specifies to where you would like your resulting CSS files to be
written.

`javascripts` specifies to where you would like your resulting client-side
javascript builds to reside.

`client` specifies where the root of your client-side app will live (e.g., where
the `index.html` file entry-point for your client-side app goes. I've named it
simply "client" here, but you could rename this, and add any number of
additional client paths, beyond this single path, as you see fit. The goal is
to refer to the other paths from the html file that you put in this directory.

### Rev

For rev tasks, there are 3 temporary files needed to keep track of any renamed
files. These are "manifest" files, and they can be renamed to whatever you like
using these config options. For all intents and purposes, you don't need to
change any of these settings since they are only internal and temporary files
which won't affect your app in any way. But, if you want to control what these
files are named, you can do so here.

### Deploy

Deploy tasks require a few references to where, on the remote server, your app's
files should be installed along with a reference to your server's host itself.
The following settings are necessary in order to deploy using these tasks:

`host` stores a reference to the SSH host name where you will be deploying your
app. You can store this in the config file directly (recommended for convenience
if you are using the SSH config for all your credentials; do not save passwords
here). You can, alternatively, tell the deploy task what host you wish to use
on the command line as well using the `--host` flag so that you do not need to
store your password or private key in your config.

`appRoot` points to where your Node.js app will live on the remote server. In a
unix environment it is recommended to store such "optional" apps under the
`/opt` directory.

`staticRoot` points to where all your static asset files (images, fonts,
stylesheets, and client-side javascripts) will be stored. This directory will
be referenced by nginx which will serve any files in this directory to the
public. Do not store any files you do not want served to the public here.

`pm2Conf` points to where you will store your PM2 config file which will be used
to launch the Node.js app on the remote server. This should be stored in a more
strictly permitted directory to which other processes do not have access.

## Target Environment for Remote Server (Ubuntu, Node.js, Nginx, PM2)

While you could setup your remote environment in any number of different way,
I'm assuming a specific setup for these tasks. You should be able to modify
these tasks however you like to serve your needs, but out of the box they work
with the following setup.

### Ubuntu

Ubuntu is a fairly standard, well tested/used, and easy to setup Linux distro
which usually comes in pre-installed packages from most hosting providers. I
really like using its Debian-based [Apt](https://wiki.debian.org/Apt) package
manager to setting up the environment. You could use other flavours of Linux if
you like, but I find Ubuntu's user-friendliness to be one of the best.

### Node.js

When hacking together a brand-new, unproven, web application, I like starting
with Node.js before considering other technologies for general-purpose
development on the backend server. The main reason being that working with other
web devs is much easier, faster, and more efficient since it uses a language and
stack of tools that these devs are already familiar with.

After the app is proven to be successful (whatever that means), I might revisit
the tech stack to further optimize its performance (which may mean switching to
a different language depending on the problem domain), but at the very start
when I don't even really know what it is I'm building yet, I like using JS
first, until I have a good reason not to.

### Nginx

Nginx is a great http server and very fast at serving static assets so that your
slower Node.js app can focus solely on requests that absolutely require it (e.g.,
anything require some computation or database access). It also makes for a quick
and easy load balancer by using its reverse-proxy configurations. This enables
you to horizontally scale up to a certain size by launches additional Node.js
app instances behind Nginx itself.

This configuration isn't suitable for handling the load of a million users, but
is likely sufficient to get you from zero to  thousands of users (the point at
which you can consider the app "successful", however you define success, and can
then work on scaling further with different strategies). My thinking is that
this setup is a great balance of ease-of-setup, power-to-scale (up to a certain
point), and flexibility to change configurations in a continually changing
development context.

### PM2

I like using PM2 for managing my actual Node.js processes. It's very simple to
setup and helps with restarting instances whenever the server crashes or
reboots, enables easy monitoring and configuration of environment variables, and
can be configured to cluster app instances across multiple cores with simple
configuration options.

Like the choice to use Node.js, this may or may not be the best final solution
at scale, but it's a great place to start until your app reaches escape
velocity. The point being that less time is spent on "getting it to work" and
more time can be spent on figuring out what "it" is.

## Running the Server Locally (for dev)

Running `gulp server` locally will attempt to launch your backend node server
with `NODE_ENV=development` by looking for the file `./server/start.js`. If your
node server script is located in a different directory or is named something
else, you can change the reference in `./tasks/server.js` on line 17 with the
path to your own script.

This task uses Node.js's `child_process` `spawn` method to create a new process
and kill it when exited. Extremely lightweight and simple.

This task is also called from the default task.

## Building the Client (Static Assets, Scripts, and Styles)

There are a series of "build" tasks which take some raw input and output
modified versions, usually transpiled and minified to prepare development code
for deployment and consuption by clients.

### Assets

Static asset files such as images, fonts, icons, etc. The `build:assets` and
`build:html` tasks are mainly a "copy" task that moves these files from their
development location (e.g., under `./assets`) to the final build location in
preparation for  deployment to the remote server.

Edit the `./tasks/build-assets.js` file to change the location of your assets.

### Styles

CSS is processed by `build:styles` by concatenating all imports found in the
source file(s) as [SASS](http://sass-lang.com/), it is
[autoprefixed](https://github.com/postcss/autoprefixer) so that you don't need
to worry about any vendor prefixes (e.g., `-webkit-`, `-moz-`, or `-ms-`), it is
minified in production mode using [cssnano](https://github.com/ben-eb/cssnano)
and finally, sourcemaps are produced (in dev mode only). This produces a single
file as output which represents all your SASS code as regular CSS, ready to
load from your html file.

Edit the `./tasks/build-styles.js` file to change the name of the output file
as well as the source SASS file(s).

Personally, I like making a folder called "styles" in the root of my project
folder, inside which I create a new folder for each separate stylesheet I wish
to manage (e.g., "admin", "client", "marketing", etc.). Each of those folders
would contain SASS files referenced by an index file (with imports) which would
compile down to individual CSS files used for different purposes. To build more
than one stylesheet, simply duplicate the main `build:styles` task and make
additional tasks along the same lines, pointing to different input/output files.

### Scripts

The most complex build tasks involve client-side javascript. I've opted to use
2 separate builds separating "vendor" scripts from "app" scripts. This way,
when I re-build (e.g., if I'm running the watch task, looking for any changes)
I don't need to re-build the entirety of the vendor stack if I've only changed
some of my app code. The bulk of the code likely comes from vendors, so this
greatly increases the speed of re-building your app while you're developing so
you can see your changes in action much more quickly.

In the `./tasks/build-scripts.js` file, there is a `vendors` array at the top
which lists all the vendor's npm package names which you'd like to include in
this vendor script (which will also be excluded from your app-specific script).
The `build:vendors` task is optional. You can choose not to use this task if
you'd rather everything be built in one big file. But some additional
optimizations can be had for your users as well; if you update your app, but
keep the same vendors, your users won't need to re-download the big vendor file,
only your much smaller app file.

The `build:client` task is for putting together your app-specific code
(excluding your vendor-specific imports defined in `vendors`).

Both vendors and client build tasks use Browserify to compile all dependencies
using Node.js's CommonJS `require` (or, if using ES6 syntax, `import`). On top
of Browserify, they are also parsing app code through Babel to transpile newer
ES6+ syntax down to common ES5 syntax which is more greatly supported by all
browsers. Both tasks output sourcemaps in dev mode to help with debugging. And
both tasks will use [Uglify](https://github.com/mishoo/UglifyJS) to minify the
resulting complied code when in production mode.

Edit `./tasks/build-scripts.js` to change which vendors you'd like to include,
and what Babel presets/plugins you'd like to use. I've included 'es2015' and
'react' presets along with the 'transform-object-rest-spread' plugin. Feel free
to adjust as needed.

## Making Revisions (and Busting Caches)

"Revisions" are a way of renaming your static assets in such a way that when any
of your files are modified, they will automatically break any users' client-side
cache, while indicating to users' browsers that any files that have not changed
can still be loaded from their cache. This helps client browsers know what files
they need to re-download and which ones they can continue using, speeding up
load times while ensuring that any new changes are always fetched from the
server.

The way this works is by hashing the contents of the files themselves and
renaming the files to include this hash in the filenames. This way, if the
file has not changed, the hash of the file (and consequently its name) will
remain unchanged, indicating to the browser that it can continue using its
cached version of that file. If, on the other hand, a file has been modified,
this will be reflected in its hash, and thus its name will be different, forcing
the browser to download the new version since it will not have a local copy of
the file, named as it is with its latest hash.

For example:

`my-filename.js` might be changed to `my-filename-d41d8cd98f.js`

During development, if `my-filename.js` is modified, re-hashing its contents
would generate a different filename, such as `my-filename-273c2c123f.js` which
would force the browser to treat it as a completely new file and download a
fresh copy from the server, ensuring that all users have the latest version of
the file, while maintaining use of the browser's local cache whenever possible.

The rev tasks do a couple things:

1. pass over all static files (assets, stylesheets, javascripts) and rename
the final, built versions, based on their contents (as described above).

2. then, go through html files defined by the `client` attribute in the gulp
config file under `build` and update any references to static assets so that
they point to the newly "reved" versions of those files

## Deployment (Rsync + SSH)

Deployment happens in 2 phases: 1) copy all files to remote server, 2) run
remote commands to reload all changes (e.g., install npm packages and reload
the PM2 instance).

All copying is done using [rsync](https://github.com/jerrysu/gulp-rsync). All
remote commands are done through SSH by spawning a tiny node process over the
given host.

If there are other steps in your deployment process you'd like to  add, you can
add them to the `remoteCommandList` array found in the `deploy:reload` task.

## License

MIT
