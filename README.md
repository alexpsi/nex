# Flow (WIP)

[![Build Status](https://travis-ci.org/alexpsi/nex.svg?branch=master)](https://travis-ci.org/alexpsi/nex)
[![Coverage Status](https://coveralls.io/repos/github/alexpsi/nex/badge.svg?branch=master)](https://coveralls.io/github/alexpsi/nex?branch=master)

Flow is an __unofficial__ command line client for Transifex's API that also incorporates a listener for Transifex and Github webhooks. It can be used to design complex workflows that integrate TX services with a Github repository thus creating a Continuous Localization system. This software is provided as is and it is still experimental, so __use at your own risk__.

### Installing

Make sure you have got Node 6.9.5+ installed, otherwise use nvm to
set up an enviroment.

After that install the client globally by:

```
npm install -g https://github.com/alexpsi/nex
```

After installation the `flow` command is made available at your shell.

### Documentation

### Development and testing

To set up a local dev environment, delete any global instances of
the client and link the local repo to the command.

```
npm uninstall -g https://github.com/alexpsi/nex
git clone https://github.com/alexpsi/nex
cd nex
yarn
yarn link
```

In order to run the tests you would need to expose certain enviroment variables

```
export TX_USERNAME=username
export TX_TOKEN=token
export TX_HOST=https://www.transifex.com
```

And after that end-to-end tests can be run with `yarn test`.

## Built With

* [commander.js](https://github.com/tj/commander.js/) - CLI Framework
* [Listr](https://github.com/SamVerschueren/listr) - Terminal Task list

## Author

* [alexpsi](https://github.com/alexpsi)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
