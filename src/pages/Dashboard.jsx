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

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchImages();
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
  }, [token]);

  const fetchImages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/gallery`);
      setGallery(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return alert("Select image");

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
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    await axios.delete(`${API_URL}/api/gallery/${id}`);
    fetchImages();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="container-fluid p-0">
      
      {/* Top Navbar (Mobile Friendly) */}
      <nav className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand">Admin Panel</span>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="container py-4">

        <h2 className="mb-4 text-center text-md-start">
          Gallery Management
        </h2>

        {/* Upload Form */}
        <div className="card p-4 shadow-sm mb-4">
          <form onSubmit={handleUpload}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                />
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="col-md-4 d-grid">
                <button
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Responsive Table */}
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead className="table-dark">
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
                          width="70"
                          height="50"
                          style={{
                            objectFit: "cover",
                            borderRadius: "6px"
                          }}
                          alt="preview"
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

      </div>
    </div>
  );
}

export default Dashboard;