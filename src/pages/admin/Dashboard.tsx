import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, FileText, Users, Eye, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  totalNovels: number;
  totalChapters: number;
  totalUsers: number;
  totalViews: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalNovels: 0,
    totalChapters: 0,
    totalUsers: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  // Sample data for chart - in production, this would come from the database
  const chartData = [
    { name: "Sen", views: 400 },
    { name: "Sel", views: 300 },
    { name: "Rab", views: 500 },
    { name: "Kam", views: 280 },
    { name: "Jum", views: 590 },
    { name: "Sab", views: 800 },
    { name: "Min", views: 700 },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch novel count
      const { count: novelCount } = await supabase
        .from("novels")
        .select("*", { count: "exact", head: true });

      // Fetch chapter count
      const { count: chapterCount } = await supabase
        .from("chapters")
        .select("*", { count: "exact", head: true });

      // Fetch user count
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch total views
      const { data: viewsData } = await supabase
        .from("novels")
        .select("views");

      const totalViews = viewsData?.reduce((sum, novel) => sum + (novel.views || 0), 0) || 0;

      setStats({
        totalNovels: novelCount || 0,
        totalChapters: chapterCount || 0,
        totalUsers: userCount || 0,
        totalViews,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview statistik website NovelVerse</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Novel"
          value={stats.totalNovels}
          description="Novel yang tersedia"
          icon={BookText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Chapter"
          value={stats.totalChapters}
          description="Chapter yang dipublish"
          icon={FileText}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="User terdaftar"
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          description="Total pembaca"
          icon={Eye}
          trend={{ value: 20, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Views Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Novel Terpopuler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Memuat data...</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Belum ada novel. Tambahkan novel pertama Anda!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
