import type http from 'http';
import type https from 'https';
import WebSocket from 'ws';

/**
 * Likkit server
 */
export default class LikkitServer {
  /**
   * Constructs a WebSocket server that will respond to the given path on webServer.
   */
  constructor(webServer: http.Server | https.Server, path: string) {
    const server = new WebSocket.Server({ server: webServer, path: path + '/likkit' });

    server.on('connection', (connection, _request) => {
      connection.on('message', (message) => {
        // Send the message to all current client connections
        server.clients.forEach((connection) => connection.send(message.toString()));
      });
    });
  }
}
