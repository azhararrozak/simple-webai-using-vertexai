# Simple Web AI using VertexAI

This project demonstrates how to build a web application that integrates with Google's VertexAI for AI capabilities.

## Overview

This application is built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and leverages Google VertexAI for natural language processing and other AI functionalities.

## Features

- User authentication and authorization
- Integration with Google VertexAI API
- Real-time AI responses
- Responsive web design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud account with VertexAI API access
- API keys and credentials for VertexAI

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/simple-webai-using-vertexai.git
    cd simple-webai-using-vertexai
    ```

2. Install dependencies:
    ```bash
    # Install server dependencies
    npm install
    
    # Install client dependencies
    cd client
    npm install
    ```

3. Configure environment variables:
    - Create a `.env` file in the root directory
    - Add your MongoDB URI and Google Cloud credentials

## Usage

1. Start the development server:
    ```bash
    # Run server and client concurrently
    npm run dev
    
    # Or run server and client separately
    npm run server
    npm run client
    ```

2. Access the application at `http://localhost:3000`

## Project Structure

```
simple-webai-using-vertexai/
├── client/               # React frontend
├── controllers/          # Express route controllers
├── models/               # Mongoose models
├── routes/               # Express routes
├── services/             # VertexAI integration
├── config/               # Configuration files
├── .env                  # Environment variables
├── server.js             # Express server
└── README.md             # Project documentation
```

## API Reference

The API includes endpoints for:
- User authentication
- AI requests and responses
- User data management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.