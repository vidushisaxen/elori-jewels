// // components/NewsletterSignup.jsx
// 'use client';

// import { useState } from 'react';
// import { subscribeToNewsletter } from '../app/lib/shopify';

// export default function NewsletterSignup() {
//   const [email, setEmail] = useState('');
//   const [status, setStatus] = useState('idle'); // idle, loading, success, error
//   const [message, setMessage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('loading');

//     try {
//       const result = await subscribeToNewsletter(email);
      
//       if (result.data?.customerCreate?.customerUserErrors?.length > 0) {
//         const error = result.data.customerCreate.customerUserErrors[0];
//         setMessage(error.message);
//         setStatus('error');
//       } else {
//         setMessage('Thanks for subscribing!');
//         setStatus('success');
//         setEmail('');
//       }
//     } catch (error) {
//       setMessage('Something went wrong. Please try again.');
//       setStatus('error');
//     }
//   };

//   return (
//     <div className="newsletter-signup">
//       <h3>Subscribe to our newsletter</h3>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Enter your email"
//           required
//           disabled={status === 'loading'}
//         />
//         <button type="submit" disabled={status === 'loading'}>
//           {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
//         </button>
//       </form>
//       {message && (
//         <p className={status === 'success' ? 'success' : 'error'}>
//           {message}
//         </p>
//       )}
//     </div>
//   );
// }



import React from 'react'

const NewsletterSignup = () => {
  return (
    <div>NewsletterSignup</div>
  )
}

export default NewsletterSignup