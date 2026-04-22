const Setting = require("../models/Setting");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const getOrCreateSettings = async () => {
  let settings = await Setting.findOne({ key: "global" });
  if (!settings) {
    settings = await Setting.create({ key: "global" });
  }
  return settings;
};

const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

const updateSettings = async (req, res) => {
  try {
    await getOrCreateSettings();

    const companyName = normalizeText(req.body.companyName);
    const currency = normalizeText(req.body.currency).toUpperCase();

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required" });
    }

    if (!["USD", "EUR", "INR"].includes(currency)) {
      return res.status(400).json({ message: "Currency must be USD, EUR, or INR" });
    }

    const settings = await Setting.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          companyName,
          currency,
        },
        $unset: {
          logoUrl: 1,
          notifications: 1,
        },
      },
      {
        new: true,
        runValidators: true,
        strict: false,
      }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};

