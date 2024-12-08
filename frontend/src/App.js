import { useState, useEffect } from "react";
import "./App.css";
import Photocard from "./component/Photocard";
import axios from "axios";

function App() {
  const [images, setImages] = useState([]); // State to store fetched images
  const [file, setFile] = useState(null); // State to store the selected file
  const [lat, setLat] = useState(""); // State for latitude
  const [long, setLong] = useState(""); // State for longitude
  const [title, setTitle] = useState(""); // State for image title
  const [description, setDescription] = useState(""); // State for image description

  // Fetch images from the server
  const fetchImages = async () => {
    try {
      const result = await axios.get("http://localhost:8000/api/latest");
      setImages(result.data); // Assuming the server sends an array of images
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // Handle file upload
  const upload = async () => {
    if (!file || !lat || !long) {
      alert("Please provide all required details (file, latitude, and longitude).");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file); // 'photo' matches the backend's field name
    formData.append("lat", lat);
    formData.append("long", long);
    formData.append("title", title || "Untitled");
    formData.append("description", description || "No description provided.");

    try {
      const response = await axios.post("http://localhost:8000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully");
      fetchImages(); // Refresh the image list after upload
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const SortByNearest = async () => {
    if (!lat || !long) {
      alert("Please enter your latitude and longitude. In the same input provided for upload");
      return;
    }
  
    try {
      const response = await axios.get("http://localhost:8000/api/nearest", {
        params: { lat, long },
      });
  
      if (response.data && Array.isArray(response.data)) {
        setImages(response.data); // Update state with sorted images
      } else {
        alert("Unexpected response format from server.");
      }
    } catch (error) {
      console.error("Error sorting by nearest:", error);
      alert("Failed to sort images by nearest. Please try again.");
    }
  };
  

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="App">
      <div className="upload-form">
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          style={{ marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Longitude"
          value={long}
          onChange={(e) => setLong(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <button onClick={upload}>Upload</button>
      </div>

      <div className="sort-btn">
        <button onClick={SortByNearest}>Sort by Nearest</button>
      </div>

      <div className="card-grid">
        {images.length > 0 ? (
          images.map((image, index) => (
            <Photocard
              key={index}
              imageUrl={`http://localhost:8000/uploads/${encodeURIComponent(image.fileName)}`} // Adjust based on server response
              title={image.title}
              description={image.description}
              latitude={image.latitude}
              longitude={image.longitude}
              uploadDate={image.uploadDate}
            />
          ))
        ) : (
          <p>No images available</p>
        )}
      </div>
    </div>
  );
}

export default App;
