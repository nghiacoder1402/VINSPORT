import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Check, Truck, Shield, RotateCcw, ChevronLeft, Minus, Plus, Loader2 } from "lucide-react";
import api from "../api/api";
import { MOCK_PRODUCTS, formatPrice } from "../data/mockData";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setIsLoading(true);
        const data: any = await api.get(`/products/${id}`);
        console.log(`%c✅ DETAIL: PRODUCT ${id} LOADED`, "color: green; font-weight: bold;");
        setProduct(data);
        setMainImage(data.images?.[0] || data.image);
        setSelectedSize(data.sizes?.[0] || "");
        setSelectedColor(data.colors?.[0]?.name || "");
      } catch (error) {
        console.error(`%c❌ DETAIL: FAILED TO LOAD PRODUCT ${id}`, "color: red; font-weight: bold;");
        if ((import.meta as any).env?.VITE_USE_MOCK === "true") {
          const fallback = MOCK_PRODUCTS.find(p => p.id === id);
          setProduct(fallback);
          if (fallback) {
            setMainImage(fallback.image);
            setSelectedSize(fallback.sizes[0]);
            setSelectedColor(fallback.colors?.[0]?.name || "");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  if (isLoading) return (<div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-orange-600 w-12 h-12 mb-4" /><p className="text-slate-500 font-medium">Đang tải chi tiết sản phẩm...</p></div>);
  if (!product) return (<div className="container mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2><button onClick={() => navigate("/products")} className="text-orange-600 hover:underline">Quay lại danh sách</button></div>);

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Tuỳ thuộc vào luồng của nhóm, có thể chuyển hướng sang trang đăng nhập
      alert("Vui lòng đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }
    
    // Đóng gói thông tin sản phẩm kèm size, màu và số lượng
    const itemToAdd = {
      ...product,
      selectedSize,
      selectedColor
    };
    
    addToCart(product, selectedSize, selectedColor, quantity);
    
    // Hiệu ứng "Đã thêm" trong 2 giây
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-6 font-medium"><ChevronLeft className="w-5 h-5" /> Quay lại</button>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:p-8 flex flex-col gap-4">
            <div className="aspect-square bg-slate-50 rounded-2xl relative overflow-hidden flex-grow"><img src={mainImage || product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" /></div>
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setMainImage(img)} className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? "border-orange-600 opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
                ))}
              </div>
            )}
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-2 text-sm font-bold text-slate-400 uppercase tracking-widest">{product.brand}</div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{product.name}</h1>
            <div className="flex items-end gap-4 mb-6"><span className="text-3xl font-bold text-orange-600">{formatPrice(product.price)}</span></div>
            <p className="text-slate-600 mb-8 leading-relaxed">{product.description}</p>
            
            {/* --- PHẦN CHỌN MÀU SẮC --- */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Màu sắc: {selectedColor}</h3>
                <div className="flex items-center gap-3">
                  {product.colors.map((color: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all ${
                        selectedColor === color.name ? "border-orange-600 ring-2 ring-offset-2 ring-orange-100" : "border-slate-200"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* --- PHẦN CHỌN KÍCH CỠ --- */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Kích cỡ (Size):</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 min-w-[3rem] text-sm font-medium rounded-lg border transition-all ${
                        selectedSize === size
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:border-orange-600 hover:text-orange-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- PHẦN CHỌN SỐ LƯỢNG & NÚT MUA HÀNG --- */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mt-4 mb-8">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 w-full sm:w-auto justify-between">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-orange-600 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-orange-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-grow w-full flex items-center justify-center gap-2 py-3 px-8 rounded-lg font-bold text-lg transition-all ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-6 h-6" /> Đã thêm vào giỏ
                  </>
                ) : (
                  "Thêm vào giỏ hàng"
                )}
              </button>
            </div>

            {/* --- THÔNG TIN CAM KẾT (Tùy chọn hiển thị) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Truck className="w-5 h-5 text-orange-500" />
                Giao hàng miễn phí
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Shield className="w-5 h-5 text-orange-500" />
                Bảo hành chính hãng 1 năm
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                Đổi trả trong vòng 30 ngày
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};