const BaseClient = require('webpack-dev-server/client/clients/WebsocketClient');

module.exports = class WebsocketClient extends BaseClient {
  constructor(url) {
    // We ignore url here and hard-code the address of the webpack dev
    // server because sometimes this client gets "/sockjs-node" as an
    // input url and this fails in extension because it resolves to
    // moz-extension://sockjs-node or chrome-extension://sockjs-node
    // and this is invalid scheme for a websocket
    super('ws://localhost:3001/sockjs-node');
  }

  static getClientPath(options) {
    return require.resolve('./wsclient');
  }
};
