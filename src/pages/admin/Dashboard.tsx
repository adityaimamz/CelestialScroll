import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, FileText, Users, Eye, TrendingUp, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { subDays, format, startOfDay } from "date-fns";
import { id } from "date-fns/locale";

interface Stats {
  totalNovels: number;
  totalChapters: number;
  totalUsers: number;
  totalViews: number;
}

interface ChartData {
  name: string;
  views: number;
  date: string;
}

interface PopularNovel {
  id: string;
  title: string;
  cover_url: string | null;
  views: number;
  rating: number | null;
  slug: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalNovels: 0,
    totalChapters: 0,
    totalUsers: 0,
    totalViews: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [popularNovels, setPopularNovels] = useState<PopularNovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchChartData(),
      fetchPopularNovels()
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const { count: novelCount } = await supabase.from("novels").select("*", { count: "exact", head: true });
      const { count: chapterCount } = await supabase.from("chapters").select("*", { count: "exact", head: true });
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });

      const { data: novels } = await supabase.from("novels").select("views");
      const totalViews = novels?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

      setStats({
        totalNovels: novelCount || 0,
        totalChapters: chapterCount || 0,
        totalUsers: userCount || 0,
        totalViews,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 6); // Last 7 days

      const { data: history } = await supabase
        .from("reading_history")
        .select("read_at")
        .gte("read_at", startOfDay(startDate).toISOString());

      // Initialize last 7 days with 0 views
      const dailyViews = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const date = subDays(endDate, i);
        const dateStr = format(date, "yyyy-MM-dd");
        dailyViews.set(dateStr, 0);
      }

      // Count actual views
      history?.forEach((entry) => {
        const dateStr = format(new Date(entry.read_at), "yyyy-MM-dd");
        if (dailyViews.has(dateStr)) {
          dailyViews.set(dateStr, (dailyViews.get(dateStr) || 0) + 1);
        }
      });

      // Convert to array and sort by date ascending
      const chartDataArray = Array.from(dailyViews.entries())
        .map(([date, views]) => ({
          name: format(new Date(date), "EEE", { locale: id }), // Mon, Tue, etc. in ID
          views,
          date
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setChartData(chartDataArray);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchPopularNovels = async () => {
    try {
      const { data } = await supabase
        .from("novels")
        .select("id, title, cover_url, views, rating, slug")
        .order("views", { ascending: false })
        .limit(5);

      if (data) {
        setPopularNovels(data);
      }
    } catch (error) {
      console.error("Error fetching popular novels:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <span className="text-xl font-bold text-foreground hidden sm:block">
          Celestial<span className="text-primary">Scrolls</span>
        </span>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Novel"
          value={stats.totalNovels}
          description="Novel yang tersedia"
          icon={BookText}
        />
        <StatsCard
          title="Total Chapter"
          value={stats.totalChapters}
          description="Chapter yang dipublish"
          icon={FileText}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="User terdaftar"
          icon={Users}
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          description="Total pembaca"
          icon={Eye}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Views Mingguan (7 Hari Terakhir)
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
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
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
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-12 h-16 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!loading && popularNovels.length > 0 && (
                <div className="flex flex-col gap-4">
                  {popularNovels.map((novel, index) => (
                    <Link
                      key={novel.id}
                      to={`/series/${novel.slug}`}
                      className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden border border-border">
                        <img
                          src={novel.cover_url || "/placeholder.jpg"}
                          alt={novel.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] px-1 font-bold">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1 text-foreground">{novel.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {novel.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            {novel.rating?.toFixed(1) || "-"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!loading && popularNovels.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Belum ada novel yang tersedia.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
