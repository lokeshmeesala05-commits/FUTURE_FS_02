const emailjs = require('@emailjs/nodejs');
require('dotenv').config();

const sendOTP = async (email, otp) => {
  // Use EmailJS Node.js SDK
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (serviceId && templateId && publicKey && privateKey) {
    console.log('--- EMAILJS SERVICE CONFIGURATION ---');
    console.log('Sending OTP via EmailJS to:', email);
    
    const templateParams = {
      to_email: email,
      otp: otp,
      app_name: 'CRM Pro'
    };

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        {
          publicKey,
          privateKey,
        }
      );
      console.log('EmailJS Response:', response.text);
      return response;
    } catch (error) {
      console.error('EmailJS Error:', error);
      throw error;
    }
  } else {
    // Fallback log if EmailJS keys are missing
    console.log('--- WARNING: EMAILJS NOT FULLY CONFIGURED ---');
    console.log('Verification OTP for', email, 'is:', otp);
    console.log('Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY in your environment.');
    return { status: 'mocked', otp };
  }
};

module.exports = { sendOTP };
