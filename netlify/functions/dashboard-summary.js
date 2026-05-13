exports.handler = async function (event) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = "Individual Grants";
  const programmeFilter = event.queryStringParameters?.programme || "Lightbulb Trust";
  const includeInvestments = programmeFilter === "Lightbulb Trust" || programmeFilter === "Greenlight";

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

    const today = new Date();
    const sixMonthsFromToday = new Date(today);
    sixMonthsFromToday.setMonth(sixMonthsFromToday.getMonth() + 6);

    let totalActiveFunding = 0;
    let totalGrantFunding = 0;
    let totalInvestmentFunding = 0;
    let liveGrants = 0;
    let investments = 0;
    let grantsEndingSoon = 0;
    let grantTotal = 0;
    let grantCount = 0;

    for (const record of records) {
      const fields = record.fields || {};
      const programme = fields["Programme"] || "";
      const status = fields["Status"] || "";
      const fundingType = fields["Funding Type"] || "";
      const amount = fields["Amount (£)"];
      const endDateValue = fields["End Date"];

      const isActive = status === "Active";
      const isRequestedProgramme = programme === programmeFilter;
      const isInvestment = programme === "Investment";

      if (isRequestedProgramme && isActive && typeof amount === "number") {
        totalGrantFunding += amount;
        totalActiveFunding += amount;
      }

      if (includeInvestments && isInvestment && isActive && typeof amount === "number") {
        totalInvestmentFunding += amount;
        totalActiveFunding += amount;
      }

      if (isRequestedProgramme && isActive) {
        liveGrants += 1;
      }

      if (includeInvestments && isInvestment && isActive) {
        investments += 1;
      }

      if (isRequestedProgramme && isActive && endDateValue) {
        const endDate = new Date(endDateValue);
        if (!Number.isNaN(endDate.getTime()) && endDate >= today && endDate <= sixMonthsFromToday) {
          grantsEndingSoon += 1;
        }
      }

      if (isRequestedProgramme && fundingType === "Grant" && typeof amount === "number") {
        grantTotal += amount;
        grantCount += 1;
      }
    }

    const averageGrantSize = grantCount > 0 ? grantTotal / grantCount : 0;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programme: programmeFilter,
        totalActiveFunding,
        totalGrantFunding,
        totalInvestmentFunding,
        liveGrants,
        investments,
        grantsEndingSoon,
        averageGrantSize,
        recordsChecked: records.length
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Could not load dashboard summary"
      })
    };
  }
};
