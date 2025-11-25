import React from "react";

export default function Sidebar() {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/label", label);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      style={{
        width: "200px",
        background: "#1e1e1e",
        borderRight: "1px solid #333",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h4 style={{ color: "#fff", marginTop: 0 }}>Araç Kutusu 🛠️</h4>
      <div style={{ color: "#888", fontSize: "12px", marginBottom: "10px" }}>
        Blokları sürükle ve bırak.
      </div>
      {/* --- İNDİKATÖRLER --- */}
      <div
        onDragStart={(event) =>
          onDragStart(event, "default", "⚙️ RSI İndikatörü")
        }
        draggable
        style={dndStyle}
      >
        ⚙️ RSI İndikatörü
      </div>
      <div
        onDragStart={(event) => onDragStart(event, "default", "📊 MACD")}
        draggable
        style={dndStyle}
      >
        📊 MACD
      </div>
      <div
        onDragStart={(event) =>
          onDragStart(event, "default", "📈 Hareketli Ort.")
        }
        draggable
        style={dndStyle}
      >
        📈 Hareketli Ort.
      </div>
      <div style={{ borderTop: "1px solid #333", margin: "10px 0" }}></div>
      // ...
      <h4 style={{ color: "#fff", marginTop: 0 }}>Araç Kutusu 🛠️</h4>
      <div style={{ color: "#888", fontSize: "12px", marginBottom: "10px" }}>
        Blokları sürükle ve bırak.
      </div>
      {/* --- GELİŞMİŞ İNDİKATÖRLER --- */}
      <div
        onDragStart={(event) =>
          onDragStart(event, "default", "⚙️ RSI İndikatörü")
        }
        draggable
        style={dndStyle}
      >
        ⚙️ RSI İndikatörü
      </div>
      <div
        onDragStart={(event) =>
          onDragStart(event, "default", "📈 Hareketli Ort.")
        }
        draggable
        style={dndStyle}
      >
        📈 Hareketli Ort.
      </div>
      <div
        onDragStart={(event) => onDragStart(event, "default", "📊 MACD")}
        draggable
        style={dndStyle}
      >
        📊 MACD
      </div>
      <div
        onDragStart={(event) =>
          onDragStart(event, "default", "🌊 Bollinger Bantları")
        }
        draggable
        style={dndStyle}
      >
        🌊 Bollinger Bantları
      </div>
      {/* --- KODLAMA BLOĞU --- */}
      <div
        onDragStart={(event) =>
          onDragStart(event, "custom", "📜 Özel Strateji (Kod)")
        }
        draggable
        style={{ ...dndStyle, borderColor: "#ffd700", color: "#ffd700" }}
      >
        📜 Özel Strateji (Kod)
      </div>
      <div style={{ borderTop: "1px solid #333", margin: "10px 0" }}></div>
      {/* --- İŞLEM BLOKLARI --- */}
      {/* YENİ EKLENEN: AL EMİRİ */}
      <div
        onDragStart={(event) => onDragStart(event, "output", "💰 AL Emri")}
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
        onDragStart={(event) => onDragStart(event, "output", "💰 SAT Emri")}
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
}

const dndStyle = {
  padding: "10px",
  border: "1px solid #007acc",
  borderRadius: "5px",
  color: "white",
  cursor: "grab",
  background: "#252526",
  textAlign: "center",
  fontSize: "14px",
};
