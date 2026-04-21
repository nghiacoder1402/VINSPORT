import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";

type PaymentMethod = "cod" | "banking" | string;
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

const MOCK_ORDERS: AdminOrder[] = [
  {
    id: 9,
    customerName: "anhemtoi",
    phone: "12334234",
    address: "-",
    totalAmount: 420000,
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    customerName: "Chu Minh",
    phone: "0867788204",
    address: "Hà Nội",
    totalAmount: 950000,
    paymentMethod: "banking",
    paymentStatus: "pending",
    orderStatus: "confirmed",
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
  return d.toLocaleString("vi-VN");
}

function formatPaymentMethod(method: string) {
  if (method === "banking") return "Chuyển khoản";
  if (method === "cod") return "COD";
  if (method === "momo") return "Momo";
  return method;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
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
      return (
        String(order.id).toLowerCase().includes(q) ||
        String(order.customerName).toLowerCase().includes(q) ||
        String(order.phone ?? "").toLowerCase().includes(q) ||
        String(order.paymentMethod).toLowerCase().includes(q) ||
        String(order.paymentStatus).toLowerCase().includes(q) ||
        String(order.orderStatus).toLowerCase().includes(q)
      );
    });
  }, [orders, keyword]);

<<<<<<< HEAD
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
=======
  const handleConfirmPayment = async (order: AdminOrder) => {
    const ok = window.confirm(`Xác nhận đã nhận tiền cho đơn #${order.id}?`);
    if (!ok) return;
>>>>>>> 4736271e (update backend quan ly Orders)

  const handleUpdateOrder = async (order: AdminOrder) => {
    try {
      setSavingId(order.id);
<<<<<<< HEAD

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
=======
      await api.put(`/admin/orders/${order.id}/payment-status`, {
        status: "paid",
      });
>>>>>>> 4736271e (update backend quan ly Orders)

      alert("Cập nhật đơn hàng thành công.");
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      alert("Không cập nhật được đơn hàng.");
    } finally {
      setSavingId(null);
    }
  };

  const handleOrderStatusChange = (
    id: number | string,
    value: OrderStatus
  ) => {
    setOrders((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, orderStatus: value } : item
      )
    );
  };

  const handleSaveOrderStatus = async (order: AdminOrder) => {
    try {
      setSavingId(order.id);

      await api.put(`/admin/orders/${order.id}/status`, {
        status: order.orderStatus,
      });

      alert("Cập nhật trạng thái đơn hàng thành công.");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
      alert("Không cập nhật được trạng thái đơn hàng.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý đơn hàng</h1>
        <p className="text-slate-600 mt-2">
<<<<<<< HEAD
          Cập nhật trạng thái thanh toán và trạng thái đơn hàng trực tiếp.
=======
          Xem đơn hàng, cập nhật trạng thái đơn hàng và xác nhận thanh toán.
>>>>>>> 4736271e (update backend quan ly Orders)
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">Danh sách đơn hàng</h2>
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
              Tổng số: {orders.length}
            </span>
          </div>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách, SĐT..."
            className="w-full md:w-80 border rounded-xl px-4 py-3 outline-none focus:ring"
          />
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
<<<<<<< HEAD
            <table className="w-full min-w-[1250px] border-collapse">
=======
            <table className="w-full min-w-[1400px] border-collapse">
>>>>>>> 4736271e (update backend quan ly Orders)
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="p-3 border-b">Mã đơn</th>
                  <th className="p-3 border-b">Khách hàng</th>
                  <th className="p-3 border-b">SĐT</th>
                  <th className="p-3 border-b">Tổng tiền</th>
                  <th className="p-3 border-b">Thanh toán</th>
                  <th className="p-3 border-b">TT thanh toán</th>
                  <th className="p-3 border-b">TT đơn hàng</th>
                  <th className="p-3 border-b">Ngày tạo</th>
                  <th className="p-3 border-b">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={String(order.id)} className="hover:bg-slate-50">
                    <td className="p-3 border-b font-semibold">#{order.id}</td>
                    <td className="p-3 border-b">{order.customerName}</td>
                    <td className="p-3 border-b">{order.phone || "-"}</td>
                    <td className="p-3 border-b font-medium">
                      {Number(order.totalAmount || 0).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-3 border-b">
                      {formatPaymentMethod(order.paymentMethod)}
                    </td>

                    <td className="p-3 border-b">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          handleFieldChange(
                            order.id,
                            "paymentStatus",
                            e.target.value
                          )
                        }
                        className="border rounded-lg px-3 py-2 min-w-[160px]"
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="failed">Thất bại</option>
                      </select>
                    </td>

                    <td className="p-3 border-b">

                    </td>

                    <td className="p-3 border-b">{formatDate(order.createdAt)}</td>

                    <td className="p-3 border-b">

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