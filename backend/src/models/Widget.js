const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
    badge: { type: String, default: "Highlight" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "🚀" },
    linkText: { type: String, default: "Explore" },
    linkApp: { type: String, default: "project-manager" },
    bgGradient: { type: String, default: "blue" }, // blue, purple, emerald, amber, rose, glass
    isVisible: { type: Boolean, default: true }
});

const widgetSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    title: { type: String, default: "Highlights & Spotlight" },
    slideInterval: { type: Number, default: 5 }, // in seconds
    slides: [slideSchema]
}, { timestamps: true });

module.exports = mongoose.model("Widget", widgetSchema);
