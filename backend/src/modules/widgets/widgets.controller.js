const Widget = require("../../models/Widget");

// Default initial slides if DB is empty
const DEFAULT_SLIDES = [
    {
        badge: "Full Stack & AI Engineer",
        title: "Crafting High-Performance Products 🚀",
        description: "Arju Srivastava specializes in scalable Node.js microservices, React web apps, and RAG-powered AI solutions.",
        icon: "⚡",
        linkText: "View Projects",
        linkApp: "project-manager",
        bgGradient: "blue",
        isVisible: true
    },
    {
        badge: "AskGPT AI Assistant",
        title: "Intelligent RAG Assistant Online 🤖",
        description: "Chat with AskGPT to query Arju's custom knowledge base, skills, projects, and work experience in real-time.",
        icon: "🧠",
        linkText: "Ask AI Now",
        linkApp: "askgpt",
        bgGradient: "purple",
        isVisible: true
    },
    {
        badge: "Backend & Systems",
        title: "API Design & Cloud Architecture 🛠️",
        description: "Proven expertise in RESTful APIs, JWT Authentication, MongoDB, Docker, and production-oriented workflows.",
        icon: "⚙️",
        linkText: "My Profile",
        linkApp: "profile",
        bgGradient: "emerald",
        isVisible: true
    }
];

// GET /api/widgets - Get current slides & config
const getWidgets = async (req, res) => {
    try {
        let widget = await Widget.findOne();
        if (!widget) {
            widget = await Widget.create({
                enabled: true,
                title: "Highlights & Spotlight",
                slideInterval: 5,
                slides: DEFAULT_SLIDES
            });
        }
        res.json({ success: true, data: widget });
    } catch (err) {
        console.error("getWidgets error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/widgets - Update slides & config
const updateWidgets = async (req, res) => {
    try {
        const { enabled, title, slideInterval, slides } = req.body;

        let widget = await Widget.findOne();
        if (!widget) {
            widget = new Widget();
        }

        if (enabled !== undefined) widget.enabled = Boolean(enabled);
        if (title !== undefined) widget.title = title;
        if (slideInterval !== undefined) widget.slideInterval = Number(slideInterval) || 5;
        if (Array.isArray(slides)) widget.slides = slides;

        await widget.save();

        res.json({
            success: true,
            message: "Widget configuration updated successfully",
            data: widget
        });
    } catch (err) {
        console.error("updateWidgets error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getWidgets,
    updateWidgets
};
