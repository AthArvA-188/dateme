export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { activity, date, time, dressCode, dietary } = req.body;
  const webhookUrl = process.env.WEBHOOK_URL;

  console.log("Received proposal notification:", req.body);

  if (!webhookUrl) {
    console.warn("WEBHOOK_URL env var is not set — skipping notification.");
    return res.status(200).json({ success: true, notified: false });
  }

  const isSlack = webhookUrl.includes("hooks.slack.com");
  const message = `🎉 *New Date Proposal Accepted!* 🎉\n\n*Activity:* ${activity}\n*When:* ${date} @ ${time}\n*Dress Code:* ${dressCode}\n*Notes:* ${dietary || 'None'}`;

  // Slack expects { text }, Discord expects { content }
  const payload = isSlack
    ? { text: message }
    : { content: message.replace(/\*/g, "**") };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Webhook returned ${response.status}: ${body}`);
      return res.status(200).json({ success: true, notified: false, webhookStatus: response.status });
    }

    return res.status(200).json({ success: true, notified: true });
  } catch (e) {
    console.error("Failed to send webhook", e);
    return res.status(200).json({ success: true, notified: false });
  }
}
