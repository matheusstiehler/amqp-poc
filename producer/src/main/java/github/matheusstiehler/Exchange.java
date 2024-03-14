package github.matheusstiehler;

import com.rabbitmq.client.Channel;

public class Exchange {
    private String exchangeName;
    private String exchangeType;
    private Channel channel;

    public Exchange(Channel channel, String exchangeName, String exchangeType) {
        this.channel = channel;
        this.exchangeName = exchangeName;
        this.exchangeType = exchangeType;

        try {
            this.channel.exchangeDeclare(this.exchangeName, this.exchangeType, true);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public void publish(String message, String routingKey) {
        try {
            channel.basicPublish(this.exchangeName, routingKey, null, message.getBytes());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}