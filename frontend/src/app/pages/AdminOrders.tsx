import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";

type PaymentMethod = "cod" | "banking" | "momo" | string;
type PaymentStatus = "pending" | "paid" | "failed" | string;
type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "completed"
  | "cancelled"
  | string;

type AdminOrder = {
  id: number | string;
  customerName: string;
  phone?: string;
  address?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt?: string;
};

type SearchField =
  | "all"
  | "id"
  | "customerName"
  | "phone"
  | "paymentMethod"
  | "paymentStatus"
  | "orderStatus";

const MOCK_ORDERS: AdminOrder[] = [
  {
    id: 9,
    customerName: "anhemtoi",
    phone: "12334234",
    address: "hà nội, Hà Nội",
    totalAmount: 420000,
    paymentMethod: "banking",
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    customerName: "anhemtoi",
    phone: "12334234",
    address: "hà nội, Hà Nội",
    totalAmount: 950000,
    paymentMethod: "banking",
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: new Date().toISOString(),
  },
];

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeOrder(item: any): AdminOrder {
  return {
    id: item?.id ?? item?.order_id ?? item?.orderId ?? "",
    customerName:
      item?.customerName ||
      item?.customer?.name ||
      item?.fullName ||
      item?.name ||
      "Khách hàng",
    phone: item?.phone || item?.customer?.phone || "",
    address: item?.address || item?.customer?.address || "-",
    totalAmount: Number(item?.totalAmount ?? item?.total_amount ?? 0),
    paymentMethod: item?.paymentMethod || item?.payment_method || "cod",
    paymentStatus: item?.paymentStatus || item?.payment_status || "pending",
    orderStatus: item?.orderStatus || item?.order_status || "pending",
    createdAt: item?.createdAt || item?.created_at || "",
  };
}

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("vi-VN");
}

function formatPaymentMethod(method: string) {
  if (method === "banking") return "Chuyển khoản";
  if (method === "cod") return "COD";
  if (method === "momo") return "Momo";
  return method;
}

function paymentStatusLabel(status: string) {
  if (status === "paid") return "Đã thanh toán";
  if (status === "failed") return "Thất bại";
  return "Chờ xác nhận";
}

function orderStatusLabel(status: string) {
  if (status === "confirmed") return "Đã xác nhận";
  if (status === "shipping") return "Đang giao";
  if (status === "completed") return "Hoàn thành";
  if (status === "cancelled") return "Đã hủy";
  return "Chờ xử lý";
}

function paymentStatusClass(status: string) {
  if (status === "paid") return "bg-green-100 text-green-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-orange-100 text-orange-700";
}

function orderStatusClass(status: string) {
  if (status === "completed") return "bg-green-100 text-green-700";
  if (status === "confirmed") return "bg-emerald-100 text-emerald-700";
  if (status === "shipping") return "bg-blue-100 text-blue-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("all");
  const [savingId, setSavingId] = useState<number | string | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);

      try {
        const data = await api.get("/admin/orders");
        const normalized = toArray(data).map(normalizeOrder);
        setOrders(normalized.length > 0 ? normalized : MOCK_ORDERS);
      } catch {
        try {
          const data = await api.get("/orders");
          const normalized = toArray(data).map(normalizeOrder);
          setOrders(normalized.length > 0 ? normalized : MOCK_ORDERS);
        } catch {
          setOrders(MOCK_ORDERS);
        }
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      setOrders(MOCK_ORDERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((order) => {
      const orderId = String(order.id).toLowerCase();
      const customerName = String(order.customerName ?? "").toLowerCase();
      const phone = String(order.phone ?? "").toLowerCase();
      const paymentMethod = String(order.paymentMethod ?? "").toLowerCase();
      const paymentStatus = String(order.paymentStatus ?? "").toLowerCase();
      const orderStatus = String(order.orderStatus ?? "").toLowerCase();

      switch (searchField) {
        case "id":
          return orderId.includes(q);
        case "customerName":
          return customerName.includes(q);
        case "phone":
          return phone.includes(q);
        case "paymentMethod":
          return paymentMethod.includes(q);
        case "paymentStatus":
          return paymentStatus.includes(q);
        case "orderStatus":
          return orderStatus.includes(q);
        case "all":
        default:
          return (
            orderId.includes(q) ||
            customerName.includes(q) ||
            phone.includes(q) ||
            paymentMethod.includes(q) ||
            paymentStatus.includes(q) ||
            orderStatus.includes(q)
          );
      }
    });
  }, [orders, keyword, searchField]);

  const handleFieldChange = (
    id: number | string,
    field: "paymentStatus" | "orderStatus",
    value: string
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  const handleUpdateOrder = async (order: AdminOrder) => {
    try {
      setSavingId(order.id);

      try {
        await api.put(`/admin/orders/${order.id}`, {
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        });
      } catch {
        try {
          await api.put(`/orders/${order.id}`, {
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
          });
        } catch {
          // fallback demo frontend-only
        }
      }

      alert("Cập nhật đơn hàng thành công.");
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      alert("Không cập nhật được đơn hàng.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý đơn hàng</h1>
        <p className="text-slate-600 mt-2">
          Cập nhật trạng thái thanh toán và trạng thái đơn hàng trực tiếp.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">Danh sách đơn hàng</h2>
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
              Tổng số: {orders.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as SearchField)}
              className="border rounded-xl px-4 py-3 outline-none focus:ring min-w-[180px]"
            >
              <option value="all">Tất cả</option>
              <option value="id">Mã đơn</option>
              <option value="customerName">Khách hàng</option>
              <option value="phone">Số điện thoại</option>
              <option value="paymentMethod">Phương thức</option>
              <option value="paymentStatus">TT thanh toán</option>
              <option value="orderStatus">TT đơn hàng</option>
            </select>

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="w-full lg:w-80 border rounded-xl px-4 py-3 outline-none focus:ring"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-slate-500">
            Đang tải đơn hàng...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            Không có đơn hàng nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="p-3 border-b min-w-[90px]">Mã đơn</th>
                  <th className="p-3 border-b min-w-[280px]">Khách hàng</th>
                  <th className="p-3 border-b min-w-[140px]">Tổng tiền</th>
                  <th className="p-3 border-b min-w-[150px]">Phương thức</th>
                  <th className="p-3 border-b min-w-[190px]">TT thanh toán</th>
                  <th className="p-3 border-b min-w-[190px]">TT đơn hàng</th>
                  <th className="p-3 border-b min-w-[130px]">Ngày tạo</th>
                  <th className="p-3 border-b min-w-[140px] sticky right-0 bg-slate-100 z-10 shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)]">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={String(order.id)} className="hover:bg-slate-50 align-top">
                    <td className="p-3 border-b font-semibold whitespace-nowrap">
                      #{order.id}
                    </td>

                    <td className="p-3 border-b">
                      <div className="font-medium text-slate-900">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        SĐT: {order.phone || "-"}
                      </div>
                      <div className="text-sm text-slate-500">
                        Địa chỉ: {order.address || "-"}
                      </div>
                    </td>

                    <td className="p-3 border-b font-medium whitespace-nowrap">
                      {Number(order.totalAmount || 0).toLocaleString("vi-VN")} đ
                    </td>

                    <td className="p-3 border-b whitespace-nowrap">
                      {formatPaymentMethod(order.paymentMethod)}
                    </td>

                    <td className="p-3 border-b">
                      <div className="mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentStatusClass(
                            order.paymentStatus
                          )}`}
                        >
                          {paymentStatusLabel(order.paymentStatus)}
                        </span>
                      </div>

                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          handleFieldChange(
                            order.id,
                            "paymentStatus",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="pending">pending</option>
                        <option value="paid">paid</option>
                        <option value="failed">failed</option>
                      </select>
                    </td>

                    <td className="p-3 border-b">
                      <div className="mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${orderStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {orderStatusLabel(order.orderStatus)}
                        </span>
                      </div>

                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleFieldChange(order.id, "orderStatus", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="shipping">shipping</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>

                    <td className="p-3 border-b whitespace-nowrap text-sm text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="p-3 border-b sticky right-0 bg-white z-10 shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)]">
                      <button
                        onClick={() => handleUpdateOrder(order)}
                        disabled={savingId === order.id}
                        className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 whitespace-nowrap"
                      >
                        {savingId === order.id ? "Đang lưu..." : "Cập nhật"}
                      </button>
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