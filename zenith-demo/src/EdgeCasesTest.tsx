export function EdgeCasesTest() {
  return (
    <div style={{ padding: "50px", background: "#1e1e1e", color: "white", minHeight: "100vh" }}>
      <h2
        style={{
          height: "32px",
          left: "110px",
          position: "relative",
          top: "6px",
          width: "222px",
        }}
      >
        Edge Cases 1
      </h2>
      {/* 1. Transformed Parent */}
      <div
        className="transformed-parent"
        style={{
          transform: "scale(0.8) rotate(5deg)",
          border: "2px solid red",
          padding: "20px",
          margin: "20px",
          background: "#333",
          height: "82px",
          width: "335px",
          left: "-13px",
          position: "relative",
          top: "395px",
        }}
      >
        <h3>Transformed Parent (Scale 0.8, Rotate 5deg)</h3>
        <div
          className="draggable-item"
          style={{ padding: "10px", background: "#555", cursor: "grab" }}
        >
          Drag me (Transformed)
        </div>
      </div>
      {/* 2. Nested Absolute Containers */}
      <div
        className="relative-container"
        style={{
          width: "400px",
          height: "200px",
          border: "2px solid green",
          margin: "20px",
          background: "#333",
          left: "2px",
          position: "relative",
          top: "-37px",
        }}
      >
        <h3>Relative Container</h3>
        <div
          className="absolute-container"
          style={{
            position: "absolute",
            top: "50px",
            left: "50px",
            width: "200px",
            height: "100px",
            background: "rgba(0,255,0,0.2)",
            border: "1px solid lightgreen",
          }}
        >
          <div
            className="draggable-item"
            style={{ padding: "10px", background: "#555", margin: "10px", cursor: "grab" }}
          >
            Drag me (Nested Absolute)
          </div>
        </div>
      </div>
      {/* 3. Fixed Position Elements */}
      <div
        className="fixed-container"
        style={{
          bottom: "20px",
          right: "20px",
          border: "2px solid blue",
          background: "#333",
          padding: "20px",
          height: "135px",
          width: "200px",
          left: "1090px",
          position: "fixed",
          top: "490px",
        }}
      >
        <h3>Fixed Position</h3>
        <div
          className="draggable-item"
          style={{ padding: "10px", background: "#555", cursor: "grab" }}
        >
          Drag me (Fixed)
        </div>
      </div>
    </div>
  );
}
