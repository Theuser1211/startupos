"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, CreditCard, BarChart3, Activity, Sparkles, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalBlueprints: number;
  totalLogos: number;
  recentSignups: number;
  revenue: number;
}

interface RecentUser {
  id: string;
  email: string;
  display_name: string | null;
  plan: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized — admin access only");
        if (res.status === 403) throw new Error("Forbidden — you don't have admin permissions");
        throw new Error("Failed to load admin data");
      }
      const data = await res.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline" size="sm">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "from-blue-500 to-cyan-600" },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: "from-emerald-500 to-teal-600" },
    { label: "Blueprints Generated", value: stats?.totalBlueprints ?? 0, icon: BarChart3, color: "from-purple-500 to-indigo-600" },
    { label: "Logos Generated", value: stats?.totalLogos ?? 0, icon: Activity, color: "from-amber-500 to-orange-600" },
    { label: "Signups (30d)", value: stats?.recentSignups ?? 0, icon: TrendingUp, color: "from-pink-500 to-rose-600" },
    { label: "Revenue (MRR)", value: `₹${(stats?.revenue ?? 0).toLocaleString("en-IN")}`, icon: Sparkles, color: "from-primary to-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-bold">Startup<span className="text-primary">OS</span></span>
            </Link>
            <Badge variant="outline" className="text-[10px]">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-xs" onClick={fetchAdminData}>
              Refresh
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs">Exit Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mb-8">Platform overview and management</p>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.label} className="hover:border-primary/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-md`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border">
                        <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">User</th>
                        <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Plan</th>
                        <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Status</th>
                        <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-white">
                                {(user.display_name || user.email || "U").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-medium">{user.display_name || "Unnamed"}</p>
                                <p className="text-[10px] text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={user.plan === "pro" ? "default" : "outline"} className="text-[10px]">
                              {user.plan}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`text-[10px] ${user.status === "active" ? "text-emerald-400" : "text-muted-foreground"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-[10px] text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
