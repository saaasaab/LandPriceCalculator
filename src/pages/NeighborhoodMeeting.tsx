import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NeighborhoodMeeting.scss'; // Import the CSS

const NeighborhoodMeeting = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const contactAPI = async () => {
    const isLocalhost = window.location.hostname === 'localhost';
    const url =   isLocalhost  ? 'http://localhost:8080/' : 'https://landpricecalculatorapi.onrender.com';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, name})
      }
      );
      return await res.json();
    } catch (error) {
      console.log(error)
    }
   
  }

  const getData = async () => {
    const contacted = await contactAPI();
    console.log(`contacted `, contacted);

    if (contacted) {
      navigate('/1579-se-3rd-ct-confirmation');
    }
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ name: '', email: '' });

    let formIsValid = true;

    if (!name) {
      setErrors((prev) => ({ ...prev, name: 'Name is required' }));
      formIsValid = false;
    }

    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      formIsValid = false;
    } else if (!isValidEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email address' }));
      formIsValid = false;
    }

    if (formIsValid) {
      sendEmail(name, email);
      getData()

      // if(contacted){

      // }
    }
  };

  const sendEmail = (name: string, email: string) => {
    // const emailBody = `New registration for the meeting:
    //   Name: ${name}
    //   Email: ${email}`;

    // console.log(`Email sent to ExpanseInvestments@gmail.com with the following content:`);
    // console.log(emailBody);
  };

  return (
    <div className="registration-page">
      <h1>Register for the Building Project Meeting</h1>
      <p>
        You're invited to a meeting about our new professional building at 1579 SE 3rd Ct, Canby, Oregon, featuring a small coffee shop to service the building.
        The meeting will take place on <strong>November 20th at 6 PM</strong> at the fire station with Zoom access available.
      </p>
      <p>Please register by providing your name and email below, and you'll receive more information.</p>

      <form onSubmit={handleSubmit}>
        <div className="registration-container">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <span>{errors.name}</span>}
        </div>

        <div className="registration-container">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span>{errors.email}</span>}
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default NeighborhoodMeeting;
