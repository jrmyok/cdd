// index.js

exports.handler = async (event, context) => {
  try {
    const endpoint = `http://${process.env.CRONJOB_BASE_URL}/api/cronjobs/openai-analysis`;

    // Make a GET request with the secret key as a header
    const response = fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey: process.env.CRONJOB_SECRET_KEY,
      }),
    });

    console.log("OpenAI analysis response:", response.data);

    return {
      statusCode: 200,
      body: "OpenAI analysis pinged successfully!",
    };
  } catch (error) {
    console.error("Error pinging OpenAI analysis:", error);

    return {
      statusCode: 500,
      body: "Error pinging OpenAI analysis",
    };
  }
};
