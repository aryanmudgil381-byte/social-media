// 1. Import the 'express' module. Express is a minimal and flexible Node.js web application framework.
const express = require('express');

// 2. Import the built-in 'path' module. This module provides utilities for working with file and directory paths.
const path = require('path');

// 3. Initialize the Express application by calling express(). The 'app' object will be used to configure settings and routes.
const app = express();

// 4. Define the port number (3000) that our web server will listen to for incoming HTTP requests.
const PORT = 3000;

// 5. Configure middleware to serve static assets (like CSS styles, browser JS files, and images).
// - app.use() registers a middleware function in the Express request pipeline.
// - express.static() instructs Express to make all files inside a specific directory publicly accessible.
// - path.join(__dirname, 'public') dynamically resolves the absolute path to the 'public' directory on any OS.
app.use(express.static(path.join(__dirname, 'public')));

// 6. Define the route for the home/index page ('/').
// - app.get() specifies that the server should handle HTTP GET requests at this path.
// - (req, res) is the callback handler function where:
//   - 'req' represents the incoming HTTP request.
//   - 'res' represents the outgoing HTTP response.
// - res.sendFile() reads the file from disk and sends its contents to the user's browser.
// - path.join(__dirname, 'views', 'index.html') resolves to the absolute path of 'views/index.html'.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 7. Define the route for the user login page ('/login').
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// 8. Define the route for the user registration page ('/register').
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// 9. Define the route for the social feed dashboard page ('/feed').
app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'feed.html'));
});

// 9.5. Define the route for the create post page ('/create-post').
app.get('/create-post', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'create-post.html'));
});

// 9.6. Define the route for the notifications page ('/notifications').
app.get('/notifications', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'notifications.html'));
});

// 10. Define the route for the user profile page ('/profile').
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

// 11. Start the HTTP server.
// - app.listen() starts listening for network connections on the specified port.
// - The arrow function is a callback that executes once the server starts successfully, logging a message to the console.
app.listen(PORT, () => {
  console.log(`Server is running and listening at http://localhost:${PORT}`);
});
