export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { activity, date, time, dressCode, dietary } = req.body;
  const webhookUrl = process.env.WEBHOOK_URL;

  console.log("Received proposal notification:", req.body);

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🎉 **New Date Proposal Accepted!** 🎉\n\n**Activity:** ${activity}\n**When:** ${date} @ ${time}\n**Dress Code:** ${dressCode}\n**Notes:** ${dietary || 'None'}`
        })
      });
    } catch (e) {
      console.error("Failed to send webhook", e);
      // We still return 200 so the frontend doesn't show an error to the user
    }
  }

  return res.status(200).json({ success: true });
}
