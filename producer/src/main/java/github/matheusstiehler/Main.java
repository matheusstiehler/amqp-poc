package github.matheusstiehler;

import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

import com.rabbitmq.client.Channel;

public class Main {

    public static void main(String[] args) {
        Main main = new Main();
        main.run();
    }

    public void run() {

        Exchange directExchange;
        Exchange fanoutExchange;
        Exchange topicExchange;

        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost("172.19.0.3");
            Connection conn = factory.newConnection();

            Channel directChanel = conn.createChannel();
            Channel fanoutChanel = conn.createChannel();
            Channel topicChanel = conn.createChannel();

            directExchange = new Exchange(directChanel, "direct", "direct");
            fanoutExchange = new Exchange(fanoutChanel, "fanout", "fanout");
            topicExchange = new Exchange(topicChanel, "topic", "topic");

            /*
             * Scanner scanner = new Scanner(System.in);
             * String message = "";
             * String routingKey = "";
             * String exchangeType = "";
             * 
             * while (true) {
             * 
             * System.out.println("Enter an exchange type (direct or fanout): ");
             * exchangeType = scanner.nextLine();
             * if (exchangeType.equals("exit")) {
             * break;
             * }
             * 
             * System.out.println("Enter a message: ");
             * message = scanner.nextLine();
             * 
             * if (exchangeType.equals("direct")) {
             * System.out.println("Enter a routing key: ");
             * routingKey = scanner.nextLine();
             * directExchange.publish(message, routingKey);
             * System.out.println("Message published: " + message + " with routing key: " +
             * routingKey);
             * System.out.println();
             * continue;
             * } else if (exchangeType.equals("fanout")) {
             * fanoutExchange.publish(message, "");
             * System.out.println("Message published: " + message);
             * System.out.println();
             * continue;
             * } else if (exchangeType.equals("topic")) {
             * System.out.println("Enter a routing key: ");
             * routingKey = scanner.nextLine();
             * topicExchange.publish(message, routingKey);
             * System.out.println("Message published: " + message + " with routing key: " +
             * routingKey);
             * System.out.println();
             * continue;
             * } else {
             * System.out.println("Invalid exchange type");
             * continue;
             * }
             * 
             * }
             * 
             * scanner.close();
             */

            while (true) {
                // Send random messages to the exchanges
                // Routing for direct: direct-a, direct-b, direct-c
                // Routing for topic: topic.a, topic.b, topic.c

                float random = (float) Math.random();

                if (random < 0.33) {
                    random = (float) Math.random();

                    if (random < 0.33) {
                        directExchange.publish("direct message", "direct-a");
                    } else if (random < 0.66) {
                        directExchange.publish("direct message", "direct-b");
                    } else {
                        directExchange.publish("direct message", "direct-c");
                    }

                } else if (random < 0.66) {
                    random = (float) Math.random();

                    if (random < 0.33) {
                        topicExchange.publish("topic message", "topic.a");
                    } else if (random < 0.66) {
                        topicExchange.publish("topic message", "topic.b");
                    } else {
                        topicExchange.publish("topic message", "topic.c");
                    }

                } else {
                    fanoutExchange.publish("fanout message", "");
                }

                Thread.sleep(1000);
            }

        } catch (

        Exception e) {
            e.printStackTrace();
        }

    }
}
