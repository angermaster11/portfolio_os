const Presentation = require("../../models/Presentation");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// GET /api/presentation
const getPresentation = async (req, res) => {
    try {
        let ppt = await Presentation.findOne();
        if (!ppt) {
            ppt = await Presentation.create({
                title: "My Portfolio Presentation",
                pptUrl: "",
                pdfUrl: "",
                slideImages: [],
                fileName: "",
                fileType: "",
                slideInterval: 5
            });
        }
        res.json({ success: true, data: ppt });
    } catch (err) {
        console.error("getPresentation error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Helper: Convert PPTX/PPT to PDF using LibreOffice
const convertToPdf = (inputPath, outputDir) => {
    return new Promise((resolve) => {
        const cmd = `libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("LibreOffice PDF conversion error:", error, stderr);
                resolve(null);
            } else {
                const parsed = path.parse(inputPath);
                const pdfName = `${parsed.name}.pdf`;
                const pdfPath = path.join(outputDir, pdfName);
                if (fs.existsSync(pdfPath)) {
                    resolve(pdfPath);
                } else {
                    resolve(null);
                }
            }
        });
    });
};

// Helper: Convert PDF pages to PNG images using pdftoppm
const extractSlideImages = (pdfPath, slidesDir, folderName) => {
    return new Promise((resolve) => {
        if (!fs.existsSync(slidesDir)) {
            fs.mkdirSync(slidesDir, { recursive: true });
        }
        const outputPrefix = path.join(slidesDir, "slide");
        const cmd = `pdftoppm -png -r 150 "${pdfPath}" "${outputPrefix}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("pdftoppm conversion error:", error, stderr);
                resolve([]);
            } else {
                try {
                    const files = fs.readdirSync(slidesDir)
                        .filter(f => f.startsWith("slide") && f.endsWith(".png"))
                        .sort((a, b) => {
                            const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
                            const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
                            return numA - numB;
                        });

                    const imageUrls = files.map(f => `/uploads/${folderName}/${f}`);
                    resolve(imageUrls);
                } catch (e) {
                    console.error("Error reading slide images:", e);
                    resolve([]);
                }
            }
        });
    });
};

// POST /api/presentation/upload - Upload PPT/PDF File
const uploadPresentationFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No presentation file uploaded" });
        }

        const uploadsDir = path.join(__dirname, "../../../uploads");
        const fileUrl = `/uploads/${req.file.filename}`;
        const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
        const filePath = path.join(uploadsDir, req.file.filename);

        let finalPdfPath = "";
        let pdfUrl = "";

        if (ext === "pdf") {
            finalPdfPath = filePath;
            pdfUrl = fileUrl;
        } else if (["ppt", "pptx", "odp"].includes(ext)) {
            console.log(`Converting ${req.file.originalname} to PDF via LibreOffice...`);
            const convertedPdf = await convertToPdf(filePath, uploadsDir);
            if (convertedPdf) {
                finalPdfPath = convertedPdf;
                pdfUrl = `/uploads/${path.basename(convertedPdf)}`;
                console.log(`Successfully converted to PDF: ${pdfUrl}`);
            }
        }

        // Extract slide images if PDF is available
        let slideImages = [];
        if (finalPdfPath && fs.existsSync(finalPdfPath)) {
            const folderName = `slides-${Date.now()}`;
            const slidesDir = path.join(uploadsDir, folderName);
            console.log(`Extracting slide images to ${folderName}...`);
            slideImages = await extractSlideImages(finalPdfPath, slidesDir, folderName);
            console.log(`Extracted ${slideImages.length} slide images!`);
        } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
            slideImages = [fileUrl];
        }

        let ppt = await Presentation.findOne();
        if (!ppt) {
            ppt = new Presentation();
        }

        ppt.pptUrl = fileUrl;
        ppt.pdfUrl = pdfUrl || fileUrl;
        ppt.slideImages = slideImages;
        ppt.fileName = req.file.originalname;
        ppt.fileType = ext;
        if (req.body.title) ppt.title = req.body.title;

        await ppt.save();

        res.json({
            success: true,
            message: `Uploaded presentation with ${slideImages.length} slides!`,
            data: ppt
        });
    } catch (err) {
        console.error("uploadPresentationFile error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /api/presentation/file - Remove current file
const deletePresentationFile = async (req, res) => {
    try {
        let ppt = await Presentation.findOne();
        if (ppt) {
            const uploadsDir = path.join(__dirname, "../../../");
            if (ppt.pptUrl) {
                const filePath = path.join(uploadsDir, ppt.pptUrl);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            if (ppt.pdfUrl && ppt.pdfUrl !== ppt.pptUrl) {
                const pdfPath = path.join(uploadsDir, ppt.pdfUrl);
                if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            }

            ppt.pptUrl = "";
            ppt.pdfUrl = "";
            ppt.slideImages = [];
            ppt.fileName = "";
            ppt.fileType = "";
            await ppt.save();
        }
        res.json({ success: true, message: "PPT file removed", data: ppt });
    } catch (err) {
        console.error("deletePresentationFile error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getPresentation,
    uploadPresentationFile,
    deletePresentationFile
};
