import axios from 'axios';

// API Configuration
// Update this to your backend server URL
// const API_BASE_URL = 'http://localhost:5000'; // Raspberry Pi IP or your backend URL
const API_BASE_URL = ' https://cursory-anitra-disproportionally.ngrok-free.dev'; // Raspberry Pi IP or your backend URL
// const API_BASE_URL = 'http://192.168.31.196:5000'; // Raspberry Pi IP or your backend URL

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

export const API_ENDPOINTS = {
  // Auth endpoints
  USER_LOGIN: `/api/auth/userLogin`,
  USER_REGISTER: `/api/add/addusers`,
  ADMIN_LOGIN: `/api/auth/AdminLogin`,
  ADMIN_REGISTER: `/api/add/addadmin`,
  OFFICER_LOGIN: `/api/auth/officerLogin`,
  OFFICER_REGISTER: `/api/add/addofficer`,
  // Officer Management endpoints
  GET_ALL_OFFICERS: `/api/get/getAllOfficers`,
  UPDATE_OFFICER: `/api/update/updateOfficer`,
  DELETE_OFFICER: `/api/delete/deleteOfficer`,
  // User Management endpoints
  GET_ALL_USERS: `/api/get/getAllUsers`,
  UPDATE_USER: `/api/update/updateUser`,
  DELETE_USER: `/api/delete/deleteUser`,
  // Missing Person endpoints
  REGISTER_MISSING_PERSON: `/api/missing/register`,
  GET_ALL_MISSING_PERSONS: `/api/missing/all`,
  GET_MISSING_PERSON_BY_ID: `/api/missing/case`,
  UPDATE_MISSING_PERSON_STATUS: `/api/missing/case`,
  GET_OFFICER_CASES: `/api/missing/officer`,
  GET_USER_REPORTS: `/api/missing/user`,
  GET_STATISTICS: `/api/missing/statistics`,
  GET_DETECTION_MATCHES: `/api/missing/detection-matches`,
  LIVE_DETECTION: `/api/missing/live-detect`,
  SAVE_MATCH_RESULT: `/api/missing/save-match`,
  WEBCAM_STREAM: `/api/missing/webcam-stream`,
  WEBCAM_CAPTURE: `/api/missing/webcam-capture`,
  WEBCAM_FRAME: `/api/missing/webcam-frame`,
  // GAN endpoints
  GAN_STATUS: `/api/gan/status`,
  GAN_AGE_FACE: `/api/gan/age-face`,
  GAN_ENHANCE_FACE: `/api/gan/enhance-face`,
  GAN_VARIATIONS: `/api/gan/variations`,
  GAN_RESTORE_FACE: `/api/gan/restore-face`,
  GAN_SYNTHETIC: `/api/gan/synthetic`,
  // Notifications endpoints
  GET_NOTIFICATIONS: `/api/notifications`,
};

export default API_BASE_URL;
