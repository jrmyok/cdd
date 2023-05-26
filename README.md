Crypto Risk Analysis Project
This project uses a combination of APIs, scraping techniques, and AI to generate risk scores for different cryptocurrencies. Its goal is to provide transparency and awareness about potential scams or low-quality coins, colloquially known as "shitcoins".

Services
The project leverages multiple APIs, including:

OpenAI API: Utilized for analyzing textual data and whitepapers associated with the cryptocurrencies.

CoinGecko API: Used to fetch data about different cryptocurrencies.

Puppeteer: A node.js library used for web scraping, here particularly to scrape whitepapers of cryptocurrencies.

The data fetched and analyzed through these services is displayed on a table where we use debouncers for efficient filtering and reducers for managing the application state.

OpenAI Capabilities
OpenAI's powerful natural language processing (NLP) capabilities are leveraged to analyze the whitepapers of different cryptocurrencies. The whitepapers, which often contain detailed information about the coin's purpose, technology, and team, can provide valuable insights into the coin's potential. OpenAI can process this complex, technical language and provide a risk score, allowing even non-experts to make informed decisions about whether to invest.

Setup Instructions
Environment Variables
You need to set up environment variables to run this project. Create a .env file in your root directory with the following variables:

makefile
Copy code
CRONJOB_BASE_URL=<your-base-url>
CRONJOB_SECRET_KEY=<your-secret-key>
Replace <your-base-url> and <your-secret-key> with your actual data.

Running the Project
After setting up the environment variables, you can run the project using Pulumi. Make sure you have Pulumi installed and configured with your AWS account.

Future Plans
Going forward, we plan to enhance the risk analysis feature by incorporating additional data points and refining our AI models. We also aim to include more data sources to provide a more comprehensive overview of each coin. In addition, we're exploring options to send personalized risk reports to users who wish to follow specific cryptocurrencies.