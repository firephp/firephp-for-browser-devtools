**Stability: Experimental. Use at your own risk! Not much to see. [Watch for updates!](https://github.com/firephp/firephp-for-firefox-devtools/issues/1)**

![FirePHP Logo](https://rawgit.com/firephp/firephp-for-firefox-devtools/master/src/skin/Logo.png "FirePHP Logo")

FirePHP for Firefox Developer Tools
===================================

This project holds the [FirePHP Tool](http://firephp.org) in the form of a [Mozilla Web Extension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) which is compatible with the latest *Multiprocess Firefox Browser*.

> FirePHP is a logging system that can display PHP variables in the browser as an application is navigated. All communication is out of band to the application which means the logging data will not interfere with the normal functioning of the application.

On the **server** you need one of the following **PHP libraries**:

  * [FirePHPCore](https://github.com/firephp/firephp-core) - Simple
    * Limited data all sent via *HTTP headers*
    * No enable security
    * One file only
  * [FirePHP 1.0](https://github.com/firephp/firephp) - Advanced
    * *NOTE: Not all features provided by this library are implemented in the extension at this time.*
    * Voluminous data sent via HTTP headers and *data & interaction endpoints*
    * Many features including enable security

Install
-------

  1. Download: [dist/firephp.xpi](https://github.com/firephp/firephp-for-firefox-devtools/raw/master/dist/firephp.xpi)
  2. Drag into Firefox


Provenance
==========

Original Source Logic under [Mozilla Public License 2.0](https://opensource.org/licenses/MPL-2.0) by [Christoph Dorn](http://christophdorn.com) since 2007.

```
Mozilla Public License 2.0

You are free to:
    Commercial Use, Modify, Distribute, Sublicense, Place Warranty, Use Patent Claims

Under the following terms:
    Include Copyright, Include License, Disclose Source, Include Original

You cannot:
    Use Trademark, Hold Liable
```

> Well-crafted Contributions are Welcome.

**INTENDED USE:** The *Logic and Code contained within* forms a **Developer Tool** and is intended to operate as part of a *Web Software Development Toolchain* on which a *Production System* operates indirectly. It is **NOT INTENDED FOR USE IN HIGH-LOAD ENVIRONMENTS** as there is *little focus on Runtime Optimization* in order to *maximize API Utility, Compatibility and Flexibility*.

If you *need more* than what is contained within, study the Code, understand the Logic, and build your *Own Implementation* that is *API Compatible*. Share it with others who follow the same *Logic* and *API Contract* specified within. This Community of Users will likely want to use Your Work in their own *Software Development Toolchains*.
