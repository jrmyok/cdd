// index.js
exports.handler = async (event, context) => {
  try {
    const endpoint = `https://${process.env.CRONJOB_BASE_URL}/api/cronjobs/add-new-coins`;

    const response = fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretKey: process.env.SECRET_KEY,
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
