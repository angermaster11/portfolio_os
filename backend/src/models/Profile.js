const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: ""
        },

        email: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: ""
        },

        photo: {
            type: String,
            default: ""
        },

        skills: [
            {
                type: String
            }
        ],

        education: [
            {
                institute: { type: String, default: "" },
                degree: { type: String, default: "" },
                field: { type: String, default: "" },
                cpi: { type: String, default: "" },
                startYear: { type: String, default: "" },
                endYear: { type: String, default: "" }
            }
        ],

        experience: [
            {
                company: { type: String, default: "" },
                role: { type: String, default: "" },
                description: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" }
            }
        ],

        certifications: [
            {
                title: { type: String, default: "" },
                issuer: { type: String, default: "" },
                date: { type: String, default: "" },
                link: { type: String, default: "" }
            }
        ],

        extraActivities: [
            {
                title: { type: String, default: "" },
                description: { type: String, default: "" }
            }
        ],

        projects: [
            {
                title: { type: String, default: "" },
                description: { type: String, default: "" },
                techStack: { type: String, default: "" },
                liveLink: { type: String, default: "" },
                githubLink: { type: String, default: "" }
            }
        ],

        socialLinks: {
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            twitter: { type: String, default: "" },
            website: { type: String, default: "" }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Profile", profileSchema);
