import React, { useEffect, useState } from "react";
import api from "../api/api";

type UserItem = {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: "admin" | "user";
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.get("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải user:", error);
      alert("Không tải được danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = (id: number | string, role: "admin" | "user") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  };

  const handleSaveRole = async (user: UserItem) => {
    try {
      setSavingId(user.id);
      await api.put(`/admin/users/${user.id}/role`, { role: user.role });
      alert("Cập nhật role thành công");
    } catch (error: any) {
      console.error("Lỗi cập nhật role:", error);
      alert(error?.response?.data?.message || "Không cập nhật được role");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý người dùng</h1>
        <p className="text-slate-600 mt-2">
          Chỉ admin mới có quyền thay đổi vai trò tài khoản.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Đang tải người dùng...</div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-slate-500">Không có người dùng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Tên</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">SĐT</th>
                  <th className="p-3 border-b">Địa chỉ</th>
                  <th className="p-3 border-b">Role</th>
                  <th className="p-3 border-b">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={String(user.id)} className="hover:bg-slate-50">
                    <td className="p-3 border-b">{user.id}</td>
                    <td className="p-3 border-b">{user.name}</td>
                    <td className="p-3 border-b">{user.email}</td>
                    <td className="p-3 border-b">{user.phone || "-"}</td>
                    <td className="p-3 border-b">{user.address || "-"}</td>
                    <td className="p-3 border-b">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value as "admin" | "user"
                          )
                        }
                        className="border rounded-lg px-3 py-2"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-3 border-b">
                      <button
                        onClick={() => handleSaveRole(user)}
                        disabled={savingId === user.id}
                        className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
                      >
                        {savingId === user.id ? "Đang lưu..." : "Cập nhật"}
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