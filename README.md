# Web Page Analyzer Agent

A web application that analyzes web pages to extract links, icons, and locators for UI elements.

## Features

- Web page analysis using headless browser (Puppeteer)
- Extraction of:
  - Links (`<a>` tags)
  - Icons (images, SVGs, icon elements)
  - UI element locators (CSS selectors and XPath)
- Real-time analysis status updates
- Secure API with Bearer token authentication
- Modern and responsive UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd web-analyzer-agent
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory:
```
PORT=3000
API_TOKEN=your_secret_token_here
```

5. Create a `.env` file in the client directory:
```
REACT_APP_API_TOKEN=your_secret_token_here
```

Replace `your_secret_token_here` with a secure token of your choice.

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

## API Endpoints

### POST /api/analyze
Starts the analysis of a web page.

Request:
```json
{
  "url": "https://example.com"
}
```

Response:
```json
{
  "jobId": "uuid",
  "status": "processing"
}
```

### GET /api/status/:jobId
Gets the status and results of an analysis job.

Response:
```json
{
  "status": "completed",
  "result": {
    "url": "https://example.com",
    "links": {
      "count": 10,
      "items": [...]
    },
    "icons": {
      "count": 5,
      "items": [...]
    },
    "locators": {
      "buttons": [...],
      "inputs": [...],
      "navigation": [...]
    }
  }
}
```

## Security

- All API endpoints require Bearer token authentication
- Rate limiting is enabled to prevent abuse
- CORS is configured for the frontend domain
- Helmet.js is used for additional security headers

## Technologies Used

- Backend:
  - Node.js
  - Express.js
  - Puppeteer
  - UUID
  - Helmet.js
  - Express Rate Limit

- Frontend:
  - React.js
  - CSS3
  - Fetch API

## License

MIT 