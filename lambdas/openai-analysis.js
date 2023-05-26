// index.js

exports.handler = async (event, context) => {
  try {
    const endpoint = `https://${process.env.CRONJOB_BASE_URL}/api/cronjobs/openai-analysis`;

    const response = fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Secret-Key": process.env.CRONJOB_SECRET_KEY,
      },
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
