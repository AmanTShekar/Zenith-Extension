import { useState } from "react";
function App() {
  const [count, setCount] = useState(0);
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
      }}
    >
      <header
        style={{
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: 800,
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              opacity: "1",
              padding: "2rem",
              width: "500px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              paddingTop: "0px",
              paddingRight: "0px",
              textTransform: "uppercase",
            }}
          >
            hello
          </span>{" "}
          <span
            style={{
              color: "#1df8fc",
              fontFamily: "",
              opacity: "1",
              textTransform: "uppercase",
            }}
          >
            editor
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.25rem",
            color: "#94a3b8",
          }}
        >
          End-to-end mutation pipeline is active. Try resizing or changing styles.
        </p>
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        <section
          style={{
            padding: "24px",
            borderRadius: "16px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            hello
          </h2>
          <div
            style={{
              padding: "12px",
              backgroundColor: "#10b981",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: 600,
              width: "572px",
            }}
          >
            Operational
          </div>
        </section>

        <section
          style={{
            padding: "24px",
            borderRadius: "16px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "12px",
            }}
          >
            Counter
          </h2>
          <button
            onClick={() => setCount(count + 1)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#38bdf8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Count is {count}
          </button>
        </section>
      </main>
    </div>
  );
}
export default App;
