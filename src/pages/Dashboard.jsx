import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchImages();
    }
  }, []);

  // Axios default header set
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
  }, [token]);

  // Fetch Images
  const fetchImages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/gallery`);
      setGallery(res.data);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  // Upload Image
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) return alert("Please select image");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", image);
      formData.append("description", description);

      await axios.post(`${API_URL}/api/gallery`, formData);

      setDescription("");
      setImage(null);
      e.target.reset();
      fetchImages();
    } catch (error) {
      console.log("Upload error:", error);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // Delete Image
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await axios.delete(`${API_URL}/api/gallery/${id}`);
      fetchImages();
    } catch (error) {
      console.log("Delete error:", error);
      alert("Delete failed ❌");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", background: "#1e1e2f", color: "white" }}
    >
      {/* Sidebar */}
      <div className="bg-dark p-4" style={{ width: "250px" }}>
        <h3 className="mb-4">Admin Panel</h3>
        <button className="btn btn-danger w-100" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-5">
        <h2 className="mb-4">Gallery Management</h2>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="mb-4">
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {/* Images Table */}
        <table className="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Description</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {gallery.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No Images Found
                </td>
              </tr>
            ) : (
              gallery.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={`${API_URL}/uploads/${item.image}`}
                      width="80"
                      height="60"
                      style={{ objectFit: "cover", borderRadius: "6px" }}
                      alt="gallery"
                    />
                  </td>
                  <td>{item.description || "—"}</td>
                  <td>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;