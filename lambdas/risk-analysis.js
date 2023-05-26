// index.js

exports.handler = async (event, context) => {
  try {
    const endpoint = `https://${process.env.CRONJOB_BASE_URL}/api/cronjobs/risk-analysis`;

    const response = fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "x-secret-key": process.env.CRONJOB_SECRET_KEY,
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Risk analysis response:", response.data);

    return {
      statusCode: 200,
      body: "Risk analysis pinged successfully!",
    };
  } catch (error) {
    console.error("Error pinging risk analysis:", error);

    return {
      statusCode: 500,
      body: "Error performing risk analysis",
    };
  }
};
