import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import axios from "axios";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
} from "@xyflow/react";
import { Editor } from "@monaco-editor/react";
import { createChart, ColorType } from "lightweight-charts";
import "@xyflow/react/dist/style.css";

// --- STYLES ---
const nodeStyle = {
  background: "#1e1e1e",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "8px",
  minWidth: "180px",
  boxShadow: "0 8px 16px rgba(0,0,0,0.6)",
  fontFamily: "Segoe UI, sans-serif",
  fontSize: "12px",
  display: "flex",
  flexDirection: "column",
  textAlign: "center",
  transition: "all 0.2s ease",
};
const headerStyle = {
  padding: "8px 0",
  fontWeight: "bold",
  color: "#fff",
  borderBottom: "1px solid #333",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
  width: "100%",
  borderTopLeftRadius: "7px",
  borderTopRightRadius: "7px",
};
const bodyStyle = {
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  background: "#252526",
  flexGrow: 1,
  alignItems: "center",
  borderBottomLeftRadius: "7px",
  borderBottomRightRadius: "7px",
};
const labelStyle = {
  color: "#aaa",
  marginBottom: "4px",
  display: "block",
  fontSize: "11px",
  fontWeight: "500",
  textAlign: "center",
  width: "100%",
};
const inputClass = "nodrag";
const inputStyle = {
  width: "90%",
  margin: "0 auto",
  background: "#111",
  border: "1px solid #444",
  color: "#eee",
  padding: "6px",
  borderRadius: "4px",
  fontSize: "12px",
  outline: "none",
  textAlign: "center",
  transition: "border 0.2s",
  display: "block",
};
const handleStyle = {
  width: 12,
  height: 12,
  background: "#fff",
  border: "2px solid #555",
  zIndex: 150,
  transition: "background 0.2s",
};

// --- LOADING SCREEN ---
const LoadingScreen = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.85)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "#00ff88",
    }}
  >
    <div className="spinner" style={{ marginBottom: 20, fontSize: "40px" }}>
      ⚙️
    </div>
    <h2 style={{ fontFamily: "Segoe UI" }}>Analiz Yapılıyor...</h2>
    <p style={{ color: "#aaa" }}>Geçmiş veriler taranıyor.</p>
  </div>
);

const Tooltip = ({ data, position }) => {
  if (!data) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: position.y + 15,
        left: position.x + 20,
        background: "rgba(20, 20, 20, 0.95)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        pointerEvents: "none",
        zIndex: 99999,
        border: "1px solid #666",
        boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
        maxWidth: "260px",
        lineHeight: "1.4",
      }}
    >
      {data}
    </div>
  );
};

// --- NODE COMPONENT ---
const UniversalNode = ({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();
  const onChange = (field, value) => {
    let newValue = value;
    if (!isNaN(Number(value)) && value.trim() !== "") newValue = Number(value);
    if (data.nodeType === "custom_indicator" || data.nodeType === "custom") {
      const currentParams = data.customParams || {};
      updateNodeData(id, {
        customParams: { ...currentParams, [field]: newValue },
      });
    } else {
      updateNodeData(id, { [field]: newValue });
    }
  };

  let headerColor = "linear-gradient(to right, #444, #333)";
  if (data.label.includes("RSI"))
    headerColor = "linear-gradient(to right, #2c3e50, #4ca1af)";
  else if (data.label.includes("Hareketli"))
    headerColor = "linear-gradient(to right, #e65c00, #F9D423)";
  else if (data.label.includes("MACD"))
    headerColor = "linear-gradient(to right, #11998e, #38ef7d)";
  else if (data.label.includes("Bollinger"))
    headerColor = "linear-gradient(to right, #8E2DE2, #4A00E0)";
  else if (data.label.includes("SuperTrend"))
    headerColor = "linear-gradient(to right, #FF416C, #FF4B2B)";
  else if (data.label.includes("Stochastic"))
    headerColor = "linear-gradient(to right, #cc2b5e, #753a88)";
  else if (data.label.includes("VE "))
    headerColor = "linear-gradient(to right, #000428, #004e92)";
  else if (data.label.includes("VEYA"))
    headerColor = "linear-gradient(to right, #D31027, #EA384D)";
  else if (data.label.includes("AL Emri"))
    headerColor = "linear-gradient(to right, #134E5E, #71B280)";
  else if (data.label.includes("SAT Emri"))
    headerColor = "linear-gradient(to right, #751717, #eb3349)";
  else if (data.label.includes("Özel Strateji"))
    headerColor = "linear-gradient(to right, #C02425, #F0CB35)";
  else if (data.nodeType === "custom_indicator")
    headerColor = "linear-gradient(to right, #614385, #516395)";

  const isCustom = data.nodeType === "custom";

  return (
    <div
      style={{
        ...nodeStyle,
        borderColor: selected ? "#00ff88" : "#555",
        boxShadow: selected
          ? "0 0 15px rgba(0, 255, 136, 0.4)"
          : "0 8px 16px rgba(0,0,0,0.6)",
        transform: selected ? "scale(1.02)" : "scale(1)",
        zIndex: selected ? 100 : 1,
      }}
    >
      <div style={{ ...headerStyle, background: headerColor }}>
        <span>{data.label}</span>
      </div>
      {data.nodeType !== "input" && !isCustom && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, top: -7 }}
          isConnectable={true}
        />
      )}
      <div style={bodyStyle}>
        {(data.nodeType === "custom_indicator" || data.nodeType === "custom") &&
          data.customParams &&
          Object.entries(data.customParams).map(([key, val]) => (
            <div key={key} style={{ width: "100%" }}>
              <span style={labelStyle}>{key}</span>
              <input
                className={inputClass}
                type="number"
                value={val}
                onChange={(e) => onChange(key, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        {data.label.includes("RSI") && (
          <>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Periyot</span>
              <input
                className={inputClass}
                type="number"
                value={data.period}
                onChange={(e) => onChange("period", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>Yön</span>
                <select
                  className={inputClass}
                  value={data.entryOp}
                  onChange={(e) => onChange("entryOp", e.target.value)}
                  style={inputStyle}
                >
                  <option value="<">{"<"}</option>
                  <option value=">">{">"}</option>
                  <option value="<=">{"<="}</option>
                  <option value=">=">{">="}</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>Eşik</span>
                <input
                  className={inputClass}
                  type="number"
                  value={data.oversold}
                  onChange={(e) => onChange("oversold", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}
        {data.label.includes("Hareketli") && (
          <>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Periyot</span>
              <input
                className={inputClass}
                type="number"
                value={data.period}
                onChange={(e) => onChange("period", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Tip</span>
              <select
                className={inputClass}
                value={data.maType}
                onChange={(e) => onChange("maType", e.target.value)}
                style={inputStyle}
              >
                <option value="SMA">SMA</option>
                <option value="EMA">EMA</option>
              </select>
            </div>
          </>
        )}
        {data.label.includes("SuperTrend") && (
          <>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Periyot</span>
              <input
                className={inputClass}
                type="number"
                value={data.period}
                onChange={(e) => onChange("period", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Multiplier</span>
              <input
                className={inputClass}
                type="number"
                value={data.multiplier}
                step="0.1"
                onChange={(e) => onChange("multiplier", e.target.value)}
                style={inputStyle}
              />
            </div>
          </>
        )}
        {data.label.includes("Bollinger") && (
          <>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Periyot</span>
              <input
                className={inputClass}
                type="number"
                value={data.period}
                onChange={(e) => onChange("period", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Std Dev</span>
              <input
                className={inputClass}
                type="number"
                value={data.std}
                step="0.1"
                onChange={(e) => onChange("std", e.target.value)}
                style={inputStyle}
              />
            </div>
          </>
        )}
        {data.label.includes("Stochastic") && (
          <>
            <div
              style={{
                display: "flex",
                gap: "5px",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <div>
                <span style={labelStyle}>K</span>
                <input
                  className={inputClass}
                  type="number"
                  value={data.stoch_k}
                  onChange={(e) => onChange("stoch_k", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <span style={labelStyle}>D</span>
                <input
                  className={inputClass}
                  type="number"
                  value={data.stoch_d}
                  onChange={(e) => onChange("stoch_d", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "5px",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <div>
                <span style={labelStyle}>Alt</span>
                <input
                  className={inputClass}
                  type="number"
                  value={data.stoch_oversold}
                  onChange={(e) => onChange("stoch_oversold", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <span style={labelStyle}>Üst</span>
                <input
                  className={inputClass}
                  type="number"
                  value={data.stoch_overbought}
                  onChange={(e) => onChange("stoch_overbought", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}
        {data.label.includes("MACD") && (
          <div
            style={{
              display: "flex",
              gap: "5px",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <div>
              <span style={labelStyle}>Fast</span>
              <input
                className={inputClass}
                type="number"
                value={data.fast}
                onChange={(e) => onChange("fast", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <span style={labelStyle}>Slow</span>
              <input
                className={inputClass}
                type="number"
                value={data.slow}
                onChange={(e) => onChange("slow", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <span style={labelStyle}>Sig</span>
              <input
                className={inputClass}
                type="number"
                value={data.signal}
                onChange={(e) => onChange("signal", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        )}
        {data.label.includes("Emri") && (
          <>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Kar Al (% TP)</span>
              <input
                className={inputClass}
                type="number"
                value={data.takeProfit}
                onChange={(e) => onChange("takeProfit", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ width: "100%" }}>
              <span style={labelStyle}>Stop Loss (% SL)</span>
              <input
                className={inputClass}
                type="number"
                value={data.stopLoss}
                onChange={(e) => onChange("stopLoss", e.target.value)}
                style={inputStyle}
              />
            </div>
          </>
        )}
        {data.label.includes("Özel Strateji") && (
          <div
            style={{
              fontSize: "12px",
              color: "#F0CB35",
              textAlign: "center",
              padding: "5px",
            }}
          >
            Kod editörünü kullanın.
          </div>
        )}
      </div>
      {data.nodeType !== "output" && !isCustom && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ ...handleStyle, bottom: -7 }}
          isConnectable={true}
        />
      )}
      {(data.nodeType === "custom" || data.nodeType === "custom_indicator") && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            style={{ ...handleStyle, top: -7 }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ ...handleStyle, bottom: -7 }}
          />
        </>
      )}
    </div>
  );
};

// --- SIDEBAR ---
const Sidebar = ({
  isOpen,
  setTooltip,
  savedScripts,
  onRenameScript,
  onDeleteScript,
}) => {
  const onDragStart = (event, nodeType, label, extraData) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/label", label);
    if (extraData)
      event.dataTransfer.setData(
        "application/extra",
        JSON.stringify(extraData)
      );
    event.dataTransfer.effectAllowed = "move";
  };
  const dndStyle = {
    padding: "10px",
    border: "1px solid #444",
    borderRadius: "5px",
    color: "white",
    cursor: "grab",
    background: "#252526",
    textAlign: "center",
    fontSize: "13px",
    marginBottom: "10px",
  };
  if (!isOpen)
    return (
      <div style={{ width: 0, overflow: "hidden", transition: "width 0.3s" }} />
    );
  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        background: "#1e1e1e",
        borderRight: "1px solid #333",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <h5 style={{ color: "#fff", marginTop: 0, marginBottom: 15 }}>
        Araçlar 🛠️
      </h5>
      <div
        onDragStart={(e) => onDragStart(e, "default", "⚙️ RSI İndikatörü")}
        draggable
        style={dndStyle}
      >
        ⚙️ RSI İndikatörü
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "📈 Hareketli Ort.")}
        draggable
        style={dndStyle}
      >
        📈 Hareketli Ort.
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "📊 MACD")}
        draggable
        style={dndStyle}
      >
        📊 MACD
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "🌊 Bollinger Bantları")}
        draggable
        style={dndStyle}
      >
        🌊 Bollinger Bantları
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "🚀 SuperTrend")}
        draggable
        style={{ ...dndStyle, borderColor: "#FF416C" }}
      >
        🚀 SuperTrend
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "📉 Stochastic")}
        draggable
        style={{ ...dndStyle, borderColor: "#cc2b5e" }}
      >
        📉 Stochastic
      </div>
      <div style={{ borderTop: "1px solid #333", margin: "10px 0" }}></div>
      <div
        onDragStart={(e) => onDragStart(e, "logic", "🔗 VE (AND)")}
        draggable
        style={{
          ...dndStyle,
          borderColor: "#2196f3",
          color: "#64b5f6",
          background: "#0d47a1",
        }}
      >
        🔗 VE (Hepsi)
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "logic", "🔀 VEYA (OR)")}
        draggable
        style={{
          ...dndStyle,
          borderColor: "#ff9800",
          color: "#ffb74d",
          background: "#e65100",
        }}
      >
        🔀 VEYA (Herhangi)
      </div>
      <div style={{ borderTop: "1px solid #333", margin: "10px 0" }}></div>
      <div
        onDragStart={(e) => onDragStart(e, "custom", "📜 Özel Strateji (Kod)")}
        draggable
        style={{ ...dndStyle, borderColor: "#ffd700", color: "#ffd700" }}
      >
        📜 Özel Strateji (Kod)
      </div>
      <div style={{ borderTop: "1px solid #333", margin: "10px 0" }}></div>
      <div style={{ color: "#aaa", fontSize: "11px", marginBottom: "5px" }}>
        Kütüphanem
      </div>
      {savedScripts &&
        savedScripts.map((script) => (
          <div
            key={script.id}
            style={{
              ...dndStyle,
              borderColor: "#614385",
              color: "#d4bbf9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "default",
            }}
            onMouseEnter={(e) =>
              setTooltip({ x: e.clientX, y: e.clientY, text: "Script" })
            }
            onMouseLeave={() => setTooltip(null)}
          >
            <div
              draggable
              onDragStart={(e) =>
                onDragStart(e, "custom_indicator", "🧩 " + script.name, {
                  id: script.id,
                  code: script.code,
                  params: script.params,
                })
              }
              style={{
                flexGrow: 1,
                cursor: "grab",
                textAlign: "left",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              🧩 {script.name}
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={() => onRenameScript(script.id, script.name)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "0 2px",
                }}
              >
                ✏️
              </button>
              <button
                onClick={() => onDeleteScript(script.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "0 2px",
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      <div style={{ borderTop: "1px solid #333", margin: "10px 0" }}></div>
      <div
        onDragStart={(e) => onDragStart(e, "output", "💰 AL Emri")}
        draggable
        style={{
          ...dndStyle,
          borderColor: "#00ff88",
          background: "#1e3a1e",
          color: "#00ff88",
        }}
      >
        💰 AL Emri
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "output", "💰 SAT Emri")}
        draggable
        style={{
          ...dndStyle,
          borderColor: "#ff4444",
          background: "#3a1e1e",
          color: "#ffaaaa",
        }}
      >
        💰 SAT Emri
      </div>
    </aside>
  );
};

// --- CHART ---
const ResultChart = ({ data, markers, customPlots }) => {
  const containerRef = useRef();
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    if (!data || data.length === 0) {
      containerRef.current.innerHTML =
        "<div style='color:#666; display:flex; justify-content:center; align-items:center; height:100%;'>Grafik verisi yok</div>";
      return;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#1e1e1e" },
        textColor: "#d1d4dc",
      },
      width: containerRef.current.clientWidth,
      height: 400, // SABİT YÜKSEKLİK
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      timeScale: { timeVisible: true, borderColor: "#444" },
    });
    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
    });
    candlestickSeries.setData(data);
    if (markers && markers.length > 0) candlestickSeries.setMarkers(markers);

    const lowerPanePlots = [];
    const mainPanePlots = [];
    if (customPlots)
      Object.keys(customPlots).forEach((name) => {
        const p = customPlots[name];
        if (p.panel === "lower") lowerPanePlots.push({ name, ...p });
        else mainPanePlots.push({ name, ...p });
      });
    mainPanePlots.forEach((p) => {
      const s = chart.addLineSeries({
        color: p.color,
        lineWidth: 2,
        title: p.name,
      });
      s.setData(p.data);
    });

    let lowerChart = null;
    if (lowerPanePlots.length > 0) {
      const lowerContainer = document.createElement("div");
      Object.assign(lowerContainer.style, {
        height: "150px",
        width: "100%",
        marginTop: "5px",
        borderTop: "1px solid #333",
      });
      containerRef.current.appendChild(lowerContainer);
      lowerChart = createChart(lowerContainer, {
        layout: {
          background: { type: ColorType.Solid, color: "#1e1e1e" },
          textColor: "#d1d4dc",
        },
        width: containerRef.current.clientWidth,
        height: 150,
        timeScale: { timeVisible: true },
      });
      lowerPanePlots.forEach((p) => {
        const s =
          p.style === "histogram"
            ? lowerChart.addHistogramSeries({ color: p.color })
            : lowerChart.addLineSeries({ color: p.color });
        s.setData(p.data);
      });
      chart
        .timeScale()
        .subscribeVisibleLogicalRangeChange((r) =>
          lowerChart.timeScale().setVisibleLogicalRange(r)
        );
      lowerChart
        .timeScale()
        .subscribeVisibleLogicalRangeChange((r) =>
          chart.timeScale().setVisibleLogicalRange(r)
        );
    }

    requestAnimationFrame(() => chart.timeScale().fitContent());
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
        if (lowerChart)
          lowerChart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      if (lowerChart) lowerChart.remove();
    };
  }, [data, markers, customPlots]);
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        position: "relative",
      }}
    />
  );
};

// --- APP ---
const initialNodes = [
  {
    id: "1",
    type: "input",
    position: { x: 350, y: 50 },
    data: { label: "📈 Veri: BTC/USDT", nodeType: "input" },
    style: { background: "transparent", border: "none", padding: 0 },
  },
];
let id = 0;
const getId = () => `node_${id++}`;

function AlgoBlokApp() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // --- GÜNCELLENMİŞ EDİTÖR BAŞLANGIÇ KODU ---
  const [userCode, setUserCode] = useState(
    `# -- AlgoScript --
# Parametreler (Değişkenler):
periyot = 14
esik_deger = 30

# Hesaplamalar:
# rsi(), sma(), ema(), macd() kullanabilirsiniz.
r = rsi(periyot)

# Çizim (Opsiyonel):
plot("RSI Değeri", r, "#ff9800")

# Sinyal Mantığı:
if r < esik_deger:
    buy()   # Al Sinyali
    
if r > (100 - esik_deger):
    sell()  # Sat Sinyali
`
  );
  const [generatedCode, setGeneratedCode] = useState("");
  const [backtestResult, setBacktestResult] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [savedScripts, setSavedScripts] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingScriptId, setEditingScriptId] = useState(null);

  const [timeframe, setTimeframe] = useState("1h");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [commission, setCommission] = useState(0.001);

  const nodeTypes = useMemo(
    () => ({
      default: UniversalNode,
      logic: UniversalNode,
      input: UniversalNode,
      output: UniversalNode,
      custom: UniversalNode,
    }),
    []
  );
  const { screenToFlowPosition, getEdges, getNodes } = useReactFlow();

  useEffect(() => {
    const saved = localStorage.getItem("algoStrategies");
    if (saved) setSavedStrategies(JSON.parse(saved));
    const scripts = localStorage.getItem("algoScripts");
    if (scripts) setSavedScripts(JSON.parse(scripts));
  }, []);

  const parseParamsFromCode = (code) => {
    const params = {};
    const regex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([0-9]+(\\.[0-9]+)?)/gm;
    let match;
    while ((match = regex.exec(code)) !== null)
      params[match[1]] = parseFloat(match[2]);
    return params;
  };
  const handleEditorChange = (value) => {
    setUserCode(value);
    if (selectedNodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                [node.data.nodeType === "custom_indicator"
                  ? "codeTemplate"
                  : "code"]: value,
              },
            };
          }
          return node;
        })
      );
    }
  };
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setEditingScriptId(null);
  }, []);
  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNodeId(node.id);
      if (node.type === "custom" || node.data.nodeType === "custom_indicator") {
        const codeToLoad = node.data.code || node.data.codeTemplate || userCode;
        setUserCode(codeToLoad);
        setEditingScriptId(node.data.scriptId || null);
      }
    },
    [userCode]
  );
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, style: { stroke: "#00ff88" } },
          eds
        )
      ),
    [setEdges]
  );

  // --- GÜNCELLENMİŞ KAYIT FONKSİYONU ---
  const saveScript = () => {
    // Varsayılan isim belirleme
    let defaultName = "YeniIndikator";
    if (editingScriptId) {
      const existing = savedScripts.find((s) => s.id === editingScriptId);
      if (existing) defaultName = existing.name;
    }

    const name = prompt("Script Adı:", defaultName);

    if (name) {
      const existingIndex = savedScripts.findIndex((s) => s.name === name);
      let newScripts = [...savedScripts];
      const params = parseParamsFromCode(userCode);
      let targetScriptId = null; // Güncellenen veya yeni oluşturulan scriptin ID'si

      if (existingIndex !== -1) {
        // --- SENARYO 1: Üstüne Yazma (Overwrite) ---
        const confirmUpdate = window.confirm(
          `${name} isminde bir script zaten var. Üzerine yazılsın mı?`
        );
        if (!confirmUpdate) return;

        // Mevcut ID'yi koru
        targetScriptId = newScripts[existingIndex].id;

        newScripts[existingIndex] = {
          ...newScripts[existingIndex],
          code: userCode,
          params: params,
        };
      } else {
        // --- SENARYO 2: Yeni Oluşturma ---
        targetScriptId = Date.now();
        newScripts.push({
          id: targetScriptId,
          name,
          code: userCode,
          params: params,
        });
      }

      // 1. Veritabanını (LocalStorage) Güncelle
      setSavedScripts(newScripts);
      localStorage.setItem("algoScripts", JSON.stringify(newScripts));

      // 2. SAHNEYİ CANLI GÜNCELLE (Kritik Kısım Burası)
      // Eğer sahnede bu script'e ait kutular varsa, onların içini de yeni kodla değiştir.
      setNodes((nds) =>
        nds.map((node) => {
          // Kutunun scriptId'si, kaydettiğimiz script'in ID'si ile aynı mı?
          if (node.data.scriptId === targetScriptId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: "🧩 " + name, // İsmi değiştiyse güncelle
                codeTemplate: userCode, // Yeni kodu yükle
                customParams: params, // Yeni parametreleri yükle (örn: periyot 14->20 olduysa)
              },
            };
          }
          return node;
        })
      );

      // Eğer şu an bir node seçiliyse ve o node güncellendiyse,
      // editörün baktığı ID'yi de güncelle (Yeni kayıtlarda ID değiştiği için)
      if (selectedNodeId) {
        setEditingScriptId(targetScriptId);
      }
    }
  };

  const saveStrategy = () => {
    const name = prompt("Ad:", "Strateji 1");
    if (name) {
      const s = [
        ...savedStrategies,
        { id: Date.now(), name, nodes, edges, userCode },
      ];
      setSavedStrategies(s);
      localStorage.setItem("algoStrategies", JSON.stringify(s));
    }
  };
  const loadStrategy = (s) => {
    if (s) {
      const st = JSON.parse(s);
      setNodes(st.nodes);
      setEdges(st.edges);
      if (st.userCode) setUserCode(st.userCode);
    }
  };
  const deleteStrategy = (s) => {
    if (s) {
      const st = JSON.parse(s);
      const n = savedStrategies.filter((x) => x.id !== st.id);
      setSavedStrategies(n);
      localStorage.setItem("algoStrategies", JSON.stringify(n));
    }
  };
  const onDeleteScript = (id) => {
    const n = savedScripts.filter((x) => x.id !== id);
    setSavedScripts(n);
    localStorage.setItem("algoScripts", JSON.stringify(n));
  };
  const handleRenameScript = (id, old) => {
    const n = prompt("Yeni ad", old);
    if (n) {
      const s = savedScripts.map((x) => (x.id === id ? { ...x, name: n } : x));
      setSavedScripts(s);
      localStorage.setItem("algoScripts", JSON.stringify(s));
    }
  };
  const saveOptimizedStrategy = () => {
    if (optimizationResult) {
      alert("Kaydedildi!");
      setOptimizationResult(null);
    }
  };
  const applyOptimization = () => {
    if (optimizationResult) {
      const p = optimizationResult.best_params;
      setNodes((nds) =>
        nds.map((n) => {
          const d = { ...n.data };
          if (n.data.label.includes("RSI") && p.rsi_period)
            d.period = p.rsi_period;
          return { ...n, data: d };
        })
      );
      setOptimizationResult(null);
    }
  };

  const getDefaultParams = (type, label) => {
    if (label.includes("RSI"))
      return {
        period: 14,
        overbought: 70,
        oversold: 30,
        entryOp: "<",
        exitOp: ">",
      };
    if (label.includes("Hareketli")) return { period: 50, maType: "SMA" };
    if (label.includes("MACD")) return { fast: 12, slow: 26, signal: 9 };
    if (label.includes("Emri")) return { stopLoss: 1, takeProfit: 2 };
    return {};
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("application/label");
      const extraDataStr = event.dataTransfer.getData("application/extra");
      if (!type) return;
      if (type === "output" && nodes.find((n) => n.type === "output")) {
        alert("Sadece 1 işlem kutusu olabilir.");
        return;
      }
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const defaults = getDefaultParams(type, label);
      let newData = { label, nodeType: type, ...defaults };
      if (type === "custom_indicator" && extraDataStr) {
        const extra = JSON.parse(extraDataStr);
        newData.customParams = extra.params;
        newData.codeTemplate = extra.code;
        newData.scriptId = extra.id;
      }
      const newNode = {
        id: getId(),
        type:
          type === "custom_indicator" || type === "custom" ? "custom" : type,
        position,
        data: { ...newData },
        style: { background: "transparent", border: "none", padding: 0 },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  // --- BAĞLANTI KONTROLÜ (GÜNCELLENDİ & SIKI DENETİM) ---
  const getConnectedStrategy = () => {
    const allNodes = getNodes();
    const allEdges = getEdges();
    const actionNode = allNodes.find((n) => n.type === "output");

    // 1. KONTROL: Emir kutusu var mı?
    if (!actionNode)
      throw new Error("Lütfen bir 'AL/SAT Emri' kutusu ekleyin.");

    // 2. KONTROL: Emir kutusuna kaç kablo geliyor?
    const inputEdges = allEdges.filter((e) => e.target === actionNode.id);

    if (inputEdges.length === 0)
      throw new Error(
        "Stratejiyi tamamlamak için bir indikatörü veya mantık kutusunu 'AL/SAT Emri'ne bağlayın."
      );

    if (inputEdges.length > 1)
      throw new Error(
        "HATA: AL/SAT Emri kutusuna aynı anda birden fazla kablo bağlayamazsınız. Birden fazla indikatör kullanacaksanız lütfen önce 'VE / VEYA' kutusuna bağlayın."
      );

    const inputEdge = inputEdges[0]; // Tek ve geçerli bağlantıyı al
    const sourceNode = allNodes.find((n) => n.id === inputEdge.source);

    let connectedIndicatorNodes = [];
    let logicType = "AND";

    // Mantık Kutusu mu yoksa Tek İndikatör mü?
    if (sourceNode.type === "logic") {
      logicType = sourceNode.data.label.includes("VEYA") ? "OR" : "AND";
      const indicatorEdges = allEdges.filter((e) => e.target === sourceNode.id);

      if (indicatorEdges.length === 0)
        throw new Error("Mantık kutusuna en az bir indikatör bağlayın!");

      indicatorEdges.forEach((edge) => {
        const indNode = allNodes.find((n) => n.id === edge.source);
        if (indNode) connectedIndicatorNodes.push(indNode);
      });
    } else {
      // Tekli Mod (Direkt indikatör bağlı)
      connectedIndicatorNodes.push(sourceNode);
    }

    // --- YENİ EKLENEN KISIM: BOŞTA KALAN İNDİKATÖR KONTROLÜ ---
    // Sahnede olup da zincire dahil olmayan indikatör var mı?

    // Zincire dahil olanların ID listesi
    const usedNodeIds = connectedIndicatorNodes.map((n) => n.id);
    // Emir kutusu ve Mantık kutusunu da "kullanılanlar" listesine ekleyelim ki hata vermesinler
    usedNodeIds.push(actionNode.id);
    if (sourceNode.type === "logic") usedNodeIds.push(sourceNode.id);

    // Sahnedeki tüm "İndikatör rolündeki" node'ları bul
    const allIndicatorLikeNodes = allNodes.filter(
      (n) =>
        (n.type === "default" && !n.data.label.includes("Emri")) || // Standart indikatörler
        n.type === "custom" || // Özel scriptler
        n.type === "custom_indicator"
    );

    // Kullanılmayanları filtrele
    const unusedNodes = allIndicatorLikeNodes.filter(
      (n) => !usedNodeIds.includes(n.id)
    );

    if (unusedNodes.length > 0) {
      const names = unusedNodes.map((n) => n.data.label).join(", ");
      throw new Error(
        `DİKKAT: Sahneye eklediğiniz ama bağlamadığınız indikatörler var: [ ${names} ]. Lütfen bunları bağlayın ya da silin.`
      );
    }
    // -----------------------------------------------------------

    const getParams = (labelMatch) =>
      connectedIndicatorNodes.find((n) => n.data.label.includes(labelMatch));

    return {
      logic: logicType,
      direction: actionNode.data.label.includes("SAT") ? "short" : "long",
      rsiNode: getParams("RSI"),
      smaNode: getParams("Hareketli"),
      macdNode: getParams("MACD"),
      bbNode: getParams("Bollinger"),
      stNode: getParams("SuperTrend"),
      stochNode: getParams("Stochastic"),
      customNodes: connectedIndicatorNodes.filter(
        (n) => n.type === "custom" || n.data.nodeType === "custom_indicator"
      ),
      actionNode,
    };
  };
  const runBacktest = async () => {
    setLoading(true);
    setBacktestResult(null);
    try {
      const strategy = getConnectedStrategy();
      const customIndicators = strategy.customNodes.map((n) => {
        let code = n.data.codeTemplate || n.data.code;
        let paramOverride = "";
        if (n.data.customParams)
          Object.entries(n.data.customParams).forEach(([key, val]) => {
            paramOverride += `${key} = ${val}\n`;
          });
        return paramOverride + code;
      });
      const payload = {
        symbol: "BTC/USDT",
        timeframe,
        start_date: startDate,
        end_date: endDate,
        commission_rate: Number(commission),
        strategy_logic: strategy.logic,
        trade_direction: strategy.direction,
        custom_code: "",
        custom_indicators: customIndicators,
        rsi_period: Number(strategy.rsiNode?.data?.period || 0),
        overbought: Number(strategy.rsiNode?.data?.overbought || 70),
        oversold: Number(strategy.rsiNode?.data?.oversold || 30),
        entry_operator: strategy.rsiNode?.data?.entryOp || "<",
        exit_operator: strategy.rsiNode?.data?.exitOp || ">",
        sma_period: Number(strategy.smaNode?.data?.period || 0),
        ma_type: strategy.smaNode?.data?.maType || "SMA",
        macd_fast: Number(strategy.macdNode?.data?.fast || 0),
        macd_slow: Number(strategy.macdNode?.data?.slow || 26),
        macd_signal: Number(strategy.macdNode?.data?.signal || 9),
        bb_period: Number(strategy.bbNode?.data?.period || 0),
        bb_std: Number(strategy.bbNode?.data?.std || 2),
        supertrend_period: Number(strategy.stNode?.data?.period || 0),
        supertrend_multiplier: Number(strategy.stNode?.data?.multiplier || 3),
        stoch_k: Number(strategy.stochNode?.data?.stoch_k || 0),
        stoch_d: Number(strategy.stochNode?.data?.stoch_d || 3),
        stoch_oversold: Number(strategy.stochNode?.data?.stoch_oversold || 20),
        stoch_overbought: Number(
          strategy.stochNode?.data?.stoch_overbought || 80
        ),
        stop_loss: Number(strategy.actionNode?.data?.stopLoss || 0),
        take_profit: Number(strategy.actionNode?.data?.takeProfit || 0),
      };
      const res = await axios.post(
        "http://127.0.0.1:8000/api/backtest",
        payload
      );
      setBacktestResult(res.data);
    } catch (e) {
      alert("Hata: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    if (nodes.some((n) => n.data.label.includes("Özel Strateji"))) {
      alert("Özel Kod modunda optimizasyon desteklenmiyor.");
      return;
    }
    setLoading(true);
    setOptimizationResult(null);
    try {
      const strategy = getConnectedStrategy();
      const payload = {
        symbol: "BTC/USDT",
        timeframe,
        start_date: startDate,
        end_date: endDate,
        commission_rate: Number(commission),
        strategy_logic: strategy.logic,
        trade_direction: strategy.direction,
        custom_code: "",
        custom_indicators: [],
        rsi_period: Number(strategy.rsiNode?.data?.period || 0),
        overbought: Number(strategy.rsiNode?.data?.overbought || 70),
        oversold: Number(strategy.rsiNode?.data?.oversold || 30),
        entry_operator: strategy.rsiNode?.data?.entryOp || "<",
        exit_operator: strategy.rsiNode?.data?.exitOp || ">",
        sma_period: Number(strategy.smaNode?.data?.period || 0),
        ma_type: strategy.smaNode?.data?.maType || "SMA",
        macd_fast: Number(strategy.macdNode?.data?.fast || 0),
        macd_slow: Number(strategy.macdNode?.data?.slow || 26),
        macd_signal: Number(strategy.macdNode?.data?.signal || 9),
        bb_period: Number(strategy.bbNode?.data?.period || 0),
        bb_std: Number(strategy.bbNode?.data?.std || 2),
        supertrend_period: Number(strategy.stNode?.data?.period || 0),
        supertrend_multiplier: Number(strategy.stNode?.data?.multiplier || 3),
        stoch_k: Number(strategy.stochNode?.data?.stoch_k || 0),
        stoch_d: Number(strategy.stochNode?.data?.stoch_d || 3),
        stoch_oversold: Number(strategy.stochNode?.data?.stoch_oversold || 20),
        stoch_overbought: Number(
          strategy.stochNode?.data?.stoch_overbought || 80
        ),
        stop_loss: Number(strategy.actionNode?.data?.stopLoss || 0),
        take_profit: Number(strategy.actionNode?.data?.takeProfit || 0),
      };
      const res = await axios.post(
        "http://127.0.0.1:8000/api/optimize",
        payload
      );
      setOptimizationResult(res.data);
    } catch (e) {
      alert("Optimizasyon Hatası: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const isCustomMode = nodes.some(
    (n) =>
      n.data.label.includes("Özel Strateji") ||
      n.data.nodeType === "custom_indicator"
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#121212",
        overflow: "hidden",
      }}
    >
      {loading && <LoadingScreen />}
      {backtestResult && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#151515",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #444",
            zIndex: 1000,
            width: "90%",
            height: "90%",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 0 50px rgba(0,0,0,0.8)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <h2 style={{ margin: 0, color: "white" }}>Sonuçlar</h2>
            <button
              onClick={() => setBacktestResult(null)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              X
            </button>
          </div>
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div
              style={{
                flex: 1,
                background: "#222",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", fontSize: "12px" }}>
                Başlangıç Bakiye
              </div>
              <div
                style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}
              >
                $1,000.00
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#222",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", fontSize: "12px" }}>Son Bakiye</div>
              <div
                style={{
                  color:
                    backtestResult.final_balance > 1000 ? "#00ff88" : "#ff4444",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                ${backtestResult.final_balance}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#222",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", fontSize: "12px" }}>Net Kar (%)</div>
              <div
                style={{
                  color:
                    backtestResult.profit_percent > 0 ? "#00ff88" : "#ff4444",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                %{backtestResult.profit_percent}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#222",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", fontSize: "12px" }}>Brüt Kar</div>
              <div
                style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}
              >
                ${backtestResult.gross_profit}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#222",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", fontSize: "12px" }}>Komisyon</div>
              <div
                style={{
                  color: "#ffaa00",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                -${backtestResult.total_commission}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#222",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", fontSize: "12px" }}>
                İşlem Sayısı
              </div>
              <div
                style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}
              >
                {backtestResult.total_trades}
              </div>
            </div>
          </div>
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              gap: "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: 2,
                border: "1px solid #333",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <ResultChart
                data={backtestResult.chart_data} // Python'dan 'chart_data' geliyor
                markers={backtestResult.markers} // Bu doğru (markers)
                customPlots={backtestResult.custom_plots} // Python'dan 'custom_plots' geliyor
              />
            </div>
            <div
              style={{
                flex: 1,
                background: "#1e1e1e",
                border: "1px solid #333",
                borderRadius: "8px",
                overflowY: "auto",
                padding: "10px",
              }}
            >
              <h4 style={{ marginTop: 0, color: "#ccc" }}>İşlem Geçmişi</h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                  color: "#ddd",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #444",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: 5 }}>Zaman</th>
                    <th style={{ padding: 5 }}>Tür</th>
                    <th style={{ padding: 5 }}>Fiyat</th>
                    <th style={{ padding: 5 }}>Kar/Zarar</th>
                  </tr>
                </thead>
                <tbody>
                  {backtestResult.trades.map((t, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #333" }}>
                      <td style={{ padding: 5 }}>
                        {new Date(t.time * 1000).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          padding: 5,
                          color: t.type === "buy" ? "#00ff88" : "#ff4444",
                        }}
                      >
                        {t.type.toUpperCase()}
                      </td>
                      <td style={{ padding: 5 }}>{t.price}</td>
                      <td
                        style={{
                          padding: 5,
                          color:
                            t.profit > 0
                              ? "#00ff88"
                              : t.profit < 0
                              ? "#ff4444"
                              : "#ccc",
                        }}
                      >
                        {t.profit ? "$" + t.profit.toFixed(2) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {optimizationResult && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            padding: "25px",
            borderRadius: "12px",
            border: "1px solid #00ff88",
            zIndex: 2000,
            width: "400px",
            textAlign: "center",
            boxShadow: "0 0 50px rgba(0, 255, 136, 0.2)",
          }}
        >
          <h2 style={{ margin: "0 0 15px 0", color: "#fff" }}>✨ AI Önerisi</h2>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#00ff88",
              marginBottom: "10px",
            }}
          >
            %{optimizationResult.best_profit}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "15px",
              textAlign: "left",
            }}
          >
            {optimizationResult.best_params &&
            Object.keys(optimizationResult.best_params).length > 0 ? (
              <>
                {Object.entries(optimizationResult.best_params).map(
                  ([key, val]) => (
                    <div
                      key={key}
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      👉 {key.replace("_", " ").toUpperCase()}:{" "}
                      <span style={{ color: "#ffd700" }}>{val}</span>
                    </div>
                  )
                )}
              </>
            ) : (
              <div style={{ color: "#aaa" }}>Mevcut ayarlar en iyisi.</div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              justifyContent: "center",
            }}
          >
            <button
              onClick={applyOptimization}
              style={{
                padding: "10px 20px",
                background: "#00ff88",
                color: "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✅ Şimdi Uygula
            </button>
            <button
              onClick={saveOptimizedStrategy}
              style={{
                padding: "10px 20px",
                background: "#2962FF",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              💾 Kaydet
            </button>
            <button
              onClick={() => setOptimizationResult(null)}
              style={{
                padding: "10px 20px",
                background: "#333",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              İptal
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          padding: "10px 20px",
          borderBottom: "1px solid #333",
          background: "#1e1e1e",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h4 style={{ margin: 0, color: "#00ff88", fontSize: "18px" }}>
            AlgoBlok Pro
          </h4>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                background: "#222",
                color: "white",
                border: "1px solid #444",
                padding: "6px",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            >
              <option value="15m">15 Dakika</option>
              <option value="1h">1 Saat</option>
              <option value="4h">4 Saat</option>
              <option value="1d">1 Gün</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                background: "#222",
                color: "white",
                border: "1px solid #444",
                padding: "5px",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            />
            <span style={{ color: "#888" }}>⮕</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                background: "#222",
                color: "white",
                border: "1px solid #444",
                padding: "5px",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            />
            <div
              style={{
                marginLeft: 10,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ fontSize: 12, color: "#aaa" }}>Komisyon:</span>
              <input
                type="number"
                step="0.0001"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                style={{
                  width: 60,
                  background: "#222",
                  color: "white",
                  border: "1px solid #444",
                  padding: "5px",
                  borderRadius: "4px",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={saveStrategy}
              style={{
                background: "#333",
                border: "none",
                color: "#ccc",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              💾 Kaydet
            </button>
            <select
              onChange={(e) => {
                if (e.target.value) loadStrategy(e.target.value);
                e.target.value = "";
              }}
              style={{
                background: "#222",
                color: "#ccc",
                border: "1px solid #444",
                padding: "6px",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            >
              <option value="">📂 Yükle...</option>
              {savedStrategies.map((s) => (
                <option key={s.id} value={JSON.stringify(s)}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              onChange={(e) => {
                if (e.target.value) deleteStrategy(e.target.value);
                e.target.value = "";
              }}
              style={{
                background: "#222",
                color: "#ff8888",
                border: "1px solid #444",
                padding: "6px",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            >
              <option value="">🗑️ Sil...</option>
              {savedStrategies.map((s) => (
                <option key={s.id} value={JSON.stringify(s)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => window.open("/docs.html", "_blank")}
            style={{
              background: "#222",
              border: "1px solid #444",
              color: "#aaa",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            📚 Yardım
          </button>
          {!isCustomMode && (
            <button
              onClick={runOptimization}
              disabled={loading}
              style={{
                padding: "8px 20px",
                background: "linear-gradient(45deg, #ff00cc, #333399)",
                border: "none",
                color: "white",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              {loading ? "..." : "✨ AI Optimize Et"}
            </button>
          )}
          <button
            onClick={runBacktest}
            disabled={loading}
            style={{
              padding: "8px 25px",
              background: loading
                ? "#555"
                : "linear-gradient(45deg, #007acc, #00ff88)",
              border: "none",
              color: "white",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            {loading ? "..." : "▶️ Test Et"}
          </button>
        </div>
      </div>
      <div
        style={{ display: "flex", flexGrow: 1, overflow: "hidden" }}
        onClick={onPaneClick}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          setTooltip={setTooltip}
          savedScripts={savedScripts}
          onRenameScript={handleRenameScript}
          onDeleteScript={onDeleteScript}
        />
        <div
          style={{ flexGrow: 1, position: "relative" }}
          ref={reactFlowWrapper}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            colorMode="dark"
          >
            <Background color="#555" gap={20} variant="dots" />
            <Controls />
            {tooltip && <Tooltip data={tooltip.text} position={tooltip} />}
          </ReactFlow>
        </div>
        <div
          style={{
            width: 350,
            borderLeft: "1px solid #333",
            display: "flex",
            flexDirection: "column",
            background: "#1e1e1e",
          }}
        >
          <div
            style={{
              padding: "10px",
              background: "#252526",
              color: "#ccc",
              fontSize: "12px",
              fontWeight: "bold",
              borderBottom: "1px solid #333",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {isCustomMode ? "📜 AlgoScript Editörü" : "🤖 Otomatik Kod"}
            </span>
            {isCustomMode && (
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => {
                    if (!selectedNodeId) return;
                    const paramsFromCode = parseParamsFromCode(userCode);
                    setNodes((nds) =>
                      nds.map((n) => {
                        if (n.id === selectedNodeId) {
                          return {
                            ...n,
                            data: { ...n.data, customParams: paramsFromCode },
                          };
                        }
                        return n;
                      })
                    );
                    alert("Kod parametreleri bloğa resetlendi!");
                  }}
                  style={{
                    background: "#e65100",
                    border: "none",
                    color: "#fff",
                    fontSize: "10px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    borderRadius: "3px",
                    fontWeight: "bold",
                  }}
                >
                  ↻ Koddan Resetle
                </button>
                <button
                  onClick={saveScript}
                  style={{
                    background: "#007acc",
                    border: "none",
                    color: "#fff",
                    fontSize: "10px",
                    padding: "2px 5px",
                    cursor: "pointer",
                    borderRadius: "3px",
                  }}
                >
                  💾 Kaydet
                </button>
              </div>
            )}
          </div>
          <div style={{ flexGrow: 1 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={isCustomMode ? userCode : generatedCode}
              onChange={handleEditorChange}
              options={{
                readOnly: !isCustomMode,
                minimap: { enabled: false },
                fontSize: 13,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppWithProvider() {
  return (
    <ReactFlowProvider>
      <AlgoBlokApp />
    </ReactFlowProvider>
  );
}
