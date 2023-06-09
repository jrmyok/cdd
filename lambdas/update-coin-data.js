// index.js

exports.handler = async (event, context) => {
  try {
    const endpoint = `https://${process.env.CRONJOB_BASE_URL}/api/cronjobs/update-coin-data`;

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

    console.log("Request to ping coins update sent asynchronously");

    return {
      statusCode: 200,
      body: "Request to update coins update sent asynchronously",
    };
  } catch (error) {
    console.error("Error performing coins update data:", error);

    return {
      statusCode: 500,
      body: "Error performing update coin data",
    };
  }
};
