"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/lib/types";
import { ArrowLeft, Plus, Package, BarChart3, Layers, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

const categoryEmoji: Record<string, string> = {
  Ropa: "👕",
  Electrónicos: "🎧",
  Alimentos: "🥭",
  General: "📦",
};

const categories = ["Ropa", "Electrónicos", "Alimentos", "Accesorios", "Hogar"];

interface ProductForm {
  name: string;
  price: string;
  description: string;
  stock: string;
  category: string;
  imageUrl: string;
}

const emptyForm: ProductForm = { name: "", price: "", description: "", stock: "", category: "", imageUrl: "" };

export default function SetupPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const avgPrice = products.length > 0 ? (products.reduce((s, p) => s + parseFloat(p.price), 0) / products.length).toFixed(2) : "0.00";

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description || "",
      stock: String(p.stock),
      category: p.category || "",
      imageUrl: p.imageUrl || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      stock: parseInt(form.stock) || 0,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      category: form.category || null,
    };

    if (editingId) {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowModal(false);
    setForm(emptyForm);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-white">Flow</span>
                <span className="text-violet-500">Sell</span>
                <span className="text-zinc-500 font-normal ml-2">/ Setup</span>
              </h1>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar producto
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Package className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-zinc-500 text-xs">Productos</p>
            </div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStock}</p>
              <p className="text-zinc-500 text-xs">Stock total</p>
            </div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">${avgPrice}</p>
              <p className="text-zinc-500 text-xs">Precio promedio</p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No hay productos aún</p>
            <button onClick={openCreate} className="mt-4 text-violet-400 hover:text-violet-300 text-sm">
              + Agregar tu primer producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors group">
                {/* Image placeholder */}
                <div className="w-full h-32 bg-zinc-800/50 rounded-xl flex items-center justify-center mb-4 text-4xl">
                  {categoryEmoji[p.category || "General"] || "📦"}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold text-lg">{p.name}</h3>
                  {p.category && (
                    <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded-full">
                      {p.category}
                    </span>
                  )}
                </div>

                <p className="text-zinc-500 text-sm mb-3 line-clamp-2">{p.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-violet-400 font-bold text-xl">${p.price} <span className="text-xs font-normal text-zinc-500">USDC</span></span>
                  <span className="text-zinc-500 text-sm">Stock: {p.stock}</span>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex items-center justify-center gap-1 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editingId ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Precio (USDC)</label>
                  <input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Stock</label>
                  <input
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                    placeholder="0"
                    type="number"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none h-20"
                  placeholder="Descripción del producto"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">URL de imagen (opcional)</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-zinc-700 rounded-xl text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.price}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl text-white font-medium transition-colors"
              >
                {editingId ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
