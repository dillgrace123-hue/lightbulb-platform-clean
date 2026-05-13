exports.handler = async function (event) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Individual Grants";
  const programme = event.queryStringParameters?.programme || "Greenlight";

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

    const items = records
      .map((record, index) => {
        const fields = record.fields || {};
        const fofEligible = fields["FOF Eligible"] === true ? "Yes" : "No";

        return {
          id: record.id,
          page: fields["Programme"] || "",
          organisation: fields["Name"] || "",
          amount: fields["Amount (£)"] || 0,
          start_date: fields["Start Date"] || "",
          end_date: fields["End Date"] || "",
          funding_year: fields["Funding Term (Years)"] || "",
          follow_on_eligible: fofEligible,
          total_years_funded: fields["Total Years Funded (To End of Current Grant)"] ?? "",
          eligible_fof_years: fields["Eligible FOF Years"] ?? "",
          type: fields["Funding Type"] || "Grant",
          status: fields["Status"] || "",
          notes: fields["Notes"] || "",
          sort_order: index + 1
        };
      })
      .filter(item => {
        if (!item.organisation) return false;
        if (!item.start_date || !item.end_date) return false;
        if (item.page !== programme) return false;
        if (String(item.status || "").toLowerCase() !== "active") return false;
        return true;
      })
      .sort((a, b) => {
        const endA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const endB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return endA - endB;
      })
      .map((item, index) => ({
        ...item,
        sort_order: index + 1
      }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "airtable",
        programme,
        count: items.length,
        items
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Could not load timeline grants" })
    };
  }
};
