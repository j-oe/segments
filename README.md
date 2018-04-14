# Semantic PDF Segmentation - SEMANTiCS 2018
This repository contains the prototypical implementation of the ideas presented in the submitted paper: Semantic PDF Segmentation for Legacy Documents in Technical Documentation.

The implementation is based on previous work available at:
http://janoevermann.de/

## Hosted demo
A hosted demo is available at:
http://segments.fastclass.de

## Run demo locally
To run a local version of the demo:
1. clone the repository
2. build from source (see below)
3. start a web server in the `dist` folder
4. navigate your browser to the location

## Build from source
To build the demo from source you need to have the following tools globally installed:
- *npm* (for development dependencies)

Execute the following steps to set up the development environment (directory `src`). A build will be automatically initiated
1. `npm install`

To generate a new build from source (directory `dist`):
1. `gulp build`