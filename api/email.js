'use strict';
const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
require('dotenv').config();

// Functtion to export for Lambda.
module.exports.send = async (event, context, callback) => {
    const requestBody = JSON.parse(event.body);
    const email = requestBody.email;
    const name = requestBody.name;
    const company = requestBody.company;
    const message = requestBody.msg;

    // Stupid basic check to see if we have what we need.
    if(typeof name !== 'string' || typeof email !== 'string' || typeof company !== 'string' || typeof message !== 'string' ){
        console.log(`Validation error`);
        const response = {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Credentials': true,
            }
        }
        callback(new Error(`Couldn't send email, validation error`), response);
        return;
    }

    // Function that gets called when accessing endpoint.
    const sendEmail = (email, name, company, message) => {
        const done = (err, res) => callback(null, {
            statusCode: err ? '400' : '200',
            body: err ? err.message : JSON.stringify({message: `Successfully sent email`}),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Credentials': true,
            },
        });

        // Transporter, AWS SES.
        let smtpTransport = nodemailer.createTransport({
            host: process.env.HOST,
            secure: true,
            port: 465,
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD
            }
        });

        // Reading the template file.
        let htmlFile = function(path, callback){
            fs.readFile(path, {encoding: 'utf-8'}, function(err, html){
                if(err){
                    callback(err);
                    throw new Error(err);
                }else{
                    callback(null, html);
                };
            });
        };

        // Modify the template file.
        htmlFile(__dirname + '/views/template.html', function(err, html){
            let template = handlebars.compile(html);
            let replacements = {
                name: name,
                email: email,
                company: company,
                message: message
            };
            let htmlSend = template(replacements);
            let mailOptions = {
                from: process.env.FROM,
                to: process.env.TO,
                subject: `Portfolio - ${name} - ${company}`,
                html: htmlSend
            };

            // Sending the actual email.
            smtpTransport.sendMail(mailOptions);
        });

        // Returning answer.
        return done();
    }
    sendEmail(email, name, company, message).then(res => {
        callback(null, {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                message: `Successfully sent email`
            }),  
        });
    }).catch(err => {
        console.log(err);
        callback(null, {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Credentials': true,
            },                
            body: JSON.stringify({
                message: `Unable to send email`
            }),
        });
    });
}