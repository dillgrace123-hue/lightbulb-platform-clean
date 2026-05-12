exports.handler = async function () {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Individual Grants";

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

  const filterFormula = "AND({Programme} = 'Lightbulb Trust', {Funding Type} = 'Grant')";
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);

  url.searchParams.set("filterByFormula", filterFormula);
  url.searchParams.set("pageSize", "100");

  try {
    let total = 0;
    let count = 0;
    let offset;

    do {
      if (offset) {
        url.searchParams.set("offset", offset);
      } else {
        url.searchParams.delete("offset");
      }

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

      for (const record of data.records) {
        const amount = record.fields["Amount (£)"];

        if (typeof amount === "number") {
          total += amount;
          count += 1;
        }
      }

      offset = data.offset;
    } while (offset);

    const averageGrantSize = count > 0 ? total / count : 0;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        averageGrantSize
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Could not load average grant size"
      })
    };
  }
};
