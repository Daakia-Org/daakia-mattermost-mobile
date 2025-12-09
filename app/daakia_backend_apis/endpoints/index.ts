// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Config from '@assets/config.json';

// Base API URL from config
export const API_BASE_URL = Config.BackendApiUrl;

// API version prefix
const API_VERSION = '/v2.0';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
    SEND_OTP: `${API_VERSION}/auth/send/otp`,
    VERIFY_OTP: `${API_VERSION}/auth/verify/otp`,
} as const;

// Mobile Auth endpoints
export const MOBILE_AUTH_ENDPOINTS = {
    LIST_ORGANIZATIONS: `${API_VERSION}/mobile-auth/list-organizations`,
    GENERATE_MATTERMOST_TOKEN: `${API_VERSION}/mobile-auth/generate-mattermost-token`,
} as const;

