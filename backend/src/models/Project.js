const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["file", "folder"],
            required: true
        },

        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null
        },

        content: {
            type: String,
            default: ""
        },

        githubLink: {
            type: String,
            default: ""
        },

        deploymentLink: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        language: {
            type: String,
            default: ""
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Index for fast tree queries
projectSchema.index({ parentId: 1, order: 1 });

module.exports = mongoose.model("Project", projectSchema);
