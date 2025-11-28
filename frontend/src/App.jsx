import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/tasks";


function App() {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_BASE_URL);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await axios.post(API_BASE_URL, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      });
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      await fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task.");
    }
  };

  const getNextStatus = (current) => {
    const order = ["pending", "in-progress", "completed"];
    const idx = order.indexOf(current);
    return order[(idx + 1) % order.length];
  };

  const handleStatusChange = async (task) => {
    try {
      const nextStatus = getNextStatus(task.status || "pending");
      const { _id, createdAt, updatedAt, __v, ...rest } = task;

      const res = await axios.put(`${API_BASE_URL}/${task._id}`, {
        ...rest,
        status: nextStatus,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data : t))
      );
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task status.");
    }
  };

  const todo = tasks.filter((t) => t.status === "pending" || !t.status);
  const inProgress = tasks.filter((t) => t.status === "in-progress");
  const completed = tasks.filter((t) => t.status === "completed");

  const columns = [
    { key: "todo", title: "To-do", color: "#f97316", items: todo },
    { key: "in-progress", title: "In Progress", color: "#3b82f6", items: inProgress },
    { key: "completed", title: "Completed", color: "#22c55e", items: completed },
  ];

  const priorityLabel = (p) =>
    p ? p.charAt(0).toUpperCase() + p.slice(1) : "Medium";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",              // full width so no grey strip
        boxSizing: "border-box",
        margin: 0,
        padding: "1.75rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          margin: "0 0 1.5rem 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              letterSpacing: "0.03em",
            }}
          >
            TaskFlow
          </h1>
          <p
            style={{
              marginTop: "0.4rem",
              fontSize: "0.9rem",
              color: "#9ca3af",
            }}
          >
            A calm, minimal Kanban board for everyday tasks.
          </p>
        </div>

        {/* Total tasks on the right, styled like a small stat */}
        <div
          style={{
            fontSize: "0.8rem",
            color: "#9ca3af",
            textAlign: "right",
          }}
        >
          <div style={{ opacity: 0.9 }}>Total tasks</div>
          <div style={{ fontWeight: 600, color: "#e5e7eb" }}>{tasks.length}</div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "320px minmax(0, 1fr)",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Create Task panel */}
        <section
          style={{
            backgroundColor: "#020617",
            borderRadius: "18px",
            padding: "1.5rem",
            border: "1px solid #111827",
            boxShadow: "0 20px 45px rgba(0,0,0,0.8)",
            position: "sticky",
            top: "1.75rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.05rem",
              margin: 0,
              marginBottom: "0.25rem",
            }}
          >
            Create Task
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: "1.1rem",
              fontSize: "0.85rem",
              color: "#9ca3af",
            }}
          >
            Add clear, small tasks you can actually finish today.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "0.9rem" }}>
              <label
                htmlFor="title"
                style={{
                  display: "block",
                  marginBottom: "0.3rem",
                  fontSize: "0.85rem",
                }}
              >
                Task Title <span style={{ color: "#f97316" }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                placeholder="Finish ProU full-stack assessment"
                value={formData.title}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.7rem 0.85rem",
                  borderRadius: "10px",
                  border: "1px solid #1f2933",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                  outline: "none",
                  fontSize: "0.9rem",
                  transition:
                    "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4b5563";
                  e.target.style.boxShadow =
                    "0 0 0 1px rgba(148,163,184,0.7)";
                  e.target.style.backgroundColor = "#020818";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1f2933";
                  e.target.style.boxShadow = "none";
                  e.target.style.backgroundColor = "#020617";
                }}
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label
                htmlFor="description"
                style={{
                  display: "block",
                  marginBottom: "0.3rem",
                  fontSize: "0.85rem",
                }}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Optional context or notes…"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.7rem 0.85rem",
                  borderRadius: "10px",
                  border: "1px solid #1f2933",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                  outline: "none",
                  resize: "vertical",
                  fontSize: "0.9rem",
                  transition:
                    "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4b5563";
                  e.target.style.boxShadow =
                    "0 0 0 1px rgba(148,163,184,0.7)";
                  e.target.style.backgroundColor = "#020818";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1f2933";
                  e.target.style.boxShadow = "none";
                  e.target.style.backgroundColor = "#020617";
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  htmlFor="priority"
                  style={{
                    display: "block",
                    marginBottom: "0.3rem",
                    fontSize: "0.85rem",
                  }}
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #1f2933",
                    backgroundColor: "#020617",
                    color: "#e5e7eb",
                    outline: "none",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="dueDate"
                  style={{
                    display: "block",
                    marginBottom: "0.3rem",
                    fontSize: "0.85rem",
                  }}
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #1f2933",
                    backgroundColor: "#020617",
                    color: "#e5e7eb",
                    outline: "none",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                borderRadius: "999px",
                border: "1px solid #e5e7eb",
                backgroundColor: submitting ? "#e5e7eb" : "transparent",
                color: submitting ? "#020617" : "#e5e7eb",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.92rem",
                letterSpacing: "0.03em",
                transition: "all 0.18s ease-out",
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                  e.currentTarget.style.color = "#020617";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#e5e7eb";
                }
              }}
            >
              {submitting ? "Saving…" : "Add Task"}
            </button>

            {error && (
              <p
                style={{
                  color: "#f97316",
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                }}
              >
                {error}
              </p>
            )}
          </form>
        </section>

        {/* Kanban board */}
        <section
          style={{
            borderRadius: "18px",
            padding: "1.25rem 1.3rem 1.5rem",
            border: "1px solid #111827",
            boxShadow: "0 20px 45px rgba(0,0,0,0.8)",
            backgroundColor: "#020617",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                margin: 0,
              }}
            >
              Board
            </h2>
            <button
              type="button"
              onClick={fetchTasks}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "999px",
                border: "1px solid #4b5563",
                backgroundColor: "transparent",
                color: "#e5e7eb",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.16s ease-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#111827";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "1rem",
            }}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                style={{
                  backgroundColor: "#020617",
                  borderRadius: "14px",
                  border: "1px solid #111827",
                  padding: "0.9rem 0.9rem 1rem",
                  minHeight: "260px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.7rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "999px",
                        backgroundColor: col.color,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {col.title}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                    }}
                  >
                    {col.items.length}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                    flex: 1,
                  }}
                >
                  {col.items.length === 0 ? (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        marginTop: "0.3rem",
                      }}
                    >
                      No tasks in this column.
                    </p>
                  ) : (
                    col.items.map((task) => (
                      <div
                        key={task._id}
                        style={{
                          borderRadius: "12px",
                          backgroundColor: "#020617",
                          border: "1px solid #111827",
                          padding: "0.75rem 0.8rem 0.7rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.35rem",
                          boxShadow: "0 8px 18px rgba(0,0,0,0.7)",
                          transition:
                            "transform 0.14s ease-out, box-shadow 0.14s ease-out, border-color 0.14s ease-out",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 12px 26px rgba(0,0,0,0.8)";
                          e.currentTarget.style.borderColor = "#1f2937";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 18px rgba(0,0,0,0.7)";
                          e.currentTarget.style.borderColor = "#111827";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "0.6rem",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                color:
                                  task.status === "completed"
                                    ? "#d1d5db"
                                    : "#e5e7eb",
                                textDecoration:
                                  task.status === "completed"
                                    ? "line-through"
                                    : "none",
                              }}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p
                                style={{
                                  margin: "0.2rem 0 0",
                                  fontSize: "0.8rem",
                                  color: "#9ca3af",
                                }}
                              >
                                {task.description}
                              </p>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.15rem 0.55rem",
                              borderRadius: "999px",
                              border: "1px solid #1f2937",
                              color: "#e5e7eb",
                            }}
                          >
                            {priorityLabel(task.priority)}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "0.25rem",
                            fontSize: "0.78rem",
                            color: "#9ca3af",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.2rem",
                            }}
                          >
                            {task.dueDate && (
                              <span>
                                Due{" "}
                                <strong>
                                  {new Date(
                                    task.dueDate
                                  ).toLocaleDateString()}
                                </strong>
                              </span>
                            )}
                            <span>
                              Status{" "}
                              <strong
                                style={{ textTransform: "capitalize" }}
                              >
                                {task.status || "pending"}
                              </strong>
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.3rem",
                              alignItems: "flex-end",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleStatusChange(task)}
                              style={{
                                padding: "0.27rem 0.75rem",
                                borderRadius: "999px",
                                border: "1px solid #374151",
                                backgroundColor: "transparent",
                                color: "#e5e7eb",
                                fontSize: "0.78rem",
                                cursor: "pointer",
                                transition: "background-color 0.15s ease-out",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#111827";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              Next: {getNextStatus(task.status || "pending")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(task._id)}
                              style={{
                                padding: "0.25rem 0.4rem",
                                borderRadius: "999px",
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#f97316",
                                fontSize: "0.78rem",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer – only your credit on the right */}
      <footer
        style={{
          width: "100%",
          marginTop: "1.6rem",
          fontSize: "0.78rem",
          color: "#6b7280",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          borderTop: "1px solid #111827",
          paddingTop: "0.6rem",
        }}
      >
        Built by <strong style={{ color: "#e5e7eb", marginLeft: 4 }}>Tushar Chahar</strong>
      </footer>
    </div>
  );
}

export default App;
