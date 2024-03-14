# Project Structure

## Java Producer

- Create a simple command-line interface (CLI) using a library like JCommander or Apache Commons CLI.
- This CLI application will allow you to:
- Select the exchange type (direct, fanout, topic, headers).
- Input message content.
- Specify the routing key (if applicable to the exchange type).

## Node.js Consumer

- A straightforward program focusing on receiving and displaying messages.

# Focus Areas

## Exchange Types:

- ### Direct: Connect a queue to the exchange with a routing key. The producer sends a message with the routing key, and RabbitMQ delivers it to the queue bound with the same key.
- ### Fanout: Broadcast messages to all bound queues.
- ### Topic: Messages are routed based on a routing key pattern (e.g., "product.update" or "user.created"). Queues bind with matching patterns.
- ### Headers: Messages are routed based on a set of headers (key-value pairs) rather than a routing key.
- ### Message Delivery Acknowledgements: Explore how to configure the consumer to send acknowledgements back to the broker, guaranteeing message processing.

### Durable Queues and Exchanges: Ensure that your queues and exchanges persist even if the RabbitMQ server restarts.

### Dead Letter Exchanges (DLX): Set up a DLX where messages that can't be delivered (e.g., due to no matching routing key) are sent for analysis or reprocessing.

## Visualization

### RabbitMQ Management UI: RabbitMQ has a built-in web interface. Access it through your browser (usually like http://localhost:15672) to visualize exchanges, queues, bindings, and monitor message flow.
