# Express Server

This repository has 2 branches corresponding to configurations (schema and queries) on how the server connects to a MongoDB database.

- **main** - Mongoose
- **prisma** - Prisma Client
- **prisma-supabase** - Prisma Client with Supabase DB

The Express-Server provides many API tools that enable you to start user management, access, and authentication.

## Features

### Auth
- User registration
- User authentication (jsonwebtoken with Refresh Token rotation)
- Password reset via email link
- Verify email via email link

### User
- Get authenticated user information
- User management (admin)
  - Create user
  - Get users with filter and pagination
  - Update user

## **Getting started guide**

Run development script

``` bash
run npm dev

 ```

API URL is accessible through port 3000 at **localhost:3000/v1/** by default

The API returns request responses in JSON format. When an API request returns an error, it is sent in the JSON response as an error key.

### Authentication Token

Authenticated user should include Refresh Token thru HTTP authorization header as Bearer token. This may be taken after registration of a new user account or logging in as an admin account -

``` json
{ 
"email": "admin@mail.com",
"password": "admin123"
}

 ```

### Authentication error response

If a token is missing, malformed, or invalid, you will receive an HTTP 401 Unauthorized response code.

## Rate and usage limits

The limit is 300 requests per minute. If you exceed either limit, your request will return an HTTP 429 Too Many Requests status code.

## Postman API Documentation

For full documentation, please visit API documentation at link: https://documenter.getpostman.com/view/17327200/2sAXxS8rdZ
