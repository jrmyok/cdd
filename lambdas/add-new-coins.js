// index.js
exports.handler = async (event, context) => {
  try {
    const endpoint = `http://${process.env.CRONJOB_BASE_URL}/api/cronjobs/add-new-coins`;

    // Make a POST request with the secret key in the request body
    const response = fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey: process.env.CRONJOB_SECRET_KEY,
      }),
    });

    console.log("Add new coins response:", response.data);

    return {
      statusCode: 200,
      body: "Add new coins completed successfully!",
    };
  } catch (error) {
    console.error("Error adding new coins:", error);

    return {
      statusCode: 500,
      body: "Error adding new coins",
    };
  }
};
