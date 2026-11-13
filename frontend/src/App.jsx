

import { useEffect, useState } from "react";
import {
  Activity, Bell, ChartNoAxesCombined, ChevronRight, CircleHelp,
  Clock3, CloudUpload, Download, FileImage, History, LayoutDashboard,
  Menu, ScanEye, Settings, ShieldCheck, Sparkles, Trash2, X, Eye,
  Server, SlidersHorizontal, RefreshCw
} from "lucide-react";
import "./App.css";

const DEFAULT_API = "http://127.0.0.1:5000/api/predict";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analysis", label: "Image Analysis", icon: ScanEye },
  { id: "history", label: "History", icon: History },
  { id: "reports", label: "Reports", icon: ChartNoAxesCombined },
];

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem("retina_history") || "[]");
  } catch {
    return [];
  }
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem("retina_api_url") || DEFAULT_API
  );
  const [history, setHistory] = useState(readHistory);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("retina_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("retina_api_url", apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const navigate = (nextPage) => {
    setPage(nextPage);
    setError("");
    setMessage("");
    setSidebarOpen(window.innerWidth > 720);
  };

  const chooseFile = (selected) => {
    if (!selected) return;

    if (!["image/jpeg", "image/png"].includes(selected.type)) {
      setError("Please choose a PNG or JPG image.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
    setMessage("");
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  const runPrediction = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Prediction request failed.");
      }

      setResult(data);

      const record = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        grade: data.predicted_label || `Grade ${data.predicted_class}`,
        predictedClass: data.predicted_class,
        confidence: Number(data.confidence),
        probabilities: data.probabilities || {},
        date: new Date().toISOString(),
      };

      setHistory((previous) => [record, ...previous]);
      setMessage("Analysis completed successfully.");
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to Flask. Check that the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = (id) => {
    setHistory((items) => items.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm("Delete all saved prediction history?")) {
      setHistory([]);
    }
  };

  const exportHistory = () => {
    if (!history.length) {
      setError("There are no prediction records to export.");
      return;
    }

    const rows = [
      ["Image", "Predicted Grade", "Confidence", "Date"],
      ...history.map((item) => [
        item.name,
        item.grade,
        `${(item.confidence * 100).toFixed(2)}%`,
        new Date(item.date).toLocaleString(),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "retinopathy_prediction_history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const total = history.length;
  const averageConfidence = total
    ? history.reduce((sum, item) => sum + item.confidence, 0) / total
    : 0;

  const gradeCounts = [0, 1, 2, 3, 4].map((grade) => ({
    grade,
    count: history.filter((item) => Number(item.predictedClass) === grade).length,
  }));

  const pageTitle = {
    dashboard: "Dashboard",
    analysis: "Image Analysis",
    history: "Prediction History",
    reports: "Reports & Analytics",
    settings: "Application Settings",
    help: "Help & Support",
  }[page];

  const SidebarLink = ({ id, label, icon: Icon }) => (
    <button
      className={`nav-item ${page === id ? "active" : ""}`}
      onClick={() => navigate(id)}
      title={label}
    >
      <Icon size={19} />
      {sidebarOpen && <span>{label}</span>}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, note, color }) => (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon /></div>
      <div>
        <span>{label}</span>
        <h3>{value}</h3>
        <small>{note}</small>
      </div>
    </div>
  );

  const HistoryTable = () => (
    <div className="history-table">
      {history.length === 0 ? (
        <div className="history-empty">
          <History size={35} />
          <h3>No prediction history yet</h3>
          <p>Analyze your first image to create a record here.</p>
          <button className="secondary-button" onClick={() => navigate("analysis")}>
            Start image analysis <ChevronRight size={16} />
          </button>
        </div>
      ) : history.map((item) => (
        <div className="history-row" key={item.id}>
          <div className="history-file-icon"><FileImage /></div>
          <div className="history-name">
            <b>{item.name}</b>
            <span>{new Date(item.date).toLocaleString()}</span>
          </div>
          <span className="grade-tag">{item.grade}</span>
          <b className="history-confidence">
            {(item.confidence * 100).toFixed(2)}%
          </b>
          <button
            className="icon-button delete-button"
            title="Delete record"
            onClick={() => deleteHistoryItem(item.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="brand">
          <div className="brand-icon"><Eye size={25} /></div>
          {sidebarOpen && (
            <div>
              <h2>RetinaAI</h2>
              <span>INTELLIGENCE PLATFORM</span>
            </div>
          )}
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav>
          {NAV_ITEMS.map((item) => <SidebarLink key={item.id} {...item} />)}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-label">PREFERENCES</div>
          <SidebarLink id="settings" label="Settings" icon={Settings} />
          <SidebarLink id="help" label="Help & Support" icon={CircleHelp} />
          <div className="model-status">
            <span className="status-dot" />
            {sidebarOpen && <span>Backend configured</span>}
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu />
          </button>
          <div className="breadcrumb">Workspace <span>/</span> {pageTitle}</div>
          <div className="top-right">
            <span className="online-label"><span className="status-dot" /> Application Ready</span>
            <div className="avatar">AI</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow"><Sparkles size={15} /> RETINOPATHY DETECTION SYSTEM</div>
              <h1>{pageTitle}</h1>
              <p>
                {page === "dashboard" && "Your AI-powered retinal image analysis workspace."}
                {page === "analysis" && "Upload and analyze retinal images using your trained model."}
                {page === "history" && "Review and manage your previous prediction records."}
                {page === "reports" && "Explore prediction activity and export your results."}
                {page === "settings" && "Configure your application and backend connection."}
                {page === "help" && "Guidance for using and troubleshooting your application."}
              </p>
            </div>
            <div className="date-chip"><Clock3 size={16} /> {new Date().toLocaleDateString()}</div>
          </section>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {page === "dashboard" && (
            <>
              <section className="stats-grid">
                <StatCard icon={Activity} label="Selected Architecture" value="Hybrid Model" note="EfficientNetB3 + MobileNetV2" color="teal" />
                <StatCard icon={ScanEye} label="Classification Classes" value="05 Grades" note="Grade 0 to Grade 4" color="blue" />
                <StatCard icon={ShieldCheck} label="Images Analyzed" value={total} note="Saved in this browser" color="purple" />
              </section>

              <section className="dashboard-grid">
                <div className="panel">
                  <div className="panel-heading">
                    <div><h2>Get started</h2><p>Choose what you want to do next.</p></div>
                  </div>
                  <button className="action-card" onClick={() => navigate("analysis")}>
                    <div className="action-icon"><ScanEye /></div>
                    <div><b>Analyze a new image</b><span>Upload an image and run AI prediction</span></div>
                    <ChevronRight />
                  </button>
                  <button className="action-card" onClick={() => navigate("history")}>
                    <div className="action-icon blue"><History /></div>
                    <div><b>View prediction history</b><span>Review previously analyzed images</span></div>
                    <ChevronRight />
                  </button>
                  <button className="action-card" onClick={() => navigate("reports")}>
                    <div className="action-icon purple"><ChartNoAxesCombined /></div>
                    <div><b>View reports</b><span>Explore your analysis statistics</span></div>
                    <ChevronRight />
                  </button>
                </div>

                <div className="panel">
                  <div className="panel-heading">
                    <div><h2>Recent activity</h2><p>Latest predictions in this browser.</p></div>
                    <button className="text-button" onClick={() => navigate("history")}>View all</button>
                  </div>
                  {history.length ? (
                    history.slice(0, 4).map((item) => (
                      <div className="activity-item" key={item.id}>
                        <div className="activity-dot"><FileImage size={16} /></div>
                        <div className="activity-info">
                          <b>{item.name}</b>
                          <span>{item.grade} · {(item.confidence * 100).toFixed(2)}%</span>
                        </div>
                        <ChevronRight size={16} />
                      </div>
                    ))
                  ) : (
                    <div className="history-empty compact">
                      <History size={28} />
                      <p>Your recent activity will appear here.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {page === "analysis" && (
            <section className="workspace-grid">
              <div className="panel upload-panel">
                <div className="panel-heading">
                  <div><h2>Upload retinal image</h2><p>Choose a PNG or JPG image for analysis.</p></div>
                  <span className="step-number">01</span>
                </div>

                <label className="upload-zone">
                  <input type="file" accept="image/png,image/jpeg" onChange={(e) => chooseFile(e.target.files?.[0])} />
                  {preview ? (
                    <img src={preview} className="preview-image" alt="Selected retinal image" />
                  ) : (
                    <>
                      <div className="upload-icon"><CloudUpload size={34} /></div>
                      <h3>Drop your image here</h3>
                      <p>or click to browse files</p>
                      <span className="file-types">PNG, JPG or JPEG</span>
                    </>
                  )}
                </label>

                {file && (
                  <div className="file-info">
                    <FileImage size={19} /><span>{file.name}</span>
                    <button onClick={clearImage}><X size={17} /></button>
                  </div>
                )}

                <button className="analyze-button" onClick={runPrediction} disabled={loading || !file}>
                  {loading ? <><RefreshCw className="spin" /> Analyzing...</> : <><Sparkles size={18} /> Analyze Image</>}
                </button>
                <p className="privacy-note"><ShieldCheck size={14} /> Processed by your local Flask backend.</p>
              </div>

              <div className="panel result-panel">
                <div className="panel-heading">
                  <div><h2>Prediction results</h2><p>Model classification and confidence scores.</p></div>
                  <span className="step-number">02</span>
                </div>

                {result ? (
                  <>
                    <div className="result-highlight">
                      <div className="result-symbol"><ScanEye size={28} /></div>
                      <div><span>Predicted category</span><h2>{result.predicted_label || `Grade ${result.predicted_class}`}</h2></div>
                      <div className="confidence">
                        <strong>{(Number(result.confidence) * 100).toFixed(2)}%</strong>
                        <span>Confidence</span>
                      </div>
                    </div>
                    <h3 className="prob-title">Class probability distribution</h3>
                    <div className="prob-list">
                      {Object.entries(result.probabilities || {}).map(([label, value]) => (
                        <div className="prob-row" key={label}>
                          <div className="prob-label"><span>{label}</span><b>{(Number(value) * 100).toFixed(2)}%</b></div>
                          <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, Number(value) * 100))}%` }} /></div>
                        </div>
                      ))}
                    </div>
                    <div className="result-note">Research prototype output. Not a medical diagnosis.</div>
                    <button className="secondary-button new-analysis" onClick={clearImage}>New analysis <RefreshCw size={15} /></button>
                  </>
                ) : (
                  <div className="empty-result">
                    <div className="empty-icon"><ChartNoAxesCombined size={38} /></div>
                    <h3>Awaiting analysis</h3>
                    <p>Upload an image and click Analyze Image to see your model's prediction.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {page === "history" && (
            <section className="panel history-panel">
              <div className="panel-heading">
                <div><h2>All prediction records</h2><p>{total} saved predictions in this browser.</p></div>
                <div className="panel-actions">
                  <button className="secondary-button" onClick={exportHistory}><Download size={15} /> Export CSV</button>
                  <button className="secondary-button danger-outline" onClick={clearHistory}><Trash2 size={15} /> Clear all</button>
                </div>
              </div>
              <HistoryTable />
            </section>
          )}

          {page === "reports" && (
            <>
              <section className="stats-grid">
                <StatCard icon={FileImage} label="Total Predictions" value={total} note="Saved prediction records" color="teal" />
                <StatCard icon={Activity} label="Average Confidence" value={`${(averageConfidence * 100).toFixed(2)}%`} note="Across saved predictions" color="blue" />
                <StatCard icon={ChartNoAxesCombined} label="Grades Observed" value={gradeCounts.filter((g) => g.count > 0).length} note="Distinct predicted grades" color="purple" />
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <div><h2>Predicted grade distribution</h2><p>Distribution among saved predictions only.</p></div>
                  <button className="secondary-button" onClick={exportHistory}><Download size={15} /> Export CSV</button>
                </div>
                <div className="report-bars">
                  {gradeCounts.map(({ grade, count }) => (
                    <div className="report-bar-row" key={grade}>
                      <b>Grade {grade}</b>
                      <div className="progress-track"><div className="progress-fill" style={{ width: `${total ? (count / total) * 100 : 0}%` }} /></div>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
                <p className="report-disclaimer">These charts summarize application usage, not independent model accuracy or clinical performance.</p>
              </section>
              <section className="panel history-panel">
                <div className="panel-heading"><div><h2>Recent predictions</h2><p>Latest saved analysis records.</p></div></div>
                <HistoryTable />
              </section>
            </>
          )}

          {page === "settings" && (
            <section className="panel settings-panel">
              <div className="panel-heading">
                <div><h2>Backend connection</h2><p>Set the Flask prediction endpoint used by this application.</p></div>
                <Server size={23} />
              </div>
              <label className="field-label" htmlFor="api-url">Prediction API URL</label>
              <input id="api-url" className="settings-input" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
              <p className="field-help">Default local endpoint: {DEFAULT_API}</p>
              <button className="analyze-button settings-save" onClick={() => {
                localStorage.setItem("retina_api_url", apiUrl);
                setMessage("API settings saved.");
              }}>Save settings <ShieldCheck size={17} /></button>
              <div className="settings-divider" />
              <div className="settings-row">
                <div><b>Prediction history</b><span>Saved locally in this browser using localStorage.</span></div>
                <span className="settings-badge">Enabled</span>
              </div>
              <div className="settings-row">
                <div><b>Application model</b><span>Hybrid EfficientNetB3 + MobileNetV2 candidate.</span></div>
                <span className="settings-badge">Configured</span>
              </div>
              <div className="settings-row">
                <div><b>Preferences</b><span>Light dashboard theme.</span></div>
                <SlidersHorizontal size={19} />
              </div>
            </section>
          )}

          {page === "help" && (
            <section className="help-grid">
              <div className="panel">
                <div className="panel-heading"><div><h2>How to use the application</h2><p>Follow these steps to analyze an image.</p></div></div>
                {[
                  ["01", "Open Image Analysis", "Select Image Analysis from the sidebar."],
                  ["02", "Upload an image", "Choose a PNG or JPG retinal image from your computer."],
                  ["03", "Run prediction", "Click Analyze Image and wait for the Flask API."],
                  ["04", "Review the result", "Read the predicted grade and probability distribution."],
                  ["05", "Review records", "Open History or Reports to review saved predictions."],
                ].map(([number, title, description]) => (
                  <div className="help-step" key={number}>
                    <span>{number}</span><div><b>{title}</b><p>{description}</p></div>
                  </div>
                ))}
              </div>
              <div className="panel">
                <div className="panel-heading"><div><h2>Troubleshooting</h2><p>Common issues and how to fix them.</p></div></div>
                <div className="faq-item"><b>Prediction says Cannot connect to Flask</b><p>Start the backend in its terminal using <code>python app.py</code>. Keep it running.</p></div>
                <div className="faq-item"><b>Image upload is rejected</b><p>Use a PNG or JPG image and check that the file is valid.</p></div>
                <div className="faq-item"><b>History disappeared</b><p>History is stored in this browser. Clearing browser site data may remove it.</p></div>
                <div className="faq-item"><b>What does confidence mean?</b><p>It is the model's score for its selected class, not a guarantee that the prediction is correct.</p></div>
                <div className="help-warning"><ShieldCheck size={18} /> This is an academic research prototype, not a substitute for professional medical evaluation.</div>
              </div>
            </section>
          )}

          <footer>
            <span>RetinaAI · Retinopathy Detection System</span>
            <span>Academic research prototype · AI-assisted analysis</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
