import React from 'react';
import "./Photocard.css";

function Photocard({ imageUrl, title, description, latitude, longitude, uploadDate }) {
  return (
    <div className="card-container">
      <div 
        className="img" 
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      <div className="img-description">
        <h3>{title}</h3>
        <p>{description}</p>
        <p><strong>Latitude:</strong> {latitude}</p>
        <p><strong>Longitude:</strong> {longitude}</p>
        <p><strong>Uploaded on:</strong> {new Date(uploadDate).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default Photocard;
