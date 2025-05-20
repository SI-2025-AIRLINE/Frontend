import React from 'react';
import axios from 'axios';

const TestICSDownload = () => {
  const downloadICS = async () => {
    try {
      const response = await axios.get('http://localhost:5165/api/Booking/export-ics/1', {
        responseType: 'blob',
      });


    let filename = 'flight-booking.ics'; 


      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/calendar' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'flight-booking.ics');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>ICS Download Test</h2>
      <button onClick={downloadICS}>Download Flight ICS</button>
    </div>
  );
};

export default TestICSDownload;
