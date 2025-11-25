import React from "react";

export default function PropertiesPanel({ selectedNode, updateNodeData }) {
  if (!selectedNode) {
    return (
      <div style={panelStyle}>
        <h4 style={{ marginTop: 0 }}>Ayarlar ⚙️</h4>
        <p style={{ color: "#888", fontSize: "12px" }}>
          Düzenlemek için bir kutuya tıkla.
        </p>
      </div>
    );
  }

  const label = selectedNode.data.label;

  // Özel Kod Bloğu
  if (label.includes("Özel Strateji")) {
    return (
      <div style={panelStyle}>
        <h4 style={{ marginTop: 0, color: "#ffd700" }}>Özel Strateji</h4>
        <p style={{ fontSize: "13px" }}>
          Bu blok seçiliyken sağdaki editörde Python kodu yazabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h4
        style={{
          marginTop: 0,
          borderBottom: "1px solid #444",
          paddingBottom: "10px",
        }}
      >
        {label} Ayarları
      </h4>

      {/* --- RSI --- */}
      {label.includes("RSI") && (
        <div style={fieldStyle}>
          <label>Periyot:</label>
          <input
            type="number"
            value={selectedNode.data.period || 14}
            onChange={(e) =>
              updateNodeData(selectedNode.id, {
                period: Number(e.target.value),
              })
            }
            style={inputStyle}
          />
          <label>Kaynak:</label>
          <select
            value={selectedNode.data.source || "close"}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { source: e.target.value })
            }
            style={inputStyle}
          >
            <option value="close">Kapanış (Close)</option>
            <option value="open">Açılış (Open)</option>
          </select>
          <div style={{ margin: "10px 0", borderTop: "1px solid #444" }}></div>
          <p style={{ margin: "0 0 5px 0", color: "#00ff88" }}>Giriş Koşulu</p>
          <div style={{ display: "flex", gap: "5px" }}>
            <select
              value={selectedNode.data.entryOp || "<"}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { entryOp: e.target.value })
              }
              style={{ ...inputStyle, width: "60px" }}
            >
              <option value="<">{"<"}</option>
              <option value=">">{">"}</option>
            </select>
            <input
              type="number"
              placeholder="30"
              value={selectedNode.data.oversold || 30}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  oversold: Number(e.target.value),
                })
              }
              style={inputStyle}
            />
          </div>
          <p style={{ margin: "10px 0 5px 0", color: "#ff4444" }}>
            Çıkış Koşulu
          </p>
          <div style={{ display: "flex", gap: "5px" }}>
            <select
              value={selectedNode.data.exitOp || ">"}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { exitOp: e.target.value })
              }
              style={{ ...inputStyle, width: "60px" }}
            >
              <option value="<">{"<"}</option>
              <option value=">">{">"}</option>
            </select>
            <input
              type="number"
              placeholder="70"
              value={selectedNode.data.overbought || 70}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  overbought: Number(e.target.value),
                })
              }
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* --- SMA/EMA --- */}
      {label.includes("Hareketli") && (
        <div style={fieldStyle}>
          <label>Periyot:</label>
          <input
            type="number"
            value={selectedNode.data.period || 50}
            onChange={(e) =>
              updateNodeData(selectedNode.id, {
                period: Number(e.target.value),
              })
            }
            style={inputStyle}
          />
          <label>Tip:</label>
          <select
            value={selectedNode.data.maType || "SMA"}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { maType: e.target.value })
            }
            style={inputStyle}
          >
            <option value="SMA">SMA</option>
            <option value="EMA">EMA</option>
          </select>
        </div>
      )}

      {/* --- MACD --- */}
      {label.includes("MACD") && (
        <div style={fieldStyle}>
          <label>Hızlı (Fast):</label>
          <input
            type="number"
            value={selectedNode.data.fast || 12}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { fast: Number(e.target.value) })
            }
            style={inputStyle}
          />
          <label>Yavaş (Slow):</label>
          <input
            type="number"
            value={selectedNode.data.slow || 26}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { slow: Number(e.target.value) })
            }
            style={inputStyle}
          />
          <label>Sinyal (Signal):</label>
          <input
            type="number"
            value={selectedNode.data.signal || 9}
            onChange={(e) =>
              updateNodeData(selectedNode.id, {
                signal: Number(e.target.value),
              })
            }
            style={inputStyle}
          />
        </div>
      )}

      {/* --- BOLLINGER BANTLARI (YENİ) --- */}
      {label.includes("Bollinger") && (
        <div style={fieldStyle}>
          <label>Periyot (Uzunluk):</label>
          <input
            type="number"
            value={selectedNode.data.period || 20}
            onChange={(e) =>
              updateNodeData(selectedNode.id, {
                period: Number(e.target.value),
              })
            }
            style={inputStyle}
          />
          <label>Standart Sapma (StdDev):</label>
          <input
            type="number"
            value={selectedNode.data.std || 2}
            step="0.1"
            onChange={(e) =>
              updateNodeData(selectedNode.id, { std: Number(e.target.value) })
            }
            style={inputStyle}
          />
        </div>
      )}

      {/* --- İŞLEM AYARLARI --- */}
      {(label.includes("AL") || label.includes("SAT")) && (
        <div style={fieldStyle}>
          <p
            style={{
              color: label.includes("AL") ? "#00ff88" : "#ff4444",
              margin: "0 0 10px 0",
            }}
          >
            {label.includes("AL") ? "Long Ayarları" : "Short Ayarları"}
          </p>
          <label>Kar Al (% TP):</label>
          <input
            type="number"
            placeholder="0"
            value={selectedNode.data.takeProfit || 0}
            onChange={(e) =>
              updateNodeData(selectedNode.id, {
                takeProfit: Number(e.target.value),
              })
            }
            style={inputStyle}
          />
          <label style={{ marginTop: "10px" }}>Zarar Durdur (% SL):</label>
          <input
            type="number"
            placeholder="0"
            value={selectedNode.data.stopLoss || 0}
            onChange={(e) =>
              updateNodeData(selectedNode.id, {
                stopLoss: Number(e.target.value),
              })
            }
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}

const panelStyle = {
  padding: "15px",
  background: "#252526",
  borderBottom: "1px solid #333",
  color: "white",
  height: "350px",
  overflowY: "auto",
};
const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: "13px",
  marginBottom: "10px",
};
const inputStyle = {
  background: "#1e1e1e",
  border: "1px solid #555",
  color: "white",
  padding: "6px",
  borderRadius: "4px",
  width: "100%",
};
