exports.handler = async function () {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Reporting";

  if (!token || !baseId) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing Airtable environment variables"
      })
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

    const reports = records
      .map(record => {
        const fields = record.fields || {};

        return {
          id: record.id,
          submissionDate: fields["Submission Date"] || "",
          organisation: fields["Organisation"] || "",
          fund: fields["Fund"] || "",
          reportLink: fields["Report Link"] || "",
          reportType: fields["Report Type"] || "",
          additionalReports: fields["Additional Reports"] || ""
        };
      })
      .filter(report => report.organisation || report.reportLink)
      .sort((a, b) => {
        const dateA = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
        const dateB = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
        return dateB - dateA;
      });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: tableName,
        count: reports.length,
        reports
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Could not load reports"
      })
    };
  }
};
