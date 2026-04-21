import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";

type Product = {
  id?: number | string;
  name: string;
  description?: string;
  price: number | string;
  category?: string;
  brand?: string;
  image?: string;
  stock?: number | string;
  sizes?: string[] | string;
};

const emptyForm: Product = {
  name: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  image: "",
  stock: "",
  sizes: [],
};

function toArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (
    typeof data === "object" &&
    data !== null &&
    "products" in data &&
    Array.isArray((data as any).products)
  ) {
    return (data as any).products;
  }
  if (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    Array.isArray((data as any).data)
  ) {
    return (data as any).data;
  }
  return [];
}

function normalizeProduct(item: any): Product {
  return {
    id: item?.id,
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price ?? "",
    category: item?.category || "",
    brand: item?.brand || "",
    image: item?.image || item?.images?.[0] || "",
    stock: item?.stock ?? "",
    sizes: Array.isArray(item?.sizes)
      ? item.sizes
      : typeof item?.sizes === "string" && item.sizes.trim() !== ""
      ? item.sizes.split(",").map((s: string) => s.trim())
      : [],
  };
}

async function getProducts(): Promise<Product[]> {
  try {
    const data = await api.get("/admin/products");
    return toArray(data).map(normalizeProduct);
  } catch {
    const data = await api.get("/products");
    return toArray(data).map(normalizeProduct);
  }
}

async function createProduct(payload: Product) {
  try {
    return await api.post("/admin/products", payload);
  } catch {
    return await api.post("/products", payload);
  }
}

async function updateProduct(id: number | string, payload: Product) {
  try {
    return await api.put(`/admin/products/${id}`, payload);
  } catch {
    return await api.put(`/products/${id}`, payload);
  }
}

async function deleteProduct(id: number | string) {
  try {
    return await api.delete(`/admin/products/${id}`);
  } catch {
    return await api.delete(`/products/${id}`);
  }
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState<Product>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const list = await getProducts();
      setProducts(list);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      alert("Không tải được danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      return (
        String(p.id ?? "").toLowerCase().includes(q) ||
        String(p.name ?? "").toLowerCase().includes(q) ||
        String(p.brand ?? "").toLowerCase().includes(q) ||
        String(p.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, keyword]);

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "sizes") {
      setForm((prev) => ({
        ...prev,
        sizes: value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setEditingId(product.id ?? null);
    setForm({
      ...product,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name?.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      alert("Giá sản phẩm không hợp lệ.");
      return;
    }

    const payload: Product = {
      ...form,
      price: Number(form.price),
      stock: form.stock === "" ? 0 : Number(form.stock),
      sizes: Array.isArray(form.sizes) ? form.sizes : [],
    };

    try {
      setIsSaving(true);

      if (isEditing && editingId !== null) {
        await updateProduct(editingId, payload);
        alert("Cập nhật sản phẩm thành công.");
      } else {
        await createProduct(payload);
        alert("Thêm sản phẩm thành công.");
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      alert("Không lưu được sản phẩm. Kiểm tra lại backend.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number | string | undefined) => {
    if (id === undefined || id === null) return;

    const ok = window.confirm("Bạn có chắc muốn xóa sản phẩm này không?");
    if (!ok) return;

    try {
      await deleteProduct(id);
      alert("Xóa sản phẩm thành công.");
      await loadProducts();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Không xóa được sản phẩm.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý sản phẩm</h1>
        <p className="text-slate-600 mt-2">
          Thêm, sửa, xóa sản phẩm ngay trên trang admin.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border hover:bg-slate-50"
            >
              Hủy sửa
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên sản phẩm
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Giá</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Nhập giá"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <input
              name="category"
              value={form.category || ""}
              onChange={handleChange}
              placeholder="Ví dụ: Áo, Quần, Giày"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Thương hiệu
            </label>
            <input
              name="brand"
              value={form.brand || ""}
              onChange={handleChange}
              placeholder="Ví dụ: Nike, Adidas"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Ảnh sản phẩm
            </label>
            <input
              name="image"
              value={form.image || ""}
              onChange={handleChange}
              placeholder="Dán link ảnh"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tồn kho</label>
            <input
              name="stock"
              type="number"
              value={form.stock ?? ""}
              onChange={handleChange}
              placeholder="Số lượng tồn kho"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Kích thước</label>
            <input
              name="sizes"
              value={Array.isArray(form.sizes) ? form.sizes.join(", ") : ""}
              onChange={handleChange}
              placeholder="Ví dụ: S, M, L, XL"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              rows={4}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {isSaving
                ? "Đang lưu..."
                : isEditing
                ? "Cập nhật sản phẩm"
                : "Thêm sản phẩm"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3 rounded-xl border font-semibold hover:bg-slate-50"
            >
              Làm mới form
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
              Tổng số: {products.length}
            </span>
          </div>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên, hãng, danh mục..."
            className="w-full md:w-80 border rounded-xl px-4 py-3 outline-none focus:ring"
          />
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-slate-500">
            Đang tải sản phẩm...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            Không có sản phẩm nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Ảnh</th>
                  <th className="p-3 border-b">Tên</th>
                  <th className="p-3 border-b">Giá</th>
                  <th className="p-3 border-b">Danh mục</th>
                  <th className="p-3 border-b">Hãng</th>
                  <th className="p-3 border-b">Tồn kho</th>
                  <th className="p-3 border-b">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={String(product.id)} className="hover:bg-slate-50">
                    <td className="p-3 border-b">{product.id}</td>

                    <td className="p-3 border-b">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg border flex items-center justify-center text-xs text-slate-400">
                          No image
                        </div>
                      )}
                    </td>

                    <td className="p-3 border-b font-medium">{product.name}</td>
                    <td className="p-3 border-b">
                      {Number(product.price || 0).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-3 border-b">{product.category || "-"}</td>
                    <td className="p-3 border-b">{product.brand || "-"}</td>
                    <td className="p-3 border-b">{product.stock ?? 0}</td>

                    <td className="p-3 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}