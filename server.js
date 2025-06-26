const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for jobs
const jobs = new Map();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  // In a real application, you would verify the token here
  // For this example, we'll just check if it's not empty
  if (token !== process.env.API_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  next();
};

// Helper function to get CSS selector for an element
const getCssSelector = (element) => {
  if (element.id) {
    return `#${element.id}`;
  }
  if (element.className) {
    return `.${element.className.split(' ').join('.')}`;
  }
  return element.tagName.toLowerCase();
};

// Helper function to get XPath for an element
const getXPath = (element) => {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  return element.tagName.toLowerCase();
};

// Kickoff URL endpoint (no authentication)
app.post('/kickoff', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const jobId = uuidv4();
  jobs.set(jobId, { status: 'processing', result: null });

  // Start the analysis in the background
  analyzeWebPage(url, jobId);

  res.json({ 
    jobId,
    status: 'processing',
    statusUrl: `/status/${jobId}` // Return the status URL format
  });
});

// Status URL endpoint (no authentication)
app.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

// QA Pilot execution endpoint (no authentication)
app.post('/qapilot/execute', async (req, res) => {
  const {
    sessionid,
    stepimagebase64,
    pagesource,
    recordedimage,
    elementimage,
    waittimems
  } = req.body;

  // Validate required fields
  if (!sessionid || !stepimagebase64 || !pagesource || !recordedimage || !elementimage || typeof waittimems !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simulate wait time
  await new Promise(resolve => setTimeout(resolve, waittimems));

  // Here you can add logic to process/store/analyze the data as needed

  res.json({
    status: 'success',
    message: 'QA Pilot execution processed',
    sessionid
  });
});

// Web page analysis function
async function analyzeWebPage(url, jobId) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Extract links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.textContent.trim()
      }));
    });

    // Extract icons
    const icons = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        type: 'image',
        src: img.src,
        alt: img.alt
      }));

      const svgs = Array.from(document.querySelectorAll('svg')).map(svg => ({
        type: 'svg',
        content: svg.outerHTML
      }));

      const iconElements = Array.from(document.querySelectorAll('i[class*="icon"]')).map(icon => ({
        type: 'icon',
        class: icon.className
      }));

      return [...images, ...svgs, ...iconElements];
    });

    // Extract locators for key elements
    const locators = await page.evaluate(() => {
      const elements = {
        buttons: Array.from(document.querySelectorAll('button, [role="button"]')),
        inputs: Array.from(document.querySelectorAll('input, textarea, select')),
        navigation: Array.from(document.querySelectorAll('nav, [role="navigation"]'))
      };

      return {
        buttons: elements.buttons.map(el => ({
          text: el.textContent.trim(),
          css: el.id ? `#${el.id}` : `.${el.className.split(' ').join('.')}`,
          xpath: el.id ? `//*[@id="${el.id}"]` : `//${el.tagName.toLowerCase()}`
        })),
        inputs: elements.inputs.map(el => ({
          type: el.type || el.tagName.toLowerCase(),
          css: el.id ? `#${el.id}` : `.${el.className.split(' ').join('.')}`,
          xpath: el.id ? `//*[@id="${el.id}"]` : `//${el.tagName.toLowerCase()}`
        })),
        navigation: elements.navigation.map(el => ({
          css: el.id ? `#${el.id}` : `.${el.className.split(' ').join('.')}`,
          xpath: el.id ? `//*[@id="${el.id}"]` : `//${el.tagName.toLowerCase()}`
        }))
      };
    });

    // Update job with results
    jobs.set(jobId, {
      status: 'completed',
      result: {
        url,
        links: {
          count: links.length,
          items: links
        },
        icons: {
          count: icons.length,
          items: icons
        },
        locators
      }
    });

  } catch (error) {
    console.error('Error analyzing web page:', error);
    jobs.set(jobId, {
      status: 'failed',
      error: error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 