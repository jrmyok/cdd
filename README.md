# Crypto Risk Analysis Project Weekend Project

This project uses a combination of APIs, scraping techniques, and AI to generate risk scores for different cryptocurrencies. Its goal is to provide transparency and awareness about potential scams or low-quality coins, colloquially known as "shitcoins".

The project follows a modern and typical Next.js project structure, utilizing popular tools and frameworks such as Tailwind CSS, trpc, and Prisma.

**Next.js**: Next.js is a popular React framework for building server-side rendered (SSR) and static websites. It provides a powerful development environment and helps in creating optimized, production-ready applications.

**Tailwind CSS**: Tailwind CSS is a utility-first CSS framework that allows for rapid UI development. It provides a set of pre-defined utility classes that can be used to style components and build responsive layouts easily.

**trpc**: trpc is a modern, typesafe RPC (Remote Procedure Call) framework for TypeScript. It enables efficient and type-safe communication between the client and server, making it easier to define API endpoints and handle data fetching.

**Prisma**: Prisma is a modern database toolkit that provides an ORM (Object-Relational Mapping) layer and powerful database query capabilities. It simplifies database interactions and allows for seamless integration with different databases.

## High-Level Architecture

![img.png](img.png)



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


## Triggering Cronjob
The cronjob in this project is triggered at specific intervals using CloudWatch Event Rules. The project includes multiple Lambdas that perform different tasks such as adding new coins, analyzing data using OpenAI, performing risk analysis, scraping whitepapers, and updating coin data. Each Lambda is associated with a specific CloudWatch Event Rule that defines the schedule for executing the Lambda function. 
For example, the cronjob for adding new coins runs once a day at 12:00 PM UTC, while the cronjob for updating coin data runs every 30 minutes.

## Filtering

**Reducers**:
Reducers are used to manage the filter state and handle state updates based on different actions. The `filterReducer` function defines various action types (`filterActions`) and updates the state accordingly. Using reducers helps in centralizing the state management and makes it easier to handle complex state updates.

**Debouncer**:
The `useDebounce` hook is used to debounce the filter state. Debouncing is employed to reduce unnecessary API calls while the user is typing or making frequent changes to the filter criteria. By debouncing the filter state, the code ensures that the API request is triggered only after a certain delay (in this case, 500 milliseconds) of user inactivity.

**Filter Logic**:
The filter logic is implemented in the `getFilter` function. This function takes the debounced filter state as input and constructs a filter object that can be used in the API request. It checks the filter criteria such as coin name, ticker, min/max market cap, min/max risk level, and whitepaper/summary availability, and constructs the appropriate filter object based on these criteria.

By using reducers, a debouncer, and implementing the filter logic, the code achieves a dynamic and responsive filtering mechanism. Users can input their desired filter criteria, and the list of coins is updated accordingly, providing a tailored view of the available coins based on the specified filters.

Overall, these choices in the code enable better user experience, improved performance by reducing unnecessary API calls, and provide a flexible way to manage and apply filters to the coin list.


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

