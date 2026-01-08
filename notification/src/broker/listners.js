const { subscribeToQueue } = require("./broker");
const {sendEmail} = require("../email");

module.exports = function (){
    subscribeToQueue('AUTH_NOTIFICATION.USER_CREATED', async (data) => {
        console.log('Received data in notification service:', data);
        // Here, you can add logic to send email or SMS based on the data received

        const emailTemplate = `
            <h1>Welcome to Our Service</h1>
            <p>Dear ${(data.fullname.firstname || "") + " " + (data.fullname.lastname || "")},</p>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, 'Welcome to Our Service', 'Thank you for registering with us.', emailTemplate);
    });

    subscribeToQueue('PAYMENT_NOTIFICATION.PAYMENT.INITIATED', async (data) => {
        console.log('Received payment initiated data in notification service:', data);
        const emailTemplate = `
            <h1>Payment Initiated</h1>
            <p>Dear ${data.username ? (data.username || "") : "Customer"},</p>
            <p>Your payment for order ID: ${data.orderId} has been initiated.</p>
            <p>Amount: ${data.amount} ${data.currency}</p>
            <p>We will notify you once the payment is completed.</p>
            <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, 'Payment Initiated', `Your payment for order ID: ${data.orderId} has been initiated.`, emailTemplate);
    });

    subscribeToQueue('PAYMENT_NOTIFICATION.PAYMENT.COMPLETED', async (data) => {
        console.log('Received payment completed data in notification service:', data);
        const emailTemplate = `
            <h1>Payment Successful</h1>
            <p>Dear ${data.fullname ? (data.fullname.firstname || "") + " " + (data.fullname.lastname || "") : "Customer"},</p>
            <p>Your payment for order ID: ${data.orderId} has been successfully processed.</p>
            <p>Amount: ${data.amount} ${data.currency}</p>
            <p>Payment ID: ${data.paymentId}</p>
            <p>Thank you for your purchase!</p>
            <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, 'Payment Successful', `Your payment for order ID: ${data.orderId} was successful.`, emailTemplate);
    })

    subscribeToQueue('PAYMENT_NOTIFICATION.PAYMENT.FAILED', async (data) => {
        console.log('Received payment failed data in notification service:', data);
        const emailTemplate = `
            <h1>Payment Failed</h1>
            <p>Dear ${data.fullname ? (data.fullname.firstname || "") + " " + (data.fullname.lastname || "") : "Customer"},</p>
            <p>We regret to inform you that your payment for order ID: ${data.orderId} and payment ID: ${data.paymentId} has failed.</p>
            <p>Please try again or contact support for assistance.</p>
            <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, 'Payment Failed', `Your payment for order ID: ${data.orderId} has failed.`, emailTemplate);
    })

    subscribeToQueue('PRODUCT_NOTIFICATION.PRODUCT.CREATED', async (data) => {
        console.log('Received product created data in notification service:', data);
        const emailTemplate = `
            <h1>New Product Created</h1>
            <p>Dear ${data.fullname ? (data.fullname.firstname || "") + " " + (data.fullname.lastname || "") : "Seller"},</p>
            <p>Your product with ID: ${data.title} has been successfully created.</p>
            <p>Thank you for listing your product with us!</p>
            <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, 'Product Created Successfully', `Your product with ID: ${data.id} has been created.`, emailTemplate);
    });
}