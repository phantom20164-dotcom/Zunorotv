export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  return res.status(501).json({
    success: false,
    message: "Official MovieBox details API is not configured yet."
  });
}
