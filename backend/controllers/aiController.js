export const analyzeImage = async (req, res) => {
  try {
    res.json({
      result:
        "Nice outfit! Try adding contrast colors or layering with a jacket for a sharper look.",
    });
  } catch (error) {
    res.status(500).json({ error: "AI analysis failed" });
  }
};