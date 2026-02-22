import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [gallery, setGallery] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/");
    fetchImages();
  }, []);

  // Fetch Images
  const fetchImages = async () => {
    const res = await axios.get("http://localhost:5000/api/gallery");
    setGallery(res.data);
  };

  // Upload Image
  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);

    await axios.post("http://localhost:5000/api/gallery", formData, {
      headers: {
        Authorization: token,
      },
    });

    setDescription("");
    setImage(null);
    fetchImages();
  };

  // Delete Image
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/gallery/${id}`, {
      headers: {
        Authorization: token,
      },
    });

    fetchImages();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#1e1e2f", color: "white" }}>
      
      {/* Sidebar */}
      <div className="bg-dark p-4" style={{ width: "250px" }}>
        <h3 className="mb-4">Admin Panel</h3>
        <button className="btn btn-danger" onClick={handleLogout}>
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

          <button className="btn btn-primary">Upload</button>
        </form>

        {/* Images Table */}
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>Image</th>
              <th>Description</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {gallery.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    width="80"
                  />
                </td>
                <td>{item.description}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default Dashboard;