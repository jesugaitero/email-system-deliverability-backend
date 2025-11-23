
const URI = 'amqp://rabbitmq:pN4gUSWb1@queue'

var amqp = require('amqplib/callback_api')

amqp.connect(URI, function (error0, connection) {
  if (error0) {
    console.log(error0);
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      console.log(error1);
    }

    var queue = 'task_queue';
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.assertQueue(queue, {
      durable: true
    });
    channel.prefetch(1);
    channel.consume(queue, function (msg) {
      var secs = msg.content.toString().split('.').length - 1;

      console.log(" [x] Received %s", msg.content);
      setTimeout(function () {
        console.log(" [x] Done");
        channel.ack(msg);
      }, 500);
    }, {
      // manual acknowledgment mode,
      // see ../confirms.html for details
      noAck: false
    });
  });
});
