// Test script to verify OTP creation and verification flow
require('dotenv').config();
const db = require('./config/database');
const User = require('./models/User');

async function testOTPFlow() {
  try {
    await db.authenticate();
    console.log('DB connected');

    // Create a test user with OTP
    const email = `otp_test_${Date.now()}@test.com`;
    const otp = '123456';
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    console.log('\n--- CREATING USER ---');
    console.log('otpExpires JS Date:', otpExpires.toISOString());
    console.log('otpExpires getTime:', otpExpires.getTime());
    console.log('Date.now():', Date.now());
    console.log('Should be valid for 15 mins');

    const user = await User.create({
      name: 'OTP Test',
      email,
      password: 'test',
      otp,
      otpExpires,
      isVerified: false
    });

    console.log('\n--- READING BACK FROM DB ---');
    const u = await User.findByPk(user.id);
    console.log('otpExpires from DB:', u.otpExpires);
    console.log('typeof otpExpires:', typeof u.otpExpires);
    
    if (typeof u.otpExpires === 'string') {
      console.log('DB returned a STRING - need to parse as UTC');
      console.log('new Date(value):', new Date(u.otpExpires).toISOString(), '-> getTime:', new Date(u.otpExpires).getTime());
      console.log('new Date(value+"Z"):', new Date(u.otpExpires + 'Z').toISOString(), '-> getTime:', new Date(u.otpExpires + 'Z').getTime());
    } else {
      console.log('DB returned a Date object');
      console.log('getTime:', u.otpExpires.getTime());
    }

    console.log('Date.now():', Date.now());

    // Check expiration the OLD way (broken)
    const oldWay = u.otpExpires < Date.now();
    console.log('\n--- OLD CHECK (u.otpExpires < Date.now()) ---');
    console.log('Expired?', oldWay, '(should be FALSE for a just-created OTP)');

    // Check expiration with explicit UTC parsing
    const expiresMs = typeof u.otpExpires === 'string'
      ? new Date(u.otpExpires.endsWith('Z') ? u.otpExpires : u.otpExpires + 'Z').getTime()
      : new Date(u.otpExpires).getTime();
    const newWay = expiresMs < Date.now();
    console.log('\n--- NEW CHECK (UTC-forced) ---');
    console.log('expiresMs:', expiresMs);
    console.log('Expired?', newWay, '(should be FALSE for a just-created OTP)');

    // Cleanup
    await user.destroy();
    console.log('\nTest user cleaned up.');

  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await db.close();
  }
}

testOTPFlow();
