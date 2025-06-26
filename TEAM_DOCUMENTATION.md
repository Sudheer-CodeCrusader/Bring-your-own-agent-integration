# Web Page Analyzer Agent - Team Documentation

## Project Overview

The **Web Page Analyzer Agent** is a full-stack web application that performs automated analysis of web pages to extract structured data including links, icons, and UI element locators. This tool is designed for web developers, QA engineers, and automation specialists who need to programmatically analyze web page structures.

## Architecture

### Technology Stack

**Backend:**
- **Node.js** (v14+) - Runtime environment
- **Express.js** (v4.18.2) - Web framework
- **Puppeteer** (v21.0.0) - Headless browser automation
- **UUID** (v9.0.0) - Unique identifier generation
- **Helmet.js** (v7.0.0) - Security middleware
- **Express Rate Limit** (v6.7.0) - Rate limiting
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Dotenv** (v16.0.3) - Environment variable management

**Frontend:**
- **React.js** (v19.1.0) - UI framework
- **React DOM** (v19.1.0) - DOM rendering
- **CSS3** - Styling
- **Fetch API** - HTTP requests

## Core Functionalities

### 1. Web Page Analysis Engine

The application uses Puppeteer to launch a headless Chrome browser and perform comprehensive analysis of web pages:

- **Page Loading**: Waits for network idle state to ensure complete page load
- **DOM Analysis**: Extracts structured data from the rendered page
- **Error Handling**: Graceful handling of network errors and timeouts
- **Resource Management**: Automatic browser cleanup after analysis

### 2. Data Extraction Capabilities

#### Links Extraction
- Extracts all `<a>` tags from the page
- Captures both `href` attributes and text content
- Provides count and detailed list of all links
- Handles relative and absolute URLs

#### Icons Extraction
- **Images**: Extracts all `<img>` tags with `src` and `alt` attributes
- **SVGs**: Captures inline SVG elements with their HTML content
- **Icon Elements**: Identifies elements with icon-related CSS classes
- Provides visual previews in the UI

#### UI Element Locators
- **Buttons**: Extracts all button elements and button-like elements (`[role="button"]`)
- **Input Fields**: Captures all input, textarea, and select elements
- **Navigation**: Identifies navigation elements and navigation containers
- **CSS Selectors**: Generates CSS selectors for each element
- **XPath Expressions**: Provides XPath locators for automation tools

### 3. Real-time Processing

- **Asynchronous Processing**: Analysis runs in background threads
- **Job Management**: Unique job IDs for tracking analysis progress
- **Status Polling**: Real-time status updates via polling mechanism
- **Progress Tracking**: Three states: `processing`, `completed`, `failed`

### 4. Security Features

- **Bearer Token Authentication**: All API endpoints require valid authentication
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS Protection**: Configured for frontend domain
- **Security Headers**: Helmet.js provides additional security headers
- **Input Validation**: URL validation and sanitization

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
All API endpoints require Bearer token authentication:
```
Authorization: Bearer <your_api_token>
```

### API Endpoints

#### 1. POST /kickoff
**Purpose**: Initiates web page analysis

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response (Success - 200):**
```json
{
  "jobId": "c9c34d7e-fff0-4a0b-8585-653c7bdb8882",
  "status": "processing",
  "statusUrl": "/status/c9c34d7e-fff0-4a0b-8585-653c7bdb8882"
}
```

**Response (Error - 400):**
```json
{
  "error": "URL is required"
}
```

**Response (Error - 401):**
```json
{
  "error": "Authentication token required"
}
```

**Response (Error - 403):**
```json
{
  "error": "Invalid token"
}
```

#### 2. GET /status/:jobId
**Purpose**: Retrieves analysis status and results

**Path Parameters:**
- `jobId` (string): Unique identifier returned from kickoff endpoint

**Response (Processing - 200):**
```json
{
  "status": "processing",
  "result": null
}
```

**Response (Completed - 200):**
```json
{
  "status": "completed",
  "result": {
    "url": "https://example.com",
    "links": {
      "count": 93,
      "items": [
        {
          "href": "https://example.com/page1",
          "text": "Page 1"
        }
      ]
    },
    "icons": {
      "count": 15,
      "items": [
        {
          "type": "image",
          "src": "https://example.com/icon.png",
          "alt": "Icon description"
        },
        {
          "type": "svg",
          "content": "<svg>...</svg>"
        },
        {
          "type": "icon",
          "class": "fa fa-home"
        }
      ]
    },
    "locators": {
      "buttons": [
        {
          "text": "Submit",
          "css": "#submit-btn",
          "xpath": "//*[@id=\"submit-btn\"]"
        }
      ],
      "inputs": [
        {
          "type": "text",
          "css": "#search-input",
          "xpath": "//*[@id=\"search-input\"]"
        }
      ],
      "navigation": [
        {
          "css": ".main-nav",
          "xpath": "//nav[@class=\"main-nav\"]"
        }
      ]
    }
  }
}
```

**Response (Failed - 200):**
```json
{
  "status": "failed",
  "error": "Failed to load page: timeout"
}
```

**Response (Not Found - 404):**
```json
{
  "error": "Job not found"
}
```

## Frontend Features

### User Interface Components

1. **URL Input Form**
   - URL validation
   - Submit button with loading states
   - Error message display

2. **Results Display**
   - **Links Section**: Clickable list with external link handling
   - **Icons Section**: Visual previews for images, SVG rendering, and icon class display
   - **Locators Section**: Organized grid showing buttons, inputs, and navigation elements

3. **Real-time Updates**
   - Automatic polling for status updates
   - Loading indicators
   - Error handling and display

### UI/UX Features

- **Responsive Design**: Works on desktop and mobile devices
- **Modern Styling**: Clean, professional appearance
- **Loading States**: Visual feedback during analysis
- **Error Handling**: User-friendly error messages
- **External Links**: Safe opening of analyzed links

## Configuration

### Environment Variables

**Backend (.env):**
```
PORT=3000
API_TOKEN=your_secret_token_here
```

**Frontend (.env):**
```
REACT_APP_API_TOKEN=your_secret_token_here
```

### Security Configuration

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for localhost development
- **Helmet**: Security headers enabled
- **Token Validation**: Bearer token required for all endpoints

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd web-analyzer-agent
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   - Create `.env` file in root directory
   - Create `.env` file in client directory
   - Set API_TOKEN values

5. **Start Development Servers**
   ```bash
   # Backend
   npm run dev
   
   # Frontend (new terminal)
   cd client
   npm start
   ```

### Available Scripts

**Backend:**
- `npm start`: Production server
- `npm run dev`: Development server with nodemon

**Frontend:**
- `npm start`: Development server
- `npm run build`: Production build
- `npm test`: Run tests

## Use Cases

### 1. Web Scraping and Analysis
- Extract all links from a website for SEO analysis
- Identify all icons and images for asset inventory
- Generate locators for automated testing

### 2. QA Automation
- Generate CSS selectors and XPath expressions for test automation
- Identify all interactive elements on a page
- Create comprehensive element inventories

### 3. Web Development
- Analyze competitor websites for design patterns
- Extract navigation structures
- Identify UI component patterns

### 4. Content Analysis
- Extract all external links for link building
- Analyze icon usage patterns
- Generate site maps from navigation elements

## Performance Considerations

### Scalability
- **In-memory Storage**: Jobs stored in Map for development
- **Background Processing**: Analysis runs asynchronously
- **Resource Management**: Automatic browser cleanup

### Limitations
- **Single-threaded**: One analysis per server instance
- **Memory Usage**: Puppeteer requires significant memory
- **Timeout Handling**: Network timeouts may affect analysis

## Future Enhancements

### Planned Features
1. **Database Integration**: Persistent job storage
2. **Queue System**: Multiple concurrent analyses
3. **Advanced Selectors**: More sophisticated CSS/XPath generation
4. **Screenshot Capture**: Visual page analysis
5. **Performance Metrics**: Page load time analysis
6. **Export Functionality**: CSV/JSON export of results

### Technical Improvements
1. **Microservices Architecture**: Separate analysis service
2. **Redis Integration**: Job queue management
3. **Docker Containerization**: Easy deployment
4. **API Versioning**: Backward compatibility
5. **Comprehensive Testing**: Unit and integration tests

## Troubleshooting

### Common Issues

1. **Puppeteer Launch Failures**
   - Ensure sufficient system memory
   - Check for conflicting Chrome processes
   - Verify sandbox permissions

2. **Authentication Errors**
   - Verify API_TOKEN environment variables
   - Check token format in requests
   - Ensure consistent tokens across frontend/backend

3. **CORS Issues**
   - Verify frontend URL in CORS configuration
   - Check for mixed HTTP/HTTPS requests
   - Ensure proper headers in requests

4. **Rate Limiting**
   - Monitor request frequency
   - Implement exponential backoff
   - Consider increasing limits for development

## Support and Maintenance

### Monitoring
- Server logs for error tracking
- Job status monitoring
- Performance metrics collection

### Maintenance Tasks
- Regular dependency updates
- Security patch application
- Performance optimization
- Database cleanup (when implemented)

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Maintained By**: Development Team 