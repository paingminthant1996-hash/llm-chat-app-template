"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Edit, Eye } from "lucide-react";
import { Template } from "@/lib/types";
import { getAllTemplates } from "@/lib/db/queries";
import {
  updateTemplate,
  deleteTemplate,
  toggleFeatured,
  bulkDeleteTemplates,
  bulkUpdateCategory,
  bulkToggleFeatured,
} from "@/app/actions/manage-templates";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    demoUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>("");

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const data = await getAllTemplates();
        setTemplates(data);
        setFilteredTemplates(data);
      } catch (err: any) {
        setError(err.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // Filter templates
  useEffect(() => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Featured filter
    if (featuredFilter === "featured") {
      filtered = filtered.filter((t) => t.featured);
    } else if (featuredFilter === "not-featured") {
      filtered = filtered.filter((t) => !t.featured);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, categoryFilter, featuredFilter, templates]);

  // Get unique categories
  const categories = Array.from(new Set(templates.map((t) => t.category)));

  // Handle edit
  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setEditForm({
      title: template.title,
      description: template.description,
      price: template.price.toString(),
      category: template.category,
      demoUrl: template.demoUrl || "",
    });
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editingTemplate) return;

    setError(null);
    setSuccess(null);

    const result = await updateTemplate(editingTemplate.id, {
      title: editForm.title,
      description: editForm.description,
      price: parseFloat(editForm.price),
      category: editForm.category,
      demo_url: editForm.demoUrl || undefined,
    });

    if (result.success) {
      setSuccess("Template updated successfully!");
      setEditingTemplate(null);
      // Refresh templates
      const data = await getAllTemplates();
      setTemplates(data);
    } else {
      setError(result.error || "Failed to update template");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    setIsDeleting(id);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteTemplate(id);

      if (result.success) {
        setSuccess("Template deleted successfully!");
        // Refresh templates
        const data = await getAllTemplates();
        setTemplates(data);
      } else {
        setError(result.error || "Failed to delete template");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete template");
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setError(null);
    setSuccess(null);

    const result = await toggleFeatured(id, !currentFeatured);

    if (result.success) {
      setSuccess(`Template ${!currentFeatured ? "marked as" : "removed from"} featured!`);
      // Refresh templates
      const data = await getAllTemplates();
      setTemplates(data);
    } else {
      setError(result.error || "Failed to toggle featured status");
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedTemplates.size === 0) {
      setError("Please select at least one template");
      return;
    }

    setError(null);
    setSuccess(null);

    const ids = Array.from(selectedTemplates);
    let result;

    if (bulkAction === "delete") {
      if (!confirm(`Are you sure you want to delete ${ids.length} template(s)?`)) return;
      result = await bulkDeleteTemplates(ids);
    } else if (bulkAction === "update-category") {
      const category = prompt("Enter new category:");
      if (!category) return;
      result = await bulkUpdateCategory(ids, category);
    } else if (bulkAction === "toggle-featured") {
      const featured = confirm("Mark as featured? (Cancel to remove from featured)");
      result = await bulkToggleFeatured(ids, featured);
    } else {
      setError("Please select a bulk action");
      return;
    }

    if (result.success) {
      setSuccess(`Bulk action completed successfully!`);
      setSelectedTemplates(new Set());
      setBulkAction("");
      // Refresh templates
      const data = await getAllTemplates();
      setTemplates(data);
    } else {
      setError(result.error || "Failed to perform bulk action");
    }
  };

  // Toggle template selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTemplates(newSelected);
  };

  // Select all
  const selectAll = () => {
    if (selectedTemplates.size === filteredTemplates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(filteredTemplates.map((t) => t.id)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azone-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Manage Templates</h1>
              <p className="text-gray-400">View, edit, and manage all templates in the marketplace</p>
            </div>
            <Link
              href="/admin/upload"
              className="px-6 py-3 text-sm font-semibold bg-azone-purple text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50"
            >
              Upload New Template
            </Link>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg"
          >
            <p className="text-green-400 text-sm">{success}</p>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
              >
                <option value="all">All Templates</option>
                <option value="featured">Featured Only</option>
                <option value="not-featured">Not Featured</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTemplates.size > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
              <span className="text-sm text-gray-400">
                {selectedTemplates.size} template(s) selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-azone-purple"
              >
                <option value="">Select bulk action...</option>
                <option value="delete">Delete Selected</option>
                <option value="update-category">Update Category</option>
                <option value="toggle-featured">Toggle Featured</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-azone-purple text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-azone-purple/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedTemplates(new Set())}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-all"
              >
                Clear Selection
              </button>
            </div>
          )}
        </motion.div>

        {/* Templates List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.size === filteredTemplates.length && filteredTemplates.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 text-azone-purple bg-gray-800 border-gray-700 rounded focus:ring-azone-purple"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Template</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Featured</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No templates found
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.has(template.id)}
                          onChange={() => toggleSelection(template.id)}
                          className="w-4 h-4 text-azone-purple bg-gray-800 border-gray-700 rounded focus:ring-azone-purple"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {template.imageUrl && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={template.imageUrl}
                                alt={template.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">{template.title}</div>
                            <div className="text-sm text-gray-400 line-clamp-1">
                              {template.description.substring(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                          {template.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">${template.price}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleFeatured(template.id, template.featured)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            template.featured
                              ? "bg-azone-purple/20 text-azone-purple border border-azone-purple"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}
                        >
                          {template.featured ? "Featured" : "Not Featured"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(template)}
                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-all flex items-center gap-1.5"
                            title="Edit template"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            disabled={isDeleting === template.id}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isDeleting === template.id ? "Deleting..." : "Delete"}
                          </button>
                          <Link
                            href={`/templates/${template.slug}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700 transition-all flex items-center gap-1.5"
                            title="View template"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Edit Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Edit Template</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Demo URL</label>
                  <input
                    type="url"
                    value={editForm.demoUrl}
                    onChange={(e) => setEditForm({ ...editForm, demoUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-6 py-3 bg-azone-purple text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-azone-purple/50 transition-all"
                >
                  Update Template
                </button>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
