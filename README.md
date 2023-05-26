# Crypto Risk Analysis Project

This project uses a combination of APIs, scraping techniques, and AI to generate risk scores for different cryptocurrencies. Its goal is to provide transparency and awareness about potential scams or low-quality coins, colloquially known as "shitcoins".

## Services

The project leverages multiple APIs, including:

1. **OpenAI API**: Utilized for analyzing textual data and whitepapers associated with the cryptocurrencies.
2. **CoinGecko API**: Used to fetch data about different cryptocurrencies.
3. **Puppeteer**: A node.js library used for web scraping, here particularly to scrape whitepapers of cryptocurrencies.

The data fetched and analyzed through these services is displayed on a table where we use debouncers for efficient filtering and reducers for managing the application state.

## OpenAI Capabilities

OpenAI's powerful natural language processing (NLP) capabilities are leveraged to analyze the whitepapers of different cryptocurrencies. 
The whitepapers, which often contain detailed information about the coin's purpose, technology, and team, can provide valuable insights into the coin's potential. 
GPT makes parsing and extracting these keys metrics from the whitepapers easy and efficient, which we can then
run more robust statistical analysis on.

## Setup Instructions


### Environment Variables

Locally, you will need to create a `.env` file in the root directory of the project. This file should contain the following environment variables:

```bash
DATABASE=postgresql://test:test@localhost:5432/test?schema=test
OPENAI_API_KEY=<your-secret-key>
COINGECKO_BASE_URL=<your-secret-key>
CRONJOB_BASE_URL=localhost:3000
CRONJOB_SECRET_KEY=<your-secret-key>
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=<your-secret-key>
```

### Local Development

Spin up the local development environment with docker-compose. This will start the postgresql database.
```bash
docker-compose up --build
```

Dev environment can be started with the following commands:
```bash
npm i
prisma db push
npm run dev
```



### Deployment

#### Pulumi Deployment

Deploys lambda functions to your aws account. Make sure you have Pulumi installed and configured with your AWS account.
```bash
pulumi up
```

### Railway Deployment
Set up a railway account and link it to your github account. Then, create a new project and link it to your github repository. 

1. Create a new project and link it to your github repository.
2. Create a new postgresql database and link it to your project.
#### CRONJOB Deployment Env Variables && Pulumi Deployment Variables

```bash
CRONJOB_BASE_URL=<your-base-url>
CRONJOB_SECRET_KEY=<your-secret-key>
OPENAI_API_KEY=<your-secret-key>
COINGECKO_BASE_URL=<your-secret-key>
COINGECKO_API_KEY=<your-secret-key>
```


### Vercel Deployment

#### Vercel Deployment Variables
```bash
DATABASE=<your-base-url>
```

## Future Plans

- Langchain is definitely needed to improve the number of whitepapers puppeteer is able to scrape, since right now only a few whitepapers are being parsed from coingecko. 
- Currently, a very simple risk score is being generated, but we can improve this by using more advanced statistical analysis and machine learning techniques.
- UI improvements, add more filters and order by options (backend done for this)

