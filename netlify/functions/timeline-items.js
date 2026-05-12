exports.handler = async function (event) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Missing Supabase environment variables"
      })
    };
  }

  const page = event.queryStringParameters?.page || "Lightbulb";

  const url = new URL(`${supabaseUrl}/rest/v1/timeline_items`);

  url.searchParams.set("page", `eq.${page}`);
  url.searchParams.set("select", "id,page,organisation,amount,start_date,end_date,funding_year,follow_on_eligible,type,status,notes,sort_order,created_at,updated_at");
  url.searchParams.set("order", "sort_order.asc");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json"
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
          error: "Supabase request failed",
          details: message
        })
      };
    }

    const items = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        page,
        items
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Could not load timeline items"
      })
    };
  }
};
