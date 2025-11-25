import React, { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

// maData yanına bbData eklendi
export default function ResultChart({ data, trades, maData, bbData }) {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (!chartContainerRef.current) return;

    // 1. Ana Grafik
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#1e1e1e" },
        textColor: "#d1d4dc",
      },
      width: chartContainerRef.current.clientWidth || 800,
      height: 400,
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeries.setData(data);

    // 2. SMA Çizgisi
    if (maData && maData.length > 0) {
      const lineSeries = chart.addLineSeries({
        color: "#FFA500",
        lineWidth: 2,
        title: "Hareketli Ort.",
      });
      lineSeries.setData(maData);
    }

    // 3. YENİ: Bollinger Bantları
    if (bbData && bbData.length > 0) {
      // Üst Bant
      const upperSeries = chart.addLineSeries({
        color: "#2962FF",
        lineWidth: 1,
        title: "BB Üst",
      });
      upperSeries.setData(
        bbData.map((d) => ({ time: d.time, value: d.upper }))
      );

      // Alt Bant
      const lowerSeries = chart.addLineSeries({
        color: "#2962FF",
        lineWidth: 1,
        title: "BB Alt",
      });
      lowerSeries.setData(
        bbData.map((d) => ({ time: d.time, value: d.lower }))
      );
    }

    // 4. Oklar
    const availableTimes = new Set(data.map((d) => d.time));
    const markers = [];
    trades.forEach((trade) => {
      if (availableTimes.has(trade.time)) {
        markers.push({
          time: trade.time,
          position: trade.type === "buy" ? "belowBar" : "aboveBar",
          color: trade.type === "buy" ? "#00ff88" : "#ff4444",
          shape: trade.type === "buy" ? "arrowUp" : "arrowDown",
          text: trade.type === "buy" ? "AL" : "SAT",
          size: 1,
        });
      }
    });
    markers.sort((a, b) => a.time - b.time);
    candlestickSeries.setMarkers(markers);

    // 5. Fit
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, trades, maData, bbData]); // bbData dependency eklendi

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: "100%",
        height: "400px",
        border: "1px solid #333",
        marginTop: "20px",
        position: "relative",
      }}
    />
  );
}
