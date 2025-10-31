export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const supabaseSecret = req.headers["x-supabase-secret"];
  if (supabaseSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return res.status(403).send("Unauthorized");
  }

  try {
    console.log("Received ping from Supabase:", req.body);

    const response = await fetch(
      "https://api.openai.com/v1/custom_gpts/actions/pingLearningSession",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      }
    );

    if (!response.ok) {
      console.error("GPT action failed", await response.text());
      return res.status(500).send("Ping relay failed.");
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Ping relay error:", err);
    return res.status(500).send("Error relaying ping.");
  }
}
