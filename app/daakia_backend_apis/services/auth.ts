// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Platform} from 'react-native';

import {API_BASE_URL, AUTH_ENDPOINTS} from '../endpoints';

export interface SendOTPRequest {
    email?: string;
    country_code?: string;
    mobile_number?: string;
}

export interface SendOTPResponse {
    success: number;
    message?: string;
    data?: {
        request_id: string;
        type: 'email' | 'mobile';
    };
}

export interface VerifyOTPRequest {
    request_id: string;
    otp: string;
    type: 'email' | 'mobile';
}

export interface VerifyOTPResponse {
    success: number;
    message?: string;
    data?: {
        token: string;
    };
}

/**
 * Send OTP to user's email or mobile
 */
export async function sendOTP(request: SendOTPRequest): Promise<SendOTPResponse> {
    const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.SEND_OTP}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            platform: Platform.OS, // 'ios' or 'android'
        },
        body: JSON.stringify(request),
    });

    return response.json();
}

/**
 * Verify OTP and get Daakia token
 */
export async function verifyOTP(request: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.VERIFY_OTP}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            platform: Platform.OS, // 'ios' or 'android'
        },
        body: JSON.stringify(request),
    });

    return response.json();
}

