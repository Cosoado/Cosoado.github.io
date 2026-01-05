import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const dynamo = new DynamoDBClient({});
const ses = new SESClient({});

const TABLE_NAME = process.env.TABLE_NAME || '';
const SOURCE_EMAIL = process.env.SOURCE_EMAIL || '';
const DESTINATION_EMAIL = process.env.DESTINATION_EMAIL || '';

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const ip = event.requestContext.identity.sourceIp || 'unknown';
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const userAgent = event.requestContext.identity.userAgent || 'unknown';

        // [A] Honeypot Check
        if (body.company) {
            console.log(`Honeypot triggered by IP: ${ip}`);
            // Return success to fool the bot
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: true }),
            };
        }

        // [B] Input Validation
        const { name, email, subject, message } = body;

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!email || !emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Invalid email format' }),
            };
        }

        // Message validation
        if (!message || message.length < 10 || message.length > 1000) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Message length error' }),
            };
        }

        // URL count validation
        const urlCount = (message.match(/https?:\/\//g) || []).length;
        if (urlCount >= 3) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Too many URLs' }),
            };
        }

        // [C] Rate Limiting (DynamoDB)
        const recordId = `${ip}_${today}`;
        // TTL is 24 hours from now (seconds)
        const ttl = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

        try {
            // Atomic counter increment
            const updateResult = await dynamo.send(new UpdateItemCommand({
                TableName: TABLE_NAME,
                Key: { 'pk': { S: recordId } },
                UpdateExpression: 'SET #count = if_not_exists(#count, :start) + :inc, #ttl = :ttl',
                ExpressionAttributeNames: { '#count': 'count', '#ttl': 'ttl' },
                ExpressionAttributeValues: {
                    ':start': { N: '0' },
                    ':inc': { N: '1' },
                    ':ttl': { N: ttl.toString() }
                },
                ReturnValues: 'UPDATED_NEW'
            }));

            const count = parseInt(updateResult.Attributes?.count?.N || '0');
            if (count > 3) {
                console.log(`Rate limit exceeded for IP: ${ip}`);
                return {
                    statusCode: 429,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify({ success: false, message: 'Rate limit exceeded' }),
                };
            }

        } catch (error) {
            console.error('DynamoDB Error:', error);
            // Fail open or closed? Fail closed for safety, but maybe open for UX?
            // Let's return error.
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Internal Server Error' }),
            };
        }

        // [D] Send Email (SES)
        const emailParams = {
            Source: SOURCE_EMAIL,
            Destination: { ToAddresses: [DESTINATION_EMAIL] },
            Message: {
                Subject: { Data: `[Contact Form] ${subject || 'No Subject'}` },
                Body: {
                    Text: { Data: `Name: ${name}\nEmail: ${email}\nIP: ${ip}\nUser-Agent: ${userAgent}\n\nMessage:\n${message}` }
                }
            }
        };

        await ses.send(new SendEmailCommand(emailParams));

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true }),
        };

    } catch (error) {
        console.error('Handler Error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, message: 'Internal Server Error' }),
        };
    }
};
