# ZenCode AI : NodeJS Backend

This server provides APIs to parse React components, extract their props and dependencies, and perform CRUD operations on the `users` collection in the `usersDB` database.

## Features
- Parse React components to find:
  - Props
  - Dependencies
  - JSX elements
- CRUD operations for the database collection `users`:
  - Create, Read, Update, Delete

---

## Setup Instructions

### 1. Install Dependencies
Ensure that you have [Node.js](https://nodejs.org/) installed on your system.

Run the following command to install all required dependencies:
```bash
npm install
```

# Setup .env File
Create a .env file in the project root directory.

Copy the structure of .env.example:

```
cp .env.example .env
```

Replace the following:-

```
MONGO_URI=<Your MongoDB Connection URI>
DB_NAME=<Your Database Name>
```
Replace <Your MongoDB Connection URI> with your MongoDB connection string.

Replace <Your Database Name> with the name of your database.


#  Run the Server
To start the server using nodemon, execute the following command:

```bash
nodemon server.js
```




