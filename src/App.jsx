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
  MarkerType,
} from "@xyflow/react";
import { Editor } from "@monaco-editor/react";
import { createChart, ColorType } from "lightweight-charts";
import "@xyflow/react/dist/style.css";

const API_BASE_URL = "https://algo-backend-ld5h.onrender.com";

// --- STİLLER ---
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

// Handle stilini biraz büyüttük, kolay tutulması için
const handleStyle = {
  width: 12,
  height: 12,
  background: "#fff",
  border: "2px solid #555",
  zIndex: 150,
  transition: "background 0.2s",
};

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

// --- UNIVERSAL NODE ---
const UniversalNode = ({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();

  const onChange = (field, value) => {
    let newValue = value;
    if (!isNaN(Number(value)) && value.trim() !== "") {
      newValue = Number(value);
    }

    if (data.nodeType === "custom_indicator" || data.nodeType === "custom") {
      const currentParams = data.customParams || {};
      const newParams = { ...currentParams, [field]: newValue };
      updateNodeData(id, { customParams: newParams });
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

  const isCustomStrategyBlock = data.nodeType === "custom";

  const dynamicNodeStyle = {
    ...nodeStyle,
    borderColor: selected ? "#00ff88" : "#555",
    boxShadow: selected
      ? "0 0 15px rgba(0, 255, 136, 0.4)"
      : "0 8px 16px rgba(0,0,0,0.6)",
    transform: selected ? "scale(1.02)" : "scale(1)",
    zIndex: selected ? 100 : 1,
  };

  return (
    <div style={dynamicNodeStyle}>
      <div style={{ ...headerStyle, background: headerColor }}>
        <span>{data.label}</span>
      </div>

      {data.nodeType !== "input" && !isCustomStrategyBlock && (
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
            <div
              style={{
                display: "flex",
                gap: "8px",
                width: "100%",
                justifyContent: "center",
              }}
            >
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
                placeholder="Yok (0)"
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
                placeholder="Yok (0)"
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

      {data.nodeType !== "output" && !isCustomStrategyBlock && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ ...handleStyle, bottom: -7 }}
          isConnectable={true}
        />
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
  const handleMouseEnter = (e, text) =>
    setTooltip({ x: e.clientX, y: e.clientY, text });
  const handleMouseLeave = () => setTooltip(null);
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
        transition: "width 0.3s",
      }}
    >
      <h5
        style={{
          color: "#fff",
          marginTop: 0,
          marginBottom: 15,
          fontSize: "16px",
        }}
      >
        Araçlar 🛠️
      </h5>
      <div
        onDragStart={(e) => onDragStart(e, "default", "⚙️ RSI İndikatörü")}
        onMouseEnter={(e) => handleMouseEnter(e, "RSI")}
        onMouseLeave={handleMouseLeave}
        draggable
        style={dndStyle}
      >
        ⚙️ RSI İndikatörü
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "📈 Hareketli Ort.")}
        onMouseEnter={(e) => handleMouseEnter(e, "MA")}
        onMouseLeave={handleMouseLeave}
        draggable
        style={dndStyle}
      >
        📈 Hareketli Ort.
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "📊 MACD")}
        onMouseEnter={(e) => handleMouseEnter(e, "MACD")}
        onMouseLeave={handleMouseLeave}
        draggable
        style={dndStyle}
      >
        📊 MACD
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "🌊 Bollinger Bantları")}
        onMouseEnter={(e) => handleMouseEnter(e, "BB")}
        onMouseLeave={handleMouseLeave}
        draggable
        style={dndStyle}
      >
        🌊 Bollinger Bantları
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "🚀 SuperTrend")}
        onMouseEnter={(e) => handleMouseEnter(e, "ST")}
        onMouseLeave={handleMouseLeave}
        draggable
        style={{ ...dndStyle, borderColor: "#FF416C" }}
      >
        🚀 SuperTrend
      </div>
      <div
        onDragStart={(e) => onDragStart(e, "default", "📉 Stochastic")}
        onMouseEnter={(e) => handleMouseEnter(e, "Stoch")}
        onMouseLeave={handleMouseLeave}
        draggable
        style={{ ...dndStyle, borderColor: "#cc2b5e" }}
      >
        📉 Stochastic
      </div>
      <div style={{ borderTop: "1px solid #333", margin: "10px 0" }}></div>
      <div
        onDragStart={(e) => onDragStart(e, "logic", "🔗 VE (AND)")}
        onMouseEnter={(e) => handleMouseEnter(e, "VE")}
        onMouseLeave={handleMouseLeave}
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
        onMouseEnter={(e) => handleMouseEnter(e, "VEYA")}
        onMouseLeave={handleMouseLeave}
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
            onMouseEnter={(e) => handleMouseEnter(e, "Kaydedilmiş Script")}
            onMouseLeave={handleMouseLeave}
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
        💰 AL Emri (Long)
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
        💰 SAT Emri (Short)
      </div>
    </aside>
  );
};

// --- GRAPH ---
const ResultChart = ({ data, markers, customPlots }) => {
  const containerRef = useRef();
  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;
    containerRef.current.innerHTML = "";
    const mainContainer = document.createElement("div");
    mainContainer.style.height = "300px";
    mainContainer.style.width = "100%";
    containerRef.current.appendChild(mainContainer);
    const mainChart = createChart(mainContainer, {
      layout: {
        background: { type: ColorType.Solid, color: "#1e1e1e" },
        textColor: "#d1d4dc",
      },
      width: containerRef.current.clientWidth,
      height: 300,
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
    });
    const candlestickSeries = mainChart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeries.setData(data);
    if (markers && markers.length > 0) candlestickSeries.setMarkers(markers);

    const lowerPanePlots = [];
    const mainPanePlots = [];
    if (customPlots) {
      Object.keys(customPlots).forEach((name) => {
        const p = customPlots[name];
        if (p.panel === "lower") lowerPanePlots.push({ name, ...p });
        else mainPanePlots.push({ name, ...p });
      });
    }

    mainPanePlots.forEach((p) => {
      const series = mainChart.addLineSeries({
        color: p.color,
        lineWidth: 2,
        title: p.name,
      });
      series.setData(p.data);
    });

    let lowerChart = null;
    if (lowerPanePlots.length > 0) {
      const lowerContainer = document.createElement("div");
      lowerContainer.style.height = "150px";
      lowerContainer.style.width = "100%";
      lowerContainer.style.marginTop = "5px";
      lowerContainer.style.borderTop = "1px solid #333";
      containerRef.current.appendChild(lowerContainer);
      lowerChart = createChart(lowerContainer, {
        layout: {
          background: { type: ColorType.Solid, color: "#1e1e1e" },
          textColor: "#d1d4dc",
        },
        width: containerRef.current.clientWidth,
        height: 150,
        grid: {
          vertLines: { color: "#2B2B43" },
          horzLines: { color: "#2B2B43" },
        },
        timeScale: { timeVisible: true, secondsVisible: false },
      });
      lowerPanePlots.forEach((p) => {
        const series =
          p.style === "histogram"
            ? lowerChart.addHistogramSeries({ color: p.color, title: p.name })
            : lowerChart.addLineSeries({
                color: p.color,
                lineWidth: 2,
                title: p.name,
              });
        series.setData(p.data);
      });
      mainChart
        .timeScale()
        .subscribeVisibleLogicalRangeChange((r) =>
          lowerChart.timeScale().setVisibleLogicalRange(r)
        );
      lowerChart
        .timeScale()
        .subscribeVisibleLogicalRangeChange((r) =>
          mainChart.timeScale().setVisibleLogicalRange(r)
        );
    }
    mainChart.timeScale().fitContent();
    return () => {
      mainChart.remove();
      if (lowerChart) lowerChart.remove();
    };
  }, [data, markers, customPlots]);
  return (
    <div
      ref={containerRef}
      style={{ width: "100%", display: "flex", flexDirection: "column" }}
    />
  );
};

// --- MAIN ---
const initialNodes = [
  {
    id: "1",
    type: "input",
    position: { x: 350, y: 50 },
    data: { label: "📈 Veri: BTC/USDT", nodeType: "input" },
    style: { background: "transparent", border: "none", padding: 0 },
  },
];
const initialEdges = [];
let id = 0;
const getId = () => `node_${id++}`;

function AlgoBlokApp() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [userCode, setUserCode] = useState(
    "# Parametreler:\npd = 22\n\n# Kod:\nhc = highest('close', pd)\nwvf = ((hc - low) / hc) * 100\nplot('WVF', wvf, '#888', 'histogram', 'lower')\n"
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
  const { screenToFlowPosition } = useReactFlow();

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
    while ((match = regex.exec(code)) !== null) {
      params[match[1]] = parseFloat(match[2]);
    }
    return params;
  };

  const handleEditorChange = (value) => {
    setUserCode(value);
    if (selectedNodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNodeId) {
            const isLib = node.data.nodeType === "custom_indicator";
            return {
              ...node,
              data: { ...node.data, [isLib ? "codeTemplate" : "code"]: value },
            };
          }
          return node;
        })
      );
    }
  };

  // --- Input-Code Sync ---
  useEffect(() => {
    if (!selectedNodeId || !userCode) return;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node || !node.data.customParams) return;

    let updatedCode = userCode;
    let codeChanged = false;

    Object.entries(node.data.customParams).forEach(([key, val]) => {
      if (val === "" || val === undefined) return;
      const regex = new RegExp(
        `^([ \\t]*)(${key})\\s*=\\s*[0-9]+(\\.[0-9]+)?`,
        "gm"
      );
      if (regex.test(updatedCode)) {
        const newSegment = `$1$2 = ${val}`;
        updatedCode = updatedCode.replace(regex, (match) => {
          if (match.replace(/\s/g, "") === newSegment.replace(/\s/g, ""))
            return match;
          codeChanged = true;
          return newSegment;
        });
      }
    });

    if (codeChanged) setUserCode(updatedCode);
  }, [nodes, selectedNodeId]);

  const saveScript = () => {
    const codeParams = parseParamsFromCode(userCode);
    const getUpdatedNodeData = (
      nodeData,
      newCode,
      newDefaultParams,
      newName
    ) => {
      const cleanParams = {};
      Object.keys(newDefaultParams).forEach((key) => {
        cleanParams[key] = newDefaultParams[key];
      });
      return {
        ...nodeData,
        label: "🧩 " + newName,
        codeTemplate: newCode,
        customParams: cleanParams,
        _ts: Date.now(),
      };
    };

    if (editingScriptId) {
      const existingIndex = savedScripts.findIndex(
        (s) => s.id === editingScriptId
      );
      if (existingIndex >= 0) {
        const currentName = savedScripts[existingIndex].name;
        const newName = prompt("Script Adı:", currentName);
        if (!newName) return;

        const updatedScript = {
          ...savedScripts[existingIndex],
          name: newName,
          code: userCode,
          params: codeParams,
        };
        const updatedList = [...savedScripts];
        updatedList[existingIndex] = updatedScript;
        setSavedScripts(updatedList);
        localStorage.setItem("algoScripts", JSON.stringify(updatedList));

        setNodes((currentNodes) =>
          currentNodes.map((node) => {
            if (node.data.scriptId === editingScriptId) {
              return {
                ...node,
                data: getUpdatedNodeData(
                  node.data,
                  userCode,
                  codeParams,
                  newName
                ),
              };
            }
            return node;
          })
        );
        alert(`✅ "${newName}" güncellendi!`);
        return;
      }
    }

    const name = prompt("Script Adı:", "MyIndicator");
    if (name) {
      const existingIndex = savedScripts.findIndex((s) => s.name === name);
      if (existingIndex >= 0) {
        if (!window.confirm(`"${name}" zaten var. Üzerine yazılsın mı?`))
          return;
        const existingId = savedScripts[existingIndex].id;
        const updatedList = [...savedScripts];
        updatedList[existingIndex] = {
          id: existingId,
          name,
          code: userCode,
          params: codeParams,
        };
        setSavedScripts(updatedList);
        localStorage.setItem("algoScripts", JSON.stringify(updatedList));
        setEditingScriptId(existingId);
        setNodes((nds) =>
          nds.map((n) => {
            if (n.data.scriptId === existingId) {
              return {
                ...n,
                data: getUpdatedNodeData(n.data, userCode, codeParams, name),
              };
            }
            return n;
          })
        );
        alert(`✅ "${name}" üzerine yazıldı!`);
      } else {
        const newId = Date.now();
        const updatedList = [
          ...savedScripts,
          { id: newId, name, code: userCode, params: codeParams },
        ];
        setSavedScripts(updatedList);
        localStorage.setItem("algoScripts", JSON.stringify(updatedList));
        setEditingScriptId(newId);
        if (selectedNodeId) {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === selectedNodeId) {
                return {
                  ...n,
                  type: "custom",
                  data: {
                    ...n.data,
                    nodeType: "custom_indicator",
                    scriptId: newId,
                    label: "🧩 " + name,
                    codeTemplate: userCode,
                    customParams: codeParams,
                  },
                };
              }
              return n;
            })
          );
        }
        alert(`✅ "${name}" kaydedildi!`);
      }
    }
  };

  const saveOptimizedStrategy = () => {
    if (!optimizationResult) return;
    const params = optimizationResult.best_params;
    const optimizedNodes = nodes.map((node) => {
      const newData = { ...node.data };
      if (node.data.label.includes("RSI") && params.rsi_period)
        newData.period = params.rsi_period;
      if (node.data.label.includes("Hareketli") && params.sma_period)
        newData.period = params.sma_period;
      if (node.data.label.includes("SuperTrend")) {
        if (params.supertrend_period) newData.period = params.supertrend_period;
        if (params.supertrend_multiplier)
          newData.multiplier = params.supertrend_multiplier;
      }
      if (node.data.label.includes("Bollinger")) {
        if (params.bb_period) newData.period = params.bb_period;
        if (params.bb_std) newData.std = params.bb_std;
      }
      if (node.type === "output") {
        if (params.stop_loss) newData.stopLoss = params.stop_loss;
        if (params.take_profit) newData.takeProfit = params.take_profit;
      }
      return { ...node, data: newData };
    });

    const name = prompt(
      "Stratejiye isim ver:",
      "AI Strategy - " + new Date().toLocaleTimeString()
    );
    if (name) {
      const newStrategy = {
        id: Date.now(),
        name: "✨ " + name,
        nodes: optimizedNodes,
        edges,
        userCode,
      };
      const updatedStrategies = [...savedStrategies, newStrategy];
      setSavedStrategies(updatedStrategies);
      localStorage.setItem("algoStrategies", JSON.stringify(updatedStrategies));
      alert(`✅ "${name}" kaydedildi!`);
      setOptimizationResult(null);
    }
  };

  // --- DROP İŞLEMİ VE VARSAYILAN DEĞERLER (DÜZELTME BURADA) ---
  const getDefaultParams = (type, label) => {
    // Sürükle bırak yapıldığında inputların varsayılan değerleri buraya da işlenmeli
    // Yoksa backend'e 0 veya undefined gider.
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
    if (label.includes("Bollinger")) return { period: 20, std: 2 };
    if (label.includes("SuperTrend")) return { period: 10, multiplier: 3 };
    if (label.includes("Stochastic"))
      return {
        stoch_k: 14,
        stoch_d: 3,
        stoch_oversold: 20,
        stoch_overbought: 80,
      };
    if (label.includes("Emri")) return { stopLoss: 0, takeProfit: 0 };
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

      // Varsayılan değerleri alıp newData'ya ekliyoruz
      const defaults = getDefaultParams(type, label);
      let newData = { label, nodeType: type, ...defaults };

      if (type === "custom_indicator" && extraDataStr) {
        const extra = JSON.parse(extraDataStr);
        newData.customParams = extra.params;
        newData.codeTemplate = extra.code;
        newData.scriptId = extra.id;
      } else if (type === "custom") {
        newData.code = userCode;
        setEditingScriptId(null);
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
    [screenToFlowPosition, setNodes, nodes, userCode]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNodeId(node.id);
      if (node.type === "custom" || node.data.nodeType === "custom_indicator") {
        const codeToLoad = node.data.code || node.data.codeTemplate || userCode;
        setUserCode(codeToLoad);
        if (node.data.scriptId) {
          setEditingScriptId(node.data.scriptId);
        } else {
          setEditingScriptId(null);
        }
      }
    },
    [userCode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setEditingScriptId(null);
  }, []);

  const onDeleteScript = (scriptId) => {
    if (window.confirm("Silinsin mi?")) {
      const updatedScripts = savedScripts.filter((s) => s.id !== scriptId);
      setSavedScripts(updatedScripts);
      localStorage.setItem("algoScripts", JSON.stringify(updatedScripts));
      setNodes((currentNodes) =>
        currentNodes.filter((node) => node.data.scriptId !== scriptId)
      );
      if (editingScriptId === scriptId) {
        setEditingScriptId(null);
      }
    }
  };

  const handleRenameScript = (scriptId, oldName) => {
    const newName = prompt("Yeni isim:", oldName);
    if (newName && newName !== oldName) {
      const updatedScripts = savedScripts.map((s) =>
        s.id === scriptId ? { ...s, name: newName } : s
      );
      setSavedScripts(updatedScripts);
      localStorage.setItem("algoScripts", JSON.stringify(updatedScripts));
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.data.scriptId === scriptId) {
            return { ...node, data: { ...node.data, label: "🧩 " + newName } };
          }
          return node;
        })
      );
    }
  };

  const saveStrategy = () => {
    const name = prompt(
      "Strateji Adı:",
      "Strateji " + (savedStrategies.length + 1)
    );
    if (name) {
      const newStrategy = { id: Date.now(), name, nodes, edges, userCode };
      setSavedStrategies([...savedStrategies, newStrategy]);
      localStorage.setItem(
        "algoStrategies",
        JSON.stringify([...savedStrategies, newStrategy])
      );
      alert("✅ Kaydedildi!");
    }
  };
  const loadStrategy = (s) => {
    if (s && window.confirm("Yüklensin mi?")) {
      const st = JSON.parse(s);
      setNodes(st.nodes);
      setEdges(st.edges);
      if (st.userCode) setUserCode(st.userCode);
      setBacktestResult(null);
    }
  };
  const deleteStrategy = (s) => {
    if (s && window.confirm("Silinsin mi?")) {
      const st = JSON.parse(s);
      const updated = savedStrategies.filter((item) => item.id !== st.id);
      setSavedStrategies(updated);
      localStorage.setItem("algoStrategies", JSON.stringify(updated));
    }
  };
  const applyOptimization = () => {
    if (!optimizationResult) return;
    const params = optimizationResult.best_params;
    setNodes((nds) =>
      nds.map((node) => {
        const newData = { ...node.data };
        if (node.data.label.includes("RSI") && params.rsi_period)
          newData.period = params.rsi_period;
        if (node.data.label.includes("Hareketli") && params.sma_period)
          newData.period = params.sma_period;
        if (node.data.label.includes("SuperTrend")) {
          if (params.supertrend_period)
            newData.period = params.supertrend_period;
          if (params.supertrend_multiplier)
            newData.multiplier = params.supertrend_multiplier;
        }
        if (node.data.label.includes("Bollinger")) {
          if (params.bb_period) newData.period = params.bb_period;
          if (params.bb_std) newData.std = params.bb_std;
        }
        if (node.type === "output") {
          if (params.stop_loss) newData.stopLoss = params.stop_loss;
          if (params.take_profit) newData.takeProfit = params.take_profit;
        }
        return { ...node, data: newData };
      })
    );
    alert("✅ Uygulandı!");
    setOptimizationResult(null);
  };

  // --- BAĞLANTI KONTROLÜ (Gevşetildi) ---
  const isValidConnection = useCallback((connection) => {
    if (connection.source === connection.target) return false;
    // İndikatörler doğrudan mantığa veya custom'a bağlanabilir
    return true; // Kullanıcı özgürlüğü için kısıtlamayı kaldırdık, mantık kontrolü runBacktest'te.
  }, []);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, style: { stroke: "#00ff88" } },
          eds
        )
      );
    },
    [setEdges]
  );

  const getActiveStrategies = () => {
    const actionNode = nodes.find(
      (n) => n.type === "output" || n.data.label.includes("Emri")
    );
    const customNode = nodes.find(
      (n) => n.type === "custom" || n.data.nodeType === "custom_indicator"
    );
    if (!actionNode) {
      const otherNodes = nodes.filter(
        (n) => n.type === "default" || n.type === "logic"
      );
      if (customNode && otherNodes.length === 0) {
        return {
          mode: "pure_custom",
          code:
            customNode.data.code || customNode.data.codeTemplate || userCode,
          actionNode: {
            data: { label: "Varsayılan", stopLoss: 0, takeProfit: 0 },
          },
        };
      }
      throw new Error("Lütfen bir 'AL/SAT Emri' kutusu ekleyin.");
    }

    // Logic node var mı diye bakıyoruz
    const logicNode = nodes.find((n) => n.type === "logic");

    // Tüm indikatörleri bul (Logic'e bağlı olmasa bile çizim için verileri göndereceğiz)
    const rsiNode = nodes.find((n) => n.data.label.includes("RSI"));
    const smaNode = nodes.find((n) => n.data.label.includes("Hareketli"));
    const macdNode = nodes.find((n) => n.data.label.includes("MACD"));
    const bbNode = nodes.find((n) => n.data.label.includes("Bollinger"));
    const stNode = nodes.find((n) => n.data.label.includes("SuperTrend"));
    const stochNode = nodes.find((n) => n.data.label.includes("Stochastic"));

    // Eğer logic node varsa logic modunu kullan, yoksa ve indikatör varsa varsayılan AND gönder
    const logicType = logicNode
      ? logicNode.data.label.includes("VEYA")
        ? "OR"
        : "AND"
      : "AND";

    return {
      mode: "hybrid",
      logic: logicType,
      direction: actionNode.data.label.includes("SAT") ? "short" : "long",
      rsiNode,
      smaNode,
      macdNode,
      bbNode,
      stNode,
      stochNode,
      customCode: "",
      actionNode,
    };
  };

  const runBacktest = async () => {
    setLoading(true);
    setBacktestResult(null);
    try {
      const strategy = getActiveStrategies();
      const customIndicators = nodes
        .filter((n) => n.data.nodeType === "custom_indicator")
        .map((n) => {
          let code = n.data.codeTemplate || n.data.code;
          let paramOverride = "";
          if (n.data.customParams) {
            Object.entries(n.data.customParams).forEach(([key, val]) => {
              paramOverride += `${key} = ${val}\n`;
            });
          }
          return paramOverride + code;
        });
      const standaloneCustom = nodes.find(
        (n) => n.data.nodeType === "custom" && n.data.label.includes("Yeni Kod")
      );
      if (standaloneCustom) {
        customIndicators.push(standaloneCustom.data.code || userCode);
      }

      const payload = {
        symbol: "BTC/USDT",
        timeframe,
        start_date: startDate,
        end_date: endDate,
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
        stoch_oversold: Number(
          strategy.stochNode?.data?.stoch_overbought || 20
        ),
        stoch_overbought: Number(
          strategy.stochNode?.data?.stoch_overbought || 80
        ),
        stop_loss: Number(strategy.actionNode?.data?.stopLoss || 0),
        take_profit: Number(strategy.actionNode?.data?.takeProfit || 0),
      };

      const res = await axios.post(`${API_BASE_URL}/api/backtest`, payload);
      if (!res.data) throw new Error("Boş veri");
      setBacktestResult({
        profit: res.data.profit_percent,
        trades: res.data.total_trades,
        final_money: res.data.final_balance,
        chartData: res.data.chart_data,
        markers: res.data.markers,
        customPlots: res.data.custom_plots,
      });
    } catch (e) {
      alert("Hata: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    if (nodes.some((n) => n.data.label.includes("Özel Strateji"))) {
      alert("Özel Kod modunda optimizasyon henüz desteklenmiyor.");
      return;
    }
    setLoading(true);
    setOptimizationResult(null);
    try {
      let strategy = getActiveStrategies();
      const payload = {
        symbol: "BTC/USDT",
        timeframe,
        start_date: startDate,
        end_date: endDate,
        strategy_logic: strategy.logic,
        trade_direction: strategy.direction,
        custom_code: "",
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
      const res = await axios.post(`${API_BASE_URL}/api/optimize`, payload);
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
      {backtestResult && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#151515",
            padding: "30px",
            borderRadius: "10px",
            border: "1px solid #444",
            zIndex: 1000,
            width: "800px",
            boxShadow: "0 0 50px rgba(0,0,0,0.8)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
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
          <div style={{ color: "white", margin: "10px 0" }}>
            Kar: %{backtestResult.profit} | İşlem: {backtestResult.trades}
          </div>
          <ResultChart
            data={backtestResult.chartData}
            markers={backtestResult.markers}
            customPlots={backtestResult.customPlots}
          />
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
          <p style={{ color: "#ccc", fontSize: "14px" }}>Maksimum Kazanç</p>
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
                <div
                  style={{
                    color: "#aaa",
                    fontSize: "12px",
                    marginBottom: "5px",
                  }}
                >
                  ÖNERİLEN DEĞİŞİKLİK:
                </div>
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
              <div style={{ color: "#aaa", fontStyle: "italic" }}>
                Mevcut ayarlarınız zaten en iyi sonucu veriyor.
              </div>
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
          <div
            style={{ height: "25px", width: "1px", background: "#444" }}
          ></div>
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
              max={new Date().toISOString().split("T")[0]}
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
              max={new Date().toISOString().split("T")[0]}
              style={{
                background: "#222",
                color: "white",
                border: "1px solid #444",
                padding: "5px",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            />
          </div>
          <div
            style={{ height: "25px", width: "1px", background: "#444" }}
          ></div>
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
                display: "flex",
                alignItems: "center",
                gap: "5px",
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
                boxShadow: "0 0 10px rgba(255, 0, 204, 0.3)",
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
            <span>{isCustomMode ? "📜 Kod Editörü" : "🤖 Otomatik Kod"}</span>
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
                  title="Kod içindeki varsayılan değerleri bloğa zorla yazar."
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
