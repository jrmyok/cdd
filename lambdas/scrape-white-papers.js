// index.js

exports.handler = async (event, context) => {
  try {
    const endpoint = `${process.env.CRONJOB_BASE_URL}/api/cronjobs/scrape-white-papers`;

    const response = fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey: process.env.CRONJOB_SECRET_KEY,
      }),
    });

    console.log("Scrape whitepapers task response:", response.data);

    return {
      statusCode: 200,
      body: "Scrape whitepapers task completed successfully!",
    };
  } catch (error) {
    console.error("Error pinging scrape whitepapers task:", error);

    return {
      statusCode: 500,
      body: "Error pinging scrape whitepapers task",
    };
  }
};
