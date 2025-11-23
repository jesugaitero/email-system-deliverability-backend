
const URI = 'amqp://rabbitmq:pN4gUSWb1@queue'
var amqp = require('amqplib/callback_api');
const data = { guevo: "pito", cuca: "vaginadsekj" }

amqp.connect(URI, function (error0, connection) {
    if (error0) {
        console.log(error0);
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            console.log(error1);
        }
        var queue = 'task_queue';
        var msg = JSON.stringify(data);

        channel.assertQueue(queue, {
            durable: true
        });

        channel.sendToQueue(queue, Buffer.from(msg), {
            persistent: true
        });
        console.log(" [x] Sent '%s'", msg);

    });
    setTimeout(function () {
        //connection.close();
        //process.exit(0)
    }, 500);
});
