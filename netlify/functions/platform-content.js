exports.handler = async function (event) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Platform Content";

  if (!token || !baseId) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Missing Airtable environment variables"
      })
    };
  }

  const page = event.queryStringParameters?.page || "Lightbulb";
  const section = event.queryStringParameters?.section || "Dashboard";

  const filterFormula = `AND({Page} = '${page}', {Section} = '${section}')`;
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);

  url.searchParams.set("filterByFormula", filterFormula);
  url.searchParams.set("pageSize", "100");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();

      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Airtable request failed",
          details: message
        })
      };
    }

    const data = await response.json();

    const content = {};

    for (const record of data.records) {
      const key = record.fields.Key;
      const value = record.fields.Value;

      if (key) {
        content[key] = value || "";
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        page,
        section,
        content
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Could not load platform content"
      })
    };
  }
};
