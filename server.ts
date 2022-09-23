import { Server as WSServer } from 'ws';
import http from 'http';
import express, { RequestHandler, json } from 'express';

const getData = async (id: string) => JSON.stringify({
  jsonrpc: '2.0',
  result: 'xxxxx',
  id,
});

const app = express();

const requestHandler: RequestHandler = async (req, res, next) => {
  const { id, method, params } = req.body;
  console.log('http request received:', { id, method, params });

  const data = await getData(id);
  res.end(data);
};

app.use(json());
app.use(requestHandler);

const server = http.createServer();
server.on('request', app);

const wss = new WSServer({
  server: server,
  perMessageDeflate: false,
});

wss.on('connection', ws => {
  console.log('ws connected!');

  ws.on('message', async rawData => {
    const data = JSON.parse(rawData.toString());
    console.log('ws server received: %s', data);

    const responseData = await getData(data.id);
    ws.send(responseData);

    setInterval(() => ws.send('tick'), 1000);
  });
});

server.listen(8545, () => {
  console.log(`server started on 8545!`);
});

