import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import artistDataJson from "./data/artists.json"; // Ensure this path matches where you saved artists.json

// Extract the artists array
const artistData = artistDataJson.artists;

export default function ArtistDashboard() {
  const [selectedArtistId, setSelectedArtistId] = useState(artistData[0].id);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const artist = artistData.find((a) => a.id === selectedArtistId);
  if (!artist) return <div>Artist not found</div>;

  // --- Data Formatting ---
  // --- Month Translations ---
  const monthTranslations: Record<string, { en: string; fr: string }> = {
    Jan: { en: "Jan", fr: "Janv" },
    Feb: { en: "Feb", fr: "Févr" },
    Mar: { en: "Mar", fr: "Mars" },
    Apr: { en: "Apr", fr: "Avr" },
    May: { en: "May", fr: "Mai" },
    Jun: { en: "Jun", fr: "Juin" },
    Jul: { en: "Jul", fr: "Juil" },
    Aug: { en: "Aug", fr: "Août" },
    Sep: { en: "Sep", fr: "Sept" },
    Oct: { en: "Oct", fr: "Oct" },
    Nov: { en: "Nov", fr: "Nov" },
    Dec: { en: "Dec", fr: "Déc" },
  };

  const listenerChartData = Object.entries(artist.listenersOverTime).map(
    ([dateStr, listeners], index) => {
      const [month, yearAbbr] = dateStr.split(" ");
      return {
        dateStr,
        month,
        year: `20${yearAbbr}`,
        listeners,
        isFirstPoint: index === 0,
      };
    },
  );

  // Calculate dynamic range for releases (X-7 to X)
  const activeYears = Object.entries(artist.releasesOverTime)
    .filter(([year, count]) => count > 0)
    .map(([year]) => parseInt(year));

  const maxYear =
    activeYears.length > 0
      ? Math.max(...activeYears)
      : new Date().getFullYear();
  const minYear = maxYear - 7;

  const releasesChartData = [];
  for (let y = minYear; y <= maxYear; y++) {
    releasesChartData.push({
      year: y.toString(),
      // The cast fixes TS(7053) by telling TS to treat this as a string-to-number dictionary
      releases:
        (artist.releasesOverTime as Record<string, number>)[y.toString()] || 0,
    });
  }

  // --- Utilities ---

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Custom X-Axis Tick for Listeners
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const dataPoint = listenerChartData.find(
      (d) => d.dateStr === payload.value,
    );
    if (!dataPoint) return null;

    const { month, year, isFirstPoint } = dataPoint;
    const showYear = month === "Jan" || isFirstPoint;

    // Translate the month based on the active language state
    const translatedMonth = monthTranslations[month]
      ? monthTranslations[month][lang]
      : month;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill={isDarkMode ? "#9ca3af" : "#6b7280"}
          fontSize={12}
        >
          {translatedMonth}
        </text>
        {showYear && (
          <text
            x={0}
            y={0}
            dy={36}
            textAnchor="middle"
            fill={isDarkMode ? "#e5e7eb" : "#374151"}
            fontSize={14}
            fontWeight="bold"
          >
            {year}
          </text>
        )}
      </g>
    );
  };

  // --- Styling Classes ---

  const theme = {
    bg: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    text: isDarkMode ? "text-gray-100" : "text-gray-900",
    cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
    cardBorder: isDarkMode ? "border-gray-700" : "border-gray-100",
    textMuted: isDarkMode ? "text-gray-400" : "text-gray-500",
    gridLine: isDarkMode ? "#374151" : "#f3f4f6",
    tooltipBg: isDarkMode ? "#1f2937" : "#ffffff",
    tooltipText: isDarkMode ? "#f3f4f6" : "#111827",
  };

  return (
    <div
      className={`min-h-screen p-6 font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header & Controls */}
        <header
          className={`flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b-2 ${theme.cardBorder}`}
        >
          <h1 className="text-3xl font-black uppercase tracking-wider">
            {artist.name}
          </h1>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg font-bold transition-colors ${isDarkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-200 text-gray-800"}`}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? "☀ Light" : "☾ Dark"}
            </button>

            {/* Language Toggle */}
            <div
              className={`flex rounded-lg p-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
            >
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-md text-sm font-bold ${lang === "en" ? (isDarkMode ? "bg-gray-600 text-white shadow" : "bg-white text-gray-900 shadow") : theme.textMuted}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("fr")}
                className={`px-3 py-1 rounded-md text-sm font-bold ${lang === "fr" ? (isDarkMode ? "bg-gray-600 text-white shadow" : "bg-white text-gray-900 shadow") : theme.textMuted}`}
              >
                FR
              </button>
            </div>

            {/* Artist Select */}
            <select
              className={`px-4 py-2 rounded-lg cursor-pointer font-medium border outline-none ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(e.target.value)}
            >
              {artistData.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Charts */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            {/* Listeners Line Chart */}
            <div
              className={`p-6 rounded-2xl shadow-sm border ${theme.cardBg} ${theme.cardBorder}`}
            >
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-bold">
                  {lang === "en" ? "Monthly Listeners" : "Auditeurs Mensuels"}
                </h2>
                <div className="text-right">
                  <p
                    className={`text-sm uppercase tracking-widest font-semibold ${theme.textMuted}`}
                  >
                    {lang === "en" ? "Current" : "Actuel"}
                  </p>
                  <p className="text-3xl font-black text-blue-500">
                    {artist.monthlyListeners.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={listenerChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={theme.gridLine}
                    />
                    <XAxis
                      dataKey="dateStr"
                      tick={<CustomXAxisTick />}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={formatNumber}
                      tick={{
                        fill: isDarkMode ? "#9ca3af" : "#6b7280",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.tooltipBg,
                        color: theme.tooltipText,
                        borderRadius: "8px",
                        border: "none",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="listeners"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      dot={false}
                      activeDot={{
                        r: 8,
                        fill: "#3b82f6",
                        stroke: theme.cardBg,
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Releases Bar Chart */}
            <div
              className={`p-6 rounded-2xl shadow-sm border ${theme.cardBg} ${theme.cardBorder}`}
            >
              <h2 className="text-xl font-bold mb-6">
                {lang === "en"
                  ? `Song Releases (${minYear}-${maxYear})`
                  : `Sorties de Chansons (${minYear}-${maxYear})`}
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={releasesChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={theme.gridLine}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{
                        fill: isDarkMode ? "#9ca3af" : "#6b7280",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: isDarkMode ? "#9ca3af" : "#6b7280",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? "#374151" : "#f3f4f6" }}
                      contentStyle={{
                        backgroundColor: theme.tooltipBg,
                        color: theme.tooltipText,
                        borderRadius: "8px",
                        border: "none",
                      }}
                    />
                    <Bar
                      dataKey="releases"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Profile & Info */}
          <div className="flex flex-col gap-6">
            {/* Profile Card */}
            <div
              className={`p-6 rounded-2xl shadow-sm border flex flex-col items-center text-center ${theme.cardBg} ${theme.cardBorder}`}
            >
              <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-gray-200 dark:border-gray-700">
                <img
                  src={artist.profilePicture}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3
                className={`text-lg font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}
              >
                {lang === "en" ? "About The Artist" : "À Propos de l'Artiste"}
              </h3>
              <p className="leading-relaxed">{artist.about[lang]}</p>
            </div>

            {/* Popular Songs Card */}
            <div
              className={`p-6 rounded-2xl shadow-sm border ${theme.cardBg} ${theme.cardBorder}`}
            >
              <h3 className="text-lg font-bold mb-4">
                {lang === "en" ? "Popular Songs" : "Chansons Populaires"}
              </h3>
              <div className="flex flex-col gap-4">
                {artist.popularSongs.map((song, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-shadow ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"}`}
                  >
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <p className="font-semibold">{song.title}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Popular Songs Card */}
            <div
              className={`p-6 rounded-2xl shadow-sm border ${theme.cardBg} ${theme.cardBorder}`}
            >
              <h3 className="text-lg font-bold mb-4">
                {lang === "en"
                  ? "Disclaimer: Data was generated using AI"
                  : "Avertissement : Les données ont été générées à l'aide de l'IA."}
              </h3>
              <div className="flex flex-col gap-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
