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

  const today = new Date();
  const sixMonthsFromToday = new Date(today);
  sixMonthsFromToday.setMonth(sixMonthsFromToday.getMonth() + 6);

  const todayIso = today.toISOString().slice(0, 10);
  const sixMonthsIso = sixMonthsFromToday.toISOString().slice(0, 10);

  const filterFormula = `AND(
    {Programme} = 'Lightbulb Trust',
    {Status} = 'Active',
    IS_AFTER({End Date}, DATEADD('${todayIso}', -1, 'days')),
    IS_BEFORE({End Date}, DATEADD('${sixMonthsIso}', 1, 'days'))
  )`;

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);

  url.searchParams.set("filterByFormula", filterFormula);
  url.searchParams.set("pageSize", "100");

  try {
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

      count += data.records.length;
      offset = data.offset;
    } while (offset);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        grantsEndingSoon: count,
        from: todayIso,
        to: sixMonthsIso
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Could not load grants ending soon"
      })
    };
  }
};
