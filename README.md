# nodemailer-template-aws-ses
 This is an example on how to send template emails with nodemailer, serverless,  AWS SES, Lambda and API Gateway.


## Getting started

 1. If you haven't installed serverless, start with that. 
 `npm i serverless -g`
 You can read more about it on their [github](https://github.com/serverless/serverless), or at their website, [https://www.serverless.com](https://www.serverless.com/).
 2. Install npm dependencies as you normally would do. `npm i`.
 3. Create a .env file that contains host for the email server, username, password.
 4. Make sure you have a CLI-user that's allowed to deploy Lambda and API Gateway functions.
 5. Deploy the entire stack with `serverless deploy`.
