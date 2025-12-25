"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { uploadTemplate } from "@/app/actions/upload-template";

export default function AdminUploadPage() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        demoUrl: "",
        category: "Dashboard",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate image file
            if (!file.type.startsWith("image/")) {
                setError("Please select a valid image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                setError("Image size must be less than 5MB");
                return;
            }
            setImageFile(file);
            setError(null);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            if (!imageFile) {
                setError("Please select an image");
                setIsSubmitting(false);
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("price", formData.price);
            formDataToSend.append("demoUrl", formData.demoUrl);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("image", imageFile);

            const result = await uploadTemplate(formDataToSend);

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(`Template "${formData.title}" uploaded successfully!`);
                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    price: "",
                    demoUrl: "",
                    category: "Dashboard",
                });
                setImageFile(null);
                setPreviewUrl(null);
                // Reset file input
                const fileInput = document.getElementById("image") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            }
        } catch (err: any) {
            setError(err.message || "Failed to upload template");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Upload Template</h1>
                    <p className="text-gray-400">Add a new premium template to the marketplace</p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-6"
                >
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                            placeholder="e.g., Aura AI Dashboard"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                            Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={6}
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all resize-none"
                            placeholder="Detailed description of the template..."
                        />
                    </div>

                    {/* Price and Category Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                                Price (USD) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                                placeholder="89.00"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                                Category <span className="text-red-400">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                            >
                                <option value="Dashboard">Dashboard</option>
                                <option value="SaaS">SaaS</option>
                                <option value="E-commerce">E-commerce</option>
                                <option value="Landing Page">Landing Page</option>
                                <option value="Admin Panel">Admin Panel</option>
                                <option value="Portfolio">Portfolio</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Demo URL */}
                    <div>
                        <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                            Demo URL
                        </label>
                        <input
                            type="url"
                            id="demoUrl"
                            name="demoUrl"
                            value={formData.demoUrl}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple focus:border-transparent transition-all"
                            placeholder="https://example.com/demo"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
                            Preview Image <span className="text-red-400">*</span>
                        </label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                required
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
                        <p className="mt-2 text-xs text-gray-500">Max file size: 5MB. Recommended: 1200x800px</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg"
                        >
                            <p className="text-red-400 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg"
                        >
                            <p className="text-green-400 text-sm">{success}</p>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        className="w-full px-6 py-4 text-lg font-semibold bg-azone-purple text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                Uploading...
                            </span>
                        ) : (
                            "Upload Template"
                        )}
                    </motion.button>
                </motion.form>
            </div>
        </div>
    );
}

