**Stability: Experimental. Use at your own risk!**

FirePHP for Firefox Developer Tools
===================================

**Work in Progress: Watch for updates.**

This project holds the **FirePHP Tool** in the form of a [Mozilla Web Extension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) which is compatible with the latest *Multiprocess Firefox Browser*.

> FirePHP is an advanced logging system that can display PHP variables in the browser as an application is navigated. All communication is out of band to the application which means the logging data will not interfere with the normal functioning of the application.

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

**Linked:**

  1. Click [here]() to install `dist/firephp.xpi`

**Manual:**

  1. Download: `dist/firephp.xpi`
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
