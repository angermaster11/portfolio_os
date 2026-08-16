const Project = require("../../models/Project");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// GET /api/projects/tree — public
const getTree = async (req, res) => {
    try {
        const allNodes = await Project.find().sort({ order: 1 }).lean();

        // Build tree structure cleanly
        const nodeMap = {};
        const roots = [];

        for (const node of allNodes) {
            node.children = [];
            nodeMap[node._id.toString()] = node;
        }

        for (const node of allNodes) {
            if (node.parentId) {
                const parentKey = node.parentId.toString();
                const parent = nodeMap[parentKey];

                if (parent) {
                    parent.children.push(node);
                } else {
                    roots.push(node);
                }
            } else {
                roots.push(node);
            }
        }

        res.status(200).json({
            success: true,
            data: roots
        });
    } catch (error) {
        console.error("Get tree error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// POST /api/projects/node — protected
const createNode = async (req, res) => {
    try {
        const { name, type, parentId, description, language, githubLink, deploymentLink, content } =
            req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Name and type are required"
            });
        }

        const count = await Project.countDocuments({
            parentId: parentId || null
        });

        const node = await Project.create({
            name,
            type,
            parentId: parentId || null,
            description: description || "",
            language: language || "",
            githubLink: githubLink || "",
            deploymentLink: deploymentLink || "",
            content: content || "",
            order: count
        });

        res.status(201).json({
            success: true,
            message: "Node created",
            data: node
        });
    } catch (error) {
        console.error("Create node error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// PUT /api/projects/node/:id — protected
const updateNode = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const node = await Project.findByIdAndUpdate(id, updateData, {
            new: true
        });

        if (!node) {
            return res.status(404).json({
                success: false,
                message: "Node not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Node updated",
            data: node
        });
    } catch (error) {
        console.error("Update node error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// DELETE /api/projects/node/:id — protected
const deleteNode = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteRecursive = async (nodeId) => {
            const children = await Project.find({ parentId: nodeId });

            for (const child of children) {
                await deleteRecursive(child._id);
            }

            await Project.findByIdAndDelete(nodeId);
        };

        await deleteRecursive(id);

        res.status(200).json({
            success: true,
            message: "Node and children deleted"
        });
    } catch (error) {
        console.error("Delete node error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Helper to check if file is text/readable
const isTextFile = (filename) => {
    const textExtensions = [
        "js", "jsx", "ts", "tsx", "py", "html", "css", "scss", "json", "md", "txt",
        "go", "rs", "java", "c", "cpp", "h", "hpp", "sh", "env", "yml", "yaml",
        "toml", "xml", "php", "rb", "sql", "vue", "svelte", "lock", "gitignore",
        "dockerfile", "makefile"
    ];
    const ext = filename.split(".").pop().toLowerCase();
    return textExtensions.includes(ext) || filename.toLowerCase().startsWith("readme") || filename.startsWith(".");
};

// POST /api/projects/clone — protected
const cloneGithub = async (req, res) => {
    try {
        const { githubLink, parentId, deploymentLink } = req.body;

        if (!githubLink) {
            return res.status(400).json({
                success: false,
                message: "GitHub link is required"
            });
        }

        // Clean link
        const cleanLink = githubLink.trim().replace(/\.git$/, "");
        const repoName = cleanLink.split("/").pop() || "cloned-repo";

        const tmpDir = path.join(os.tmpdir(), `clone-${Date.now()}`);

        try {
            // Shallow clone
            execSync(
                `git clone --depth 1 "${githubLink}" "${tmpDir}"`,
                { timeout: 45000, stdio: "pipe" }
            );

            // Remove .git directory
            const gitDir = path.join(tmpDir, ".git");
            if (fs.existsSync(gitDir)) {
                fs.rmSync(gitDir, { recursive: true, force: true });
            }

            // Create root folder node
            const rootCount = await Project.countDocuments({
                parentId: parentId || null
            });

            // Find main README if exists in root
            let rootReadmeContent = "";
            try {
                const rootFiles = fs.readdirSync(tmpDir);
                const readmeFile = rootFiles.find(f => f.toLowerCase().startsWith("readme"));
                if (readmeFile) {
                    rootReadmeContent = fs.readFileSync(path.join(tmpDir, readmeFile), "utf-8");
                }
            } catch (e) {}

            const rootNode = await Project.create({
                name: repoName,
                type: "folder",
                parentId: parentId || null,
                githubLink: cleanLink,
                deploymentLink: deploymentLink || "",
                content: rootReadmeContent,
                order: rootCount
            });

            // Recursively read directory and create nodes
            const processDir = async (dirPath, nodeParentId) => {
                const entries = fs.readdirSync(dirPath, {
                    withFileTypes: true
                });

                let order = 0;

                // Sort: Folders first, then files
                const sorted = entries.sort((a, b) => {
                    if (a.isDirectory() && !b.isDirectory()) return -1;
                    if (!a.isDirectory() && b.isDirectory()) return 1;
                    return a.name.localeCompare(b.name);
                });

                for (const entry of sorted) {
                    const entryPath = path.join(dirPath, entry.name);

                    // Skip node_modules and .git
                    if (entry.name === "node_modules" || entry.name === ".git") {
                        continue;
                    }

                    const ext = path.extname(entry.name).slice(1);
                    let fileContent = "";

                    if (!entry.isDirectory() && isTextFile(entry.name)) {
                        try {
                            const stat = fs.statSync(entryPath);
                            if (stat.size < 1000000) { // Max 1MB per file
                                fileContent = fs.readFileSync(entryPath, "utf-8");
                            }
                        } catch (e) {
                            console.error(`Error reading file ${entryPath}:`, e.message);
                        }
                    }

                    const node = await Project.create({
                        name: entry.name,
                        type: entry.isDirectory() ? "folder" : "file",
                        parentId: nodeParentId,
                        language: ext || "",
                        content: fileContent,
                        githubLink: cleanLink,
                        deploymentLink: deploymentLink || "",
                        order: order++
                    });

                    if (entry.isDirectory()) {
                        await processDir(entryPath, node._id);
                    }
                }
            };

            await processDir(tmpDir, rootNode._id);

            // Cleanup
            fs.rmSync(tmpDir, { recursive: true, force: true });

            res.status(201).json({
                success: true,
                message: `Repository "${repoName}" cloned successfully`,
                data: { rootId: rootNode._id }
            });
        } catch (cloneError) {
            if (fs.existsSync(tmpDir)) {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            }
            throw cloneError;
        }
    } catch (error) {
        console.error("Clone GitHub error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to clone repository"
        });
    }
};

module.exports = {
    getTree,
    createNode,
    updateNode,
    deleteNode,
    cloneGithub
};
