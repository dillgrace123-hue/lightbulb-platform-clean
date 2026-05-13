exports.handler = async function () {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Individual Grants";

  if (!token || !baseId) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing Airtable environment variables" })
    };
  }

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);

  url.searchParams.set("pageSize", "100");

  try {
    let records = [];
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "Airtable request failed",
            details: message
          })
        };
      }

      const data = await response.json();
      records.push(...data.records);
      offset = data.offset;
    } while (offset);

    const grants = records
      .map(record => {
        const fields = record.fields || {};

        return {
          id: record.id,
          name: fields["Name"] || "",
          amount: fields["Amount (£)"] || 0,
          startDate: fields["Start Date"] || "",
          endDate: fields["End Date"] || "",
          fundingType: fields["Funding Type"] || "",
          activeYear: fields["Active Year"] || "",
          monthsRemaining: fields["Months Remaining"] || "",
          programme: fields["Programme"] || "",
          status: fields["Status"] || ""
        };
      })
      .filter(grant => {
        if (!grant.name) return false;
        if (grant.programme === "Investment") return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return dateB - dateA;
      });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: tableName,
        count: grants.length,
        grants
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Could not load portfolio grants" })
    };
  }
};
