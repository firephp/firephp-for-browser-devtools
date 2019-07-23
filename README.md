![FirePHP Logo](https://rawgit.com/firephp/firephp-for-firefox-devtools/master/src/skin/Logo.png "FirePHP Logo")

FirePHP for Firefox Developer Tools
===================================

This project holds the [FirePHP Tool](http://firephp.org) in the form of a [Mozilla Web Extension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) which is compatible with the latest *Multiprocess Firefox Browser*.

> FirePHP is a logging system that can display PHP variables in a browser as an application is navigated. All communication is out of band to the application which means the logging data will not interfere with the normal functioning of the application.

On the **server** you need one of the following **PHP libraries**:

  * [FirePHPCore](https://github.com/firephp/firephp-core) - Simple
    * Limited data all sent via *HTTP headers*
    * No enable security
    * One file only
  * [FirePHP 1.0](https://github.com/firephp/firephp) - Advanced (**NOT YET IMPLEMENTED**)
    * *NOTE: Not all features provided by this library are implemented in the extension at this time.*
    * Data sent via *HTTP headers* and *secondary AJAX requests* to support logging in volume
    * Many features including enable security

Install
-------

### AMO Listed

Install from: [addons.mozilla.org/en-US/firefox/addon/firephp](https://addons.mozilla.org/en-US/firefox/addon/firephp/)

### Unlisted

**NOTE:** These downloads do **NOT** auto-update!

  1. Download latest: [dist/firephp.xpi](https://github.com/firephp/firephp-for-firefox-devtools/raw/master/dist/firephp.xpi) ([release history & known issues](https://github.com/firephp/firephp-for-firefox-devtools/wiki))
  2. Drag into Firefox

### Source

Requirements:

  * [bash 4](https://www.gnu.org/software/bash/) - GNU Bash
  * [nvm](https://github.com/creationix/nvm) - Node Version Manager

Build from source:

    rm -Rf dist/        # Optional to verify build
    nvm use 9
    npm install
    npm run build       # Append '--ignore-dirty' if you removed 'dist/'
    git diff            # Optional to verify build
        # Only the `version` property in `dist/firephp.build/manifest.json` should have changed.

*Load Temporary Addon* at `dist/firephp.build/` into Firefox.

Preview
-------

<img src="https://rawgit.com/firephp/firephp-for-firefox-devtools/master/src/skin/CodeScreenshot.png" alt="Code" width="300"> &nbsp; <img src="https://rawgit.com/firephp/firephp-for-firefox-devtools/master/src/skin/PanelScreenshot.png" alt="Panel" width="300">

Provenance
==========

Copyright 2016 [Christoph Dorn](http://christophdorn.com).
Licensed under the [Open Software License (OSL 3.0)](https://opensource.org/licenses/OSL-3.0).
Contributions must be licensed under the [Academic Free License (AFL 3.0)](https://opensource.org/licenses/AFL-3.0).
Learn about the OSL & AFL Licenses [here](http://rosenlaw.com/OSL3.0-explained.htm).

```
Open Software License (OSL) 3.0

You are free to:
    Use Commercially, Distribute, Modify, Use Patents, Use Privately

Under the following terms:
    Disclose source, License and copyright notice, Network use is distribution, Same license

You cannot:
    Use trademark, Hold liable, Claim warranty
```
```
Academic Free License (AFL) 3.0

You are free to:
    Use Commercially, Distribute, Modify, Use Patents, Use Privately

Under the following terms:
    License and copyright notice

You cannot:
    Use trademark, Hold liable, Claim warranty
```

> Well-crafted Contributions are Welcome.

**INTENDED USE:** The *Logic and Code contained within* forms a **Developer Tool** and is intended to operate as part of a *Web Software Development Toolchain* on which a *Production System* operates indirectly. It is **NOT INTENDED FOR USE IN HIGH-LOAD ENVIRONMENTS** as there is *little focus on Runtime Optimization* in order to *maximize API Utility, Compatibility and Flexibility*.

If you *need more* than what is contained within, study the Code, understand the Logic, and build your *Own Implementation* that is *API Compatible*. Share it with others who follow the same *Logic* and *API Contract* specified within. This Community of Users may want to use Your Work in their own *Software Development Toolchains*.
