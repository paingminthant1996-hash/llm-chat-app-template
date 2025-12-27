"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, X, Check, AlertCircle } from "lucide-react";
// Upload files via API route (uses service role key - bypasses RLS policies)

type Status = "draft" | "private" | "public";
type LicenseType = "personal" | "commercial" | "extended";

export default function AdminUploadPage() {
    const [formData, setFormData] = useState({
        // Basic Info
        title: "",
        shortDescription: "",
        description: "",
        price: "",
        category: "SaaS",
        status: "draft" as Status,
        version: "1.0.0",

        // Live Demo
        demoUrl: "",

        // Tech Stack
        framework: [] as string[],
        language: "typescript",
        styling: "tailwind",

        // License
        licenseType: "commercial" as LicenseType,
        licenseSummary: "",

        // Meta / SEO
        metaTitle: "",
        metaDescription: "",
        keywords: "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [uploadProgress, setUploadProgress] = useState<string>("");

    // Upload file via API route (uses service role key - bypasses RLS policies)
    const uploadFileToStorage = async (file: File, folder: "previews" | "downloads", templateSlug: string): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        formData.append("templateSlug", templateSlug);

        const response = await fetch("/api/upload-file", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
            throw new Error(errorData.error || `Upload failed: ${response.status}`);
        }

        const result = await response.json();
        if (!result.url) {
            throw new Error("Failed to get upload URL");
        }

        return result.url;
    };

    const frameworkOptions = ["Next.js", "React", "Vue", "Svelte", "Angular"];
    const categoryOptions = [
        "SaaS",
        "Dashboard",
        "E-commerce",
        "Landing Page",
        "Admin Panel",
        "Portfolio",
        "Other"
    ];

    // Auto-fill helper functions
    const autoFillFromTitle = (title: string) => {
        // Auto-generate slug-friendly suggestions
        const suggestions: Partial<typeof formData> = {};

        // Auto-detect category from title
        const titleLower = title.toLowerCase();
        if (titleLower.includes("dashboard") || titleLower.includes("admin")) {
            suggestions.category = "Dashboard";
        } else if (titleLower.includes("ecommerce") || titleLower.includes("shop")) {
            suggestions.category = "E-commerce";
        } else if (titleLower.includes("landing") || titleLower.includes("marketing")) {
            suggestions.category = "Landing Page";
        } else if (titleLower.includes("portfolio")) {
            suggestions.category = "Portfolio";
        }

        // Auto-generate short description if empty
        if (!formData.shortDescription && title.length > 0) {
            suggestions.shortDescription = `Premium ${title} - Production-ready template with modern design and best practices.`;
        }

        // Auto-generate meta title if empty
        if (!formData.metaTitle && title.length > 0) {
            suggestions.metaTitle = `${title} | Premium Template | Azone.store`;
        }

        // Auto-generate keywords from title
        if (!formData.keywords && title.length > 0) {
            const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            suggestions.keywords = words.join(", ");
        }

        if (Object.keys(suggestions).length > 0) {
            setFormData((prev) => ({ ...prev, ...suggestions }));
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-fill suggestions when title changes
        if (name === "title" && value.length > 5) {
            autoFillFromTitle(value);
        }

        // Auto-generate meta description from short description
        if (name === "shortDescription" && !formData.metaDescription && value.length > 0) {
            setFormData((prev) => ({
                ...prev,
                metaDescription: value.length > 160 ? value.substring(0, 157) + "..." : value
            }));
        }

        // Clear field error when user types
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFrameworkToggle = (framework: string) => {
        setFormData((prev) => {
            const current = prev.framework;
            const updated = current.includes(framework)
                ? current.filter((f) => f !== framework)
                : [...current, framework];
            return { ...prev, framework: updated };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please select a valid image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                return;
            }
            setImageFile(file);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith(".zip")) {
                setError("Please select a ZIP file");
                return;
            }
            if (file.size > 100 * 1024 * 1024) {
                setError("ZIP file size must be less than 100MB");
                return;
            }
            setZipFile(file);
            setError(null);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) errors.title = "Title is required";
        if (!formData.shortDescription.trim()) errors.shortDescription = "Short description is required";
        if (!formData.description.trim()) errors.description = "Description is required";
        if (!formData.price || parseFloat(formData.price) <= 0) errors.price = "Valid price is required";
        if (!imageFile) errors.image = "Preview image is required";
        if (!zipFile) errors.zip = "Template ZIP file is required";
        if (formData.framework.length === 0) errors.framework = "At least one framework is required";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isFormValid = (): boolean => {
        return (
            formData.title.trim() !== "" &&
            formData.shortDescription.trim() !== "" &&
            formData.description.trim() !== "" &&
            formData.price !== "" &&
            parseFloat(formData.price) > 0 &&
            imageFile !== null &&
            zipFile !== null &&
            formData.framework.length > 0
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            setError("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        setUploadProgress("Preparing upload...");

        try {
            // Generate slug for file naming
            const slug = formData.title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");

            // Step 1: Upload files directly to Supabase Storage (bypasses Vercel 4.5MB limit)
            setUploadProgress("Uploading files to storage...");
            let imageUrl = "";
            let zipUrl = "";

            if (imageFile) {
                setUploadProgress("Uploading preview image...");
                imageUrl = await uploadFileToStorage(imageFile, "previews", slug);
            }

            if (zipFile) {
                setUploadProgress("Uploading template ZIP file...");
                zipUrl = await uploadFileToStorage(zipFile, "downloads", slug);
            }

            // Step 2: Send only URLs and form data to API route (small payload)
            setUploadProgress("Saving template data...");
            const formDataToSend = new FormData();

            // Basic Info
            formDataToSend.append("title", formData.title);
            formDataToSend.append("shortDescription", formData.shortDescription);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("price", formData.price);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("status", formData.status);
            formDataToSend.append("version", formData.version);

            // Live Demo
            formDataToSend.append("demoUrl", formData.demoUrl);

            // Media URLs (not files)
            formDataToSend.append("imageUrl", imageUrl);
            formDataToSend.append("zipUrl", zipUrl);

            // Tech Stack
            formDataToSend.append("techStack", JSON.stringify({
                framework: formData.framework,
                language: formData.language,
                styling: formData.styling,
            }));

            // License
            formDataToSend.append("licenseType", formData.licenseType);
            formDataToSend.append("licenseSummary", formData.licenseSummary);

            // Meta / SEO
            formDataToSend.append("metaTitle", formData.metaTitle || formData.title);
            formDataToSend.append("metaDescription", formData.metaDescription || formData.shortDescription);
            formDataToSend.append("keywords", formData.keywords);

            const response = await fetch("/api/upload-template", {
                method: "POST",
                body: formDataToSend,
            });

            setUploadProgress("Processing...");

            // Check if response is ok
            if (!response.ok) {
                let errorMessage = "Failed to upload template";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                setError(errorMessage);
                setUploadProgress("");
                setIsSubmitting(false);
                return;
            }

            const result = await response.json();

            if (result.error) {
                setError(result.error);
                setUploadProgress("");
                setIsSubmitting(false);
                return;
            }

            setUploadProgress("Upload complete!");

            // Success
            setSuccess(`Template "${formData.title}" uploaded successfully!`);

            // Reset form
            setFormData({
                title: "",
                shortDescription: "",
                description: "",
                price: "",
                category: "SaaS",
                status: "draft",
                version: "1.0.0",
                demoUrl: "",
                framework: [],
                language: "typescript",
                styling: "tailwind",
                licenseType: "commercial",
                licenseSummary: "",
                metaTitle: "",
                metaDescription: "",
                keywords: "",
            });
            setImageFile(null);
            setPreviewUrl(null);
            setZipFile(null);
            setFieldErrors({});

            // Reset file inputs
            const imageInput = document.getElementById("image") as HTMLInputElement;
            const zipInput = document.getElementById("zipFile") as HTMLInputElement;
            if (imageInput) imageInput.value = "";
            if (zipInput) zipInput.value = "";

            setUploadProgress("");
            setIsSubmitting(false);
        } catch (err: any) {
            console.error("Upload error:", err);
            let errorMessage = "Failed to upload template. Please check your connection and try again.";

            if (err.name === "AbortError") {
                const fileSize = zipFile ? `${(zipFile.size / 1024 / 1024).toFixed(2)} MB` : "unknown size";
                errorMessage = `Upload timeout after 3 minutes. File size: ${fileSize}. Please try again or reduce file size (max 100MB).`;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setUploadProgress("");
            setIsSubmitting(false);
        }
    };

    const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
        <div className="border-b border-gray-800 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
    );

    const FieldWrapper = ({
        label,
        required,
        error,
        children
    }: {
        label: string;
        required?: boolean;
        error?: string;
        children: React.ReactNode;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Upload Template</h1>
                    <p className="text-gray-400">Create a premium template listing for the marketplace</p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-8"
                >
                    {/* Basic Info Section */}
                    <div>
                        <SectionHeader
                            title="Basic Information"
                            description="Essential details about your template"
                        />
                        <div className="space-y-6">
                            <FieldWrapper label="Title" required error={fieldErrors.title}>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    placeholder="e.g., Premium SaaS Dashboard Template"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    💡 Tip: Title ရိုက်ရင် category, description, keywords တွေ auto-fill ဖြစ်သွားမယ်
                                </p>
                            </FieldWrapper>

                            <FieldWrapper label="Short Description" required error={fieldErrors.shortDescription}>
                                <input
                                    type="text"
                                    id="shortDescription"
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleInputChange}
                                    maxLength={500}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    placeholder="Brief one-line description (max 500 characters)"
                                />
                                <div className="mt-1 flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                        {formData.shortDescription.length}/500 characters
                                    </p>
                                    {formData.shortDescription.length > 0 && (
                                        <p className="text-xs text-azone-purple">
                                            ✅ Meta description auto-filled
                                        </p>
                                    )}
                                </div>
                            </FieldWrapper>

                            <FieldWrapper label="Full Description" required error={fieldErrors.description}>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={8}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all resize-none font-mono text-sm"
                                    placeholder="Detailed description. Supports markdown formatting..."
                                />
                            </FieldWrapper>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FieldWrapper label="Price (USD)" required error={fieldErrors.price}>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                            placeholder="89.00"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        💡 Suggested: $29-$199 for premium templates
                                    </p>
                                </FieldWrapper>

                                <FieldWrapper label="Category" required>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    >
                                        {categoryOptions.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </FieldWrapper>

                                <FieldWrapper label="Status" required>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="private">Private</option>
                                        <option value="public">Public</option>
                                    </select>
                                </FieldWrapper>
                            </div>

                            <FieldWrapper label="Version">
                                <input
                                    type="text"
                                    id="version"
                                    name="version"
                                    value={formData.version}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    placeholder="1.0.0"
                                />
                            </FieldWrapper>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div>
                        <SectionHeader
                            title="Media"
                            description="Preview image and template source files"
                        />
                        <div className="space-y-6">
                            <FieldWrapper label="Preview Image" required error={fieldErrors.image}>
                                <div className="space-y-4">
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-azone-purple file:text-white hover:file:bg-azone-purple/80 transition-all cursor-pointer"
                                    />
                                    {previewUrl && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-700"
                                        >
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Recommended: 1280x800px, max 5MB. PNG or JPG format.
                                </p>
                            </FieldWrapper>

                            <FieldWrapper label="Template ZIP File" required error={fieldErrors.zip}>
                                <div className="space-y-4">
                                    <input
                                        type="file"
                                        id="zipFile"
                                        name="zipFile"
                                        accept=".zip"
                                        onChange={handleZipChange}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-azone-purple file:text-white hover:file:bg-azone-purple/80 transition-all cursor-pointer"
                                    />
                                    {zipFile && (
                                        <div className="flex items-center gap-2 p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
                                            <Check className="w-5 h-5 text-green-400" />
                                            <span className="text-sm text-gray-300">{zipFile.name}</span>
                                            <span className="text-xs text-gray-500 ml-auto">
                                                {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Upload complete template source code as ZIP file. Max 100MB.
                                </p>
                            </FieldWrapper>
                        </div>
                    </div>

                    {/* Live Demo Section */}
                    <div>
                        <SectionHeader
                            title="Live Demo"
                            description="Link to live preview of your template"
                        />
                        <FieldWrapper label="Live Preview URL">
                            <input
                                type="url"
                                id="demoUrl"
                                name="demoUrl"
                                value={formData.demoUrl}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                placeholder="https://demo.example.com"
                            />
                        </FieldWrapper>
                    </div>

                    {/* Tech Stack Section */}
                    <div>
                        <SectionHeader
                            title="Tech Stack"
                            description="Technologies used in this template"
                        />
                        <div className="space-y-6">
                            <FieldWrapper label="Framework" required error={fieldErrors.framework}>
                                <div className="flex flex-wrap gap-3">
                                    {frameworkOptions.map((fw) => (
                                        <button
                                            key={fw}
                                            type="button"
                                            onClick={() => handleFrameworkToggle(fw)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${formData.framework.includes(fw)
                                                ? "bg-azone-purple/20 border-azone-purple text-white"
                                                : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                                                }`}
                                        >
                                            {formData.framework.includes(fw) && (
                                                <Check className="w-4 h-4 inline-block mr-2" />
                                            )}
                                            {fw}
                                        </button>
                                    ))}
                                </div>
                            </FieldWrapper>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FieldWrapper label="Language">
                                    <select
                                        id="language"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    >
                                        <option value="typescript">TypeScript</option>
                                        <option value="javascript">JavaScript</option>
                                    </select>
                                </FieldWrapper>

                                <FieldWrapper label="Styling">
                                    <select
                                        id="styling"
                                        name="styling"
                                        value={formData.styling}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    >
                                        <option value="tailwind">Tailwind CSS</option>
                                        <option value="css">CSS</option>
                                        <option value="scss">SCSS</option>
                                        <option value="styled-components">Styled Components</option>
                                        <option value="emotion">Emotion</option>
                                    </select>
                                </FieldWrapper>
                            </div>
                        </div>
                    </div>

                    {/* License Section */}
                    <div>
                        <SectionHeader
                            title="License"
                            description="License information for this template"
                        />
                        <div className="space-y-6">
                            <FieldWrapper label="License Type">
                                <select
                                    id="licenseType"
                                    name="licenseType"
                                    value={formData.licenseType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                >
                                    <option value="personal">Personal License</option>
                                    <option value="commercial">Commercial License</option>
                                    <option value="extended">Extended License</option>
                                </select>
                            </FieldWrapper>

                            <FieldWrapper label="License Summary">
                                <textarea
                                    id="licenseSummary"
                                    name="licenseSummary"
                                    rows={4}
                                    value={formData.licenseSummary}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all resize-none"
                                    placeholder="Brief summary of license terms and usage rights..."
                                />
                            </FieldWrapper>
                        </div>
                    </div>

                    {/* Meta / SEO Section */}
                    <div>
                        <SectionHeader
                            title="Meta / SEO"
                            description="SEO optimization fields (optional, defaults to title/description)"
                        />
                        <div className="space-y-6">
                            <FieldWrapper label="Meta Title">
                                <input
                                    type="text"
                                    id="metaTitle"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    placeholder="Leave empty to use template title"
                                />
                                {formData.metaTitle && (
                                    <p className="mt-1 text-xs text-azone-purple">
                                        ✅ Auto-generated from title
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    💡 Leave empty to auto-generate from title
                                </p>
                            </FieldWrapper>

                            <FieldWrapper label="Meta Description">
                                <textarea
                                    id="metaDescription"
                                    name="metaDescription"
                                    rows={3}
                                    value={formData.metaDescription}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all resize-none"
                                    placeholder="Leave empty to use short description"
                                />
                            </FieldWrapper>

                            <FieldWrapper label="Keywords">
                                <input
                                    type="text"
                                    id="keywords"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                    placeholder="Comma-separated keywords (e.g., saas, dashboard, nextjs)"
                                />
                                {formData.keywords && (
                                    <p className="mt-1 text-xs text-azone-purple">
                                        ✅ Auto-generated from title
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    💡 Leave empty to auto-generate from title
                                </p>
                            </FieldWrapper>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 font-medium">Upload Failed</p>
                                <p className="text-red-400/80 text-sm mt-1">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start gap-3"
                        >
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-green-400 font-medium">Success!</p>
                                <p className="text-green-400/80 text-sm mt-1">{success}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-800">
                        <motion.button
                            type="submit"
                            disabled={isSubmitting || !isFormValid()}
                            whileHover={isSubmitting || !isFormValid() ? {} : { scale: 1.02 }}
                            whileTap={isSubmitting || !isFormValid() ? {} : { scale: 0.98 }}
                            className="w-full px-6 py-4 text-lg font-semibold bg-azone-purple text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {uploadProgress || "Uploading Template..."}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Upload Template
                                </>
                            )}
                        </motion.button>
                        {!isFormValid() && (
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                Please fill in all required fields to enable upload
                            </p>
                        )}
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
