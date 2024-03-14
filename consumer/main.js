import amqlib from "amqplib";
import chalk from 'chalk';
import blessed from 'blessed';
import Table from 'cli-table3'

class Exchange {
  /**
   * Represents an Exchange.
   * @constructor
   * @param {import("@types/amqplib").Channel} channel - The channel object.
   * @param {String} exchangeName - The exchange name.
   * @param {String} exchangeType - The exchange type.
   * @param {String[]} queues - The queues array.
   */
  constructor(channel, exchangeName, exchangeType) {
    this.channel = channel;
    this.exchangeName = exchangeName;
    this.exchangeType = exchangeType;
    this.queues = [];
    this.totalMessages = 0;
    this.startTime = Date.now();
  }

  async createExchange() {
    await this.channel.assertExchange(this.exchangeName, this.exchangeType, { durable: true });

    return this;
  }

  async createQueue(queueName) {
    await this.channel.assertQueue(queueName, { durable: true });
    this.queues.push(queueName);

    return this;
  }

  async subscribeToQueue(queueName, callback) {
    await this.channel.consume(queueName, callback);

    return this;
  }

  async bindQueue(queueName, routingKey) {
    await this.channel.bindQueue(queueName, this.exchangeName, routingKey);

    return this;
  }

  incrementMessage() {
    this.totalMessages++;
  }

  getQueueCount() {
    return this.queues.length;
  }

  getMessageRate() {
    return this.totalMessages / ((Date.now() - this.startTime) / 1000);
  }
}

const screen = blessed.screen();
const exchangeTable = new Table({ head: ['Exchange', 'Type', 'Queues', 'Msgs/sec'] });
const logTable = new Table({ head: ['Exchange', 'Type', 'Queue', 'Message'] });
const tableBox = blessed.box({
  top: '0%',
  left: '50%',
  width: '100%',
  height: '100%',
  label: 'Exchange Summary'
});

const logBox = blessed.box({
  top: '0%',
  left: '0%',
  width: '50%',
  height: '100%',
  label: 'Recent Messages'
});

const maxLogMessages = 10;

screen.append(tableBox);
screen.append(logBox);

const directExchangeCount = ['a', 'b', 'c'];
const fanoutExchangeCount = ['a', 'b', 'c'];
const topicExchangeCount = ['a', 'b', 'c'];

async function connectAndSubscribe() {
  try {
    const connection = await amqlib.connect("amqp://172.19.0.03");

    const directChannel = await connection.createChannel();
    const fanoutChannel = await connection.createChannel();
    const topicChannel = await connection.createChannel();

    const directExchange = new Exchange(directChannel, "direct", "direct");
    const fanoutExchange = new Exchange(fanoutChannel, "fanout", "fanout");
    const topicExchange = new Exchange(topicChannel, "topic", "topic");

    await directExchange.createExchange();
    await fanoutExchange.createExchange();
    await topicExchange.createExchange();

    directExchangeCount.forEach(async (queue) => {
      await directExchange.createQueue(`direct-${queue}`);
      await directExchange.bindQueue(`direct-${queue}`, `direct-${queue}`);
      directExchange.subscribeToQueue(`direct-${queue}`, (msg) => {
        directExchange.incrementMessage();
        /* console.log(chalk.bold.blue(`DIRECT[${queue}] => `), msg.content.toString()); */
        updateDashboard('direct', 'direct', directExchange.getQueueCount(), queue, directExchange.getMessageRate().toFixed(2), msg)
      });
    });

    fanoutExchangeCount.forEach(async (queue) => {
      await fanoutExchange.createQueue(`fanout-${queue}`);
      await fanoutExchange.bindQueue(`fanout-${queue}`, "");
      fanoutExchange.subscribeToQueue(`fanout-${queue}`, (msg) => {
        fanoutExchange.incrementMessage();
        /* console.log(chalk.bold.green(`FANOUT[${queue}] => `), msg.content.toString()); */
        updateDashboard('fanout', 'fanout', fanoutExchange.getQueueCount(), queue, fanoutExchange.getMessageRate().toFixed(2), msg)
      });
    });

    topicExchangeCount.forEach(async (queue) => {
      await topicExchange.createQueue(`topic-${queue}-1`);
      await topicExchange.createQueue(`topic-${queue}-2`);
      await topicExchange.bindQueue(`topic-${queue}-1`, `topic.${queue}`);
      await topicExchange.bindQueue(`topic-${queue}-2`, `topic.${queue}`);

      topicExchange.subscribeToQueue(`topic-${queue}-1`, (msg) => {
        topicExchange.incrementMessage();
        /* console.log(chalk.bold.yellow(`TOPIC[${queue}-1]`),
          chalk.dim(`(${msg.fields.routingKey}) =>`), msg.content.toString()); */
        updateDashboard('topic', 'topic', topicExchange.getQueueCount(), queue, topicExchange.getMessageRate().toFixed(2), msg)
      });
      topicExchange.subscribeToQueue(`topic-${queue}-2`, (msg) => {
        topicExchange.incrementMessage();
        /* console.log(chalk.bold.magenta(`TOPIC[${queue}-2]`),
          chalk.dim(`(${msg.fields.routingKey}) =>`), msg.content.toString()); */
        updateDashboard('topic', 'topic', topicExchange.getQueueCount(), queue, topicExchange.getMessageRate().toFixed(2), msg)
      });
    });

  } catch (err) {
    console.error(err);
  }
}

function updateDashboard(exchangeName, exchangeType, queueCount, queueName, messageRate, msg) {

  // First delete old data for specific exchange

  exchangeTable.forEach((row, index) => {
    if (row[0] === exchangeName) {
      exchangeTable.splice(index, 1);
    }
  });

  exchangeTable.push([exchangeName, exchangeType, queueCount, messageRate]);
  logTable.push([exchangeName, exchangeType, queueName, msg.content.toString()]);



  // Log recent messages
  if (logTable.length > maxLogMessages) {
    logTable.splice(0, 1);
  }

  // Update components
  logBox.setContent(logTable.toString());
  tableBox.setContent(exchangeTable.toString());
  screen.render();
}

connectAndSubscribe();



screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

